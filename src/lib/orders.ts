import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import Razorpay from "razorpay";
import { sendOrderEmails } from "@/lib/email";
import { getWriteClient } from "@/sanity/writeClient";

export const RESERVATION_MINUTES = 15;

export function getRazorpay() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return { client: new Razorpay({ key_id, key_secret }), keyId: key_id, keySecret: key_secret };
}

/** Constant-time comparison of an HMAC-SHA256 hex signature. */
export function signatureMatches(payload: string, secret: string, signature: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Marks an order paid and, for an original, takes it out of stock. Safe to call more than once:
 * both the checkout callback and the Razorpay webhook call it.
 */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const sanity = getWriteClient();
  if (!sanity) return { ok: false as const, reason: "not-configured" };
  if (!/^order_[A-Za-z0-9]+$/.test(razorpayOrderId)) return { ok: false as const, reason: "bad-id" };

  const orderDocId = `order.${razorpayOrderId}`;
  const order = await sanity.getDocument<{ _id: string; status?: string; item?: string; artwork?: { _ref: string } }>(orderDocId);
  if (!order) return { ok: false as const, reason: "unknown-order" };
  if (order.status === "paid") return { ok: true as const };

  const tx = sanity
    .transaction()
    .patch(orderDocId, (p) => p.set({ status: "paid", razorpayPaymentId, paidAt: new Date().toISOString() }));
  // Buying an original takes one out of stock and releases the hold. Prints have no stock.
  if (order.artwork?._ref && order.item !== "print") {
    tx.patch(order.artwork._ref, (p) => p.setIfMissing({ stock: 1 }).dec({ stock: 1 }).unset(["reservedUntil"]));
  }
  await tx.commit();
  revalidateTag("artworks", { expire: 0 });

  // Tell the buyer and the studio. This runs once per order (a second call returns above),
  // and a failed email never undoes a paid order.
  try {
    const paid = await sanity.fetch<Parameters<typeof sendOrderEmails>[0] | null>(
      `*[_id == $id][0]{ razorpayOrderId, "item": coalesce(item, "original"), artworkTitle, priceINR, shippingINR, totalINR, customer }`,
      { id: orderDocId },
    );
    if (paid?.customer?.email) await sendOrderEmails(paid);
  } catch {
    console.error("orders: confirmation email step failed");
  }
  return { ok: true as const };
}
