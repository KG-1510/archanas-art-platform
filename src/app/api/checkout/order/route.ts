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
  priceOriginalINR?: number;
  pricePrintINR?: number;
  stock: number;
  reservedUntil?: string;
};

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
const validPrice = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n > 0;

/**
 * Creates a Razorpay order for one painting, as the original or as a print.
 * An original is held for the buyer while they pay; prints have no stock limit.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  const parsed = parseOrderRequest(json);
  if (!parsed.ok) return fail(400, parsed.error);
  const { slug, item, customer } = parsed.value;

  const sanity = getWriteClient();
  const razorpay = getRazorpay();
  if (!sanity || !razorpay) return fail(503, "Online payment is not set up yet. Please contact the studio on WhatsApp.");

  // Always read price and availability fresh from the source, never from the browser.
  const artwork = await sanity.fetch<FreshArtwork | null>(
    `*[_type == "artwork" && slug.current == $slug][0]{ _id, _rev, title, priceOriginalINR, pricePrintINR, "stock": coalesce(stock, 1), reservedUntil }`,
    { slug },
  );
  if (!artwork) return fail(404, "This painting could not be found.");

  const isOriginal = item === "original";
  const priceINR = isOriginal ? artwork.priceOriginalINR : artwork.pricePrintINR;
  if (!validPrice(priceINR)) {
    return fail(409, isOriginal ? "The original of this painting is not for sale online." : "Prints of this painting are not available.");
  }

  if (isOriginal) {
    if (artwork.stock <= 0) return fail(409, "Sorry, the original has just been sold.");
    // With more than one in stock, a hold by another buyer does not block this one.
    if (artwork.stock === 1 && artwork.reservedUntil && new Date(artwork.reservedUntil).getTime() > Date.now()) {
      return fail(409, "Someone else is checking out with this painting right now. Please try again in a few minutes.");
    }
  }

  const rates = await getShippingRates();
  const shippingINR = isIndia(customer.country) ? rates.indiaINR : rates.internationalINR;
  const totalINR = priceINR + shippingINR;

  // Hold the original. ifRevisionId makes this fail if another buyer got there first.
  if (isOriginal) {
    const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60_000).toISOString();
    try {
      await sanity.patch(artwork._id).ifRevisionId(artwork._rev).set({ reservedUntil }).commit();
    } catch {
      return fail(409, "Someone else is checking out with this painting right now. Please try again in a few minutes.");
    }
  }

  try {
    const rzpOrder = await razorpay.client.orders.create({
      amount: totalINR * 100,
      currency: "INR",
      receipt: `art_${Date.now()}`,
      notes: { artworkId: artwork._id, slug, item },
    });

    await sanity.createOrReplace({
      _id: `order.${rzpOrder.id}`,
      _type: "order",
      status: "pending",
      item,
      artwork: { _type: "reference", _ref: artwork._id },
      artworkTitle: artwork.title,
      priceINR,
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
      description: `${artwork.title} (${isOriginal ? "original" : "print"})`,
    });
  } catch (err) {
    // Release the hold so the painting is not stuck if order creation failed.
    if (isOriginal) await sanity.patch(artwork._id).unset(["reservedUntil"]).commit().catch(() => {});
    console.error("checkout: order creation failed", err instanceof Error ? err.message : "unknown error");
    return fail(502, "We could not start the payment. Please try again.");
  }
}
