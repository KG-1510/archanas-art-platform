import "server-only";
import { formatINR } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Order emails, sent through Brevo's transactional email API. Nothing is sent until
 * BREVO_API_KEY and ORDERS_FROM_EMAIL are set, so the shop works without email.
 * A failed email never fails an order: errors are logged (without addresses) and swallowed.
 */
type OrderForEmail = {
  razorpayOrderId: string;
  item: string;
  artworkTitle: string;
  priceINR: number;
  shippingINR: number;
  totalINR: number;
  courier?: string;
  trackingNumber?: string;
  customer: { name: string; email: string; phone: string; address1: string; address2?: string; city: string; state: string; postalCode: string; country: string };
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.ORDERS_FROM_EMAIL);
}

async function send(to: string, subject: string, lines: string[], replyTo?: string) {
  const key = process.env.BREVO_API_KEY;
  // The sender's address, on a domain or sender verified in Brevo. For example orders@archanasart.in
  const from = process.env.ORDERS_FROM_EMAIL;
  if (!key || !from) return false;
  const html = `<div style="font-family:Georgia,serif;color:#1f1a17;line-height:1.6;max-width:560px">${lines
    .map((l) => (l ? `<p style="margin:0 0 14px">${esc(l).replace(/\n/g, "<br>")}</p>` : ""))
    .join("")}<p style="margin:28px 0 0;color:#6b625b;font-size:14px">${esc(site.name)} · ${esc(site.phoneDisplay)} · ${esc(site.url)}</p></div>`;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { name: site.name, email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: lines.filter(Boolean).join("\n\n"),
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      }),
    });
    if (!res.ok) console.error("email: send failed with status", res.status);
    return res.ok;
  } catch {
    console.error("email: could not reach the email service");
    return false;
  }
}

const what = (o: OrderForEmail) => `${o.artworkTitle} (${o.item === "print" ? "print" : "original painting"})`;
const address = (o: OrderForEmail) =>
  [o.customer.name, o.customer.address1, o.customer.address2, `${o.customer.city}, ${o.customer.state} ${o.customer.postalCode}`, o.customer.country].filter(Boolean).join("\n");
const reference = (o: OrderForEmail) => o.razorpayOrderId.replace(/^order_/, "");

/** To the buyer and to the studio, once, when a payment is confirmed. */
export async function sendOrderEmails(o: OrderForEmail) {
  const studio = process.env.ORDERS_NOTIFY_EMAIL;
  await Promise.all([
    send(
      o.customer.email,
      `Your order from ${site.name}: ${o.artworkTitle}`,
      [
        `Dear ${o.customer.name},`,
        `Thank you. We have received your payment of ${formatINR(o.totalINR)} for ${what(o)}.`,
        `It will be packed with care and sent by courier to:\n${address(o)}`,
        "We will write again with the courier name and tracking number once it is on its way.",
        `Order reference: ${reference(o)}. For anything at all, reply to this email or message us on WhatsApp at ${site.phoneDisplay}.`,
      ],
      studio,
    ),
    studio
      ? send(
          studio,
          `New order: ${o.artworkTitle} (${o.item}) · ${formatINR(o.totalINR)}`,
          [
            `A new order has been paid: ${what(o)}.`,
            `Price ${formatINR(o.priceINR)} + courier ${formatINR(o.shippingINR)} = ${formatINR(o.totalINR)}.`,
            `Send to:\n${address(o)}\n${o.customer.phone}\n${o.customer.email}`,
            `Open it in the admin panel: ${site.url}/admin/orders/${o.razorpayOrderId}`,
          ],
          o.customer.email,
        )
      : Promise.resolve(false),
  ]);
}

/** To the buyer, when the studio marks the order shipped. */
export function sendShippedEmail(o: OrderForEmail) {
  return send(
    o.customer.email,
    `On its way: ${o.artworkTitle}`,
    [
      `Dear ${o.customer.name},`,
      `Your ${what(o)} has been sent.`,
      o.courier || o.trackingNumber ? `Courier: ${o.courier || "to be confirmed"}\nTracking number: ${o.trackingNumber || "to be confirmed"}` : "",
      `It is going to:\n${address(o)}`,
      `Order reference: ${reference(o)}. If it has not arrived when you expect it, reply to this email or message us on WhatsApp at ${site.phoneDisplay}.`,
    ],
    process.env.ORDERS_NOTIFY_EMAIL,
  );
}
