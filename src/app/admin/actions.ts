"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfigured, checkPassword, clearAttempts, endSession, requireAdmin, startSession, tooManyAttempts } from "@/lib/admin/auth";
import { FULFILMENT, getOrder, validOrderId, type Fulfilment } from "@/lib/admin/data";
import { sendShippedEmail } from "@/lib/email";
import { getWriteClient } from "@/sanity/writeClient";

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().replace(/\s+/g, " ").slice(0, max);

export async function login(_prev: string, form: FormData): Promise<string> {
  if (!adminConfigured()) return "The admin panel is not set up yet. Add ADMIN_USERS and ADMIN_SESSION_SECRET.";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooManyAttempts(ip)) return "Too many attempts. Wait ten minutes and try again.";
  const name = checkPassword(text(form, "name", 40), String(form.get("password") ?? ""));
  if (!name) return "That name and password do not match.";
  clearAttempts(ip);
  if (!(await startSession(name))) return "The admin panel is not set up yet.";
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/** Sets where an order has got to, with courier details and a private note. */
export async function updateOrder(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const sanity = getWriteClient();
  if (!sanity || !validOrderId(id)) redirect("/admin/orders");
  const before = await getOrder(id);
  if (!before || before.status !== "paid") redirect(`/admin/orders/${id}?saved=no`);

  const wanted = String(form.get("fulfilment") ?? "");
  const fulfilment: Fulfilment = (FULFILMENT as readonly string[]).includes(wanted) ? (wanted as Fulfilment) : before.fulfilment;
  const now = new Date().toISOString();
  const courier = text(form, "courier", 60);
  const trackingNumber = text(form, "trackingNumber", 60);
  const adminNotes = String(form.get("adminNotes") ?? "").trim().slice(0, 1000);

  const patch = sanity.patch(`order.${id}`).set({ fulfilment, courier, trackingNumber, adminNotes });
  if (fulfilment === "shipped" && !before.shippedAt) patch.set({ shippedAt: now });
  if (fulfilment === "delivered") patch.set({ deliveredAt: before.deliveredAt ?? now, shippedAt: before.shippedAt ?? now });
  await patch.commit();

  // Email the buyer the first time an order is marked shipped, if the box is ticked.
  let emailed = "";
  if (fulfilment === "shipped" && before.fulfilment !== "shipped" && form.get("notify") === "on") {
    emailed = (await sendShippedEmail({ ...before, courier, trackingNumber })) ? "&emailed=yes" : "&emailed=no";
  }
  redirect(`/admin/orders/${id}?saved=yes${emailed}`);
}

/** Corrects the number of originals in stock for one painting. */
export async function setStock(form: FormData) {
  await requireAdmin();
  const sanity = getWriteClient();
  const id = String(form.get("id") ?? "");
  const stock = Number(form.get("stock"));
  if (!sanity || !/^[A-Za-z0-9._-]{1,80}$/.test(id) || id.startsWith("order.") || !Number.isInteger(stock) || stock < 0 || stock > 999) redirect("/admin/stock?saved=no");
  const exists = await sanity.fetch<number>(`count(*[_type == "artwork" && _id == $id])`, { id });
  if (!exists) redirect("/admin/stock?saved=no");
  await sanity.patch(id).set({ stock }).commit();
  revalidateTag("artworks", { expire: 0 });
  redirect("/admin/stock?saved=yes");
}

/** Lets go of a 15-minute hold left by a buyer who did not finish paying. */
export async function releaseHold(form: FormData) {
  await requireAdmin();
  const sanity = getWriteClient();
  const id = String(form.get("id") ?? "");
  if (!sanity || !/^[A-Za-z0-9._-]{1,80}$/.test(id) || id.startsWith("order.")) redirect("/admin/stock?saved=no");
  const exists = await sanity.fetch<number>(`count(*[_type == "artwork" && _id == $id])`, { id });
  if (!exists) redirect("/admin/stock?saved=no");
  await sanity.patch(id).unset(["reservedUntil"]).commit();
  revalidateTag("artworks", { expire: 0 });
  redirect("/admin/stock?saved=yes");
}
