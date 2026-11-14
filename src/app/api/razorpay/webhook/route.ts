import { NextResponse } from "next/server";
import { markOrderPaid, signatureMatches } from "@/lib/orders";

/**
 * Razorpay webhook. A safety net for when the buyer pays but closes the tab
 * before the browser can confirm. Subscribe it to the "payment.captured" event.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured." }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!signature || !signatureMatches(raw, secret, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    if (payment?.id && payment.order_id) await markOrderPaid(payment.order_id, payment.id);
  }
  return NextResponse.json({ ok: true });
}
