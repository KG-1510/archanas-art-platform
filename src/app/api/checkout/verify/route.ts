import { NextResponse } from "next/server";
import { getRazorpay, markOrderPaid, signatureMatches } from "@/lib/orders";

/** Confirms a completed Razorpay payment using the signature Razorpay returns to the browser. */
export async function POST(request: Request) {
  const razorpay = getRazorpay();
  if (!razorpay) return NextResponse.json({ error: "Payments are not set up." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (!signatureMatches(`${orderId}|${paymentId}`, razorpay.keySecret, signature)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const result = await markOrderPaid(orderId, paymentId);
  if (!result.ok) return NextResponse.json({ error: "Payment received, but the order could not be updated. We will contact you." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
