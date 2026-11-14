import { NextResponse } from "next/server";
import { isIndia, parseOrderRequest } from "@/lib/checkout";
import { getShippingRates } from "@/lib/content";
import { RESERVATION_MINUTES, getRazorpay } from "@/lib/orders";
import { site } from "@/lib/site";
import { getWriteClient } from "@/sanity/writeClient";

type FreshArtwork = {
  _id: string;
  _rev: string;
  title: string;
  priceINR: number;
  status: string;
  reservedUntil?: string;
};

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Creates a Razorpay order for one painting and holds the painting for the buyer. */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  const parsed = parseOrderRequest(json);
  if (!parsed.ok) return fail(400, parsed.error);
  const { slug, customer } = parsed.value;

  const sanity = getWriteClient();
  const razorpay = getRazorpay();
  if (!sanity || !razorpay) return fail(503, "Online payment is not set up yet. Please contact the studio on WhatsApp.");

  // Always read price and availability fresh from the source, never from the browser.
  const artwork = await sanity.fetch<FreshArtwork | null>(
    `*[_type == "artwork" && slug.current == $slug][0]{ _id, _rev, title, priceINR, status, reservedUntil }`,
    { slug },
  );
  if (!artwork) return fail(404, "This painting could not be found.");
  if (artwork.status !== "available") return fail(409, "Sorry, this painting has just been sold.");
  if (artwork.reservedUntil && new Date(artwork.reservedUntil).getTime() > Date.now()) {
    return fail(409, "Someone else is checking out with this painting right now. Please try again in a few minutes.");
  }
  if (!Number.isInteger(artwork.priceINR) || artwork.priceINR <= 0) return fail(409, "This painting is not available to buy online.");

  const rates = await getShippingRates();
  const shippingINR = isIndia(customer.country) ? rates.indiaINR : rates.internationalINR;
  const totalINR = artwork.priceINR + shippingINR;

  // Hold the painting. ifRevisionId makes this fail if another buyer got there first.
  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60_000).toISOString();
  try {
    await sanity.patch(artwork._id).ifRevisionId(artwork._rev).set({ reservedUntil }).commit();
  } catch {
    return fail(409, "Someone else is checking out with this painting right now. Please try again in a few minutes.");
  }

  try {
    const rzpOrder = await razorpay.client.orders.create({
      amount: totalINR * 100,
      currency: "INR",
      receipt: `art_${Date.now()}`,
      notes: { artworkId: artwork._id, slug },
    });

    await sanity.createOrReplace({
      _id: `order.${rzpOrder.id}`,
      _type: "order",
      status: "pending",
      artwork: { _type: "reference", _ref: artwork._id },
      artworkTitle: artwork.title,
      priceINR: artwork.priceINR,
      shippingINR,
      totalINR,
      razorpayOrderId: rzpOrder.id,
      createdAt: new Date().toISOString(),
      customer,
    });

    return NextResponse.json({
      keyId: razorpay.keyId,
      orderId: rzpOrder.id,
      amount: totalINR * 100,
      currency: "INR",
      name: site.name,
      description: artwork.title,
    });
  } catch (err) {
    // Release the hold so the painting is not stuck if order creation failed.
    await sanity.patch(artwork._id).unset(["reservedUntil"]).commit().catch(() => {});
    console.error("checkout: order creation failed", err instanceof Error ? err.message : "unknown error");
    return fail(502, "We could not start the payment. Please try again.");
  }
}
