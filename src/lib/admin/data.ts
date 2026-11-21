import "server-only";
import { getWriteClient } from "@/sanity/writeClient";

export const FULFILMENT = ["to-pack", "packed", "shipped", "delivered", "cancelled"] as const;
export type Fulfilment = (typeof FULFILMENT)[number];
export const FULFILMENT_LABEL: Record<Fulfilment, string> = {
  "to-pack": "To pack",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type AdminOrder = {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: "pending" | "paid";
  /** Paid with a Razorpay test key: no real money moved. */
  testMode: boolean;
  fulfilment: Fulfilment;
  item: "original" | "print";
  artworkTitle: string;
  artworkCode?: string;
  artworkSlug?: string;
  artworkImage?: string;
  priceINR: number;
  shippingINR: number;
  totalINR: number;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  courier?: string;
  trackingNumber?: string;
  adminNotes?: string;
  customer: { name: string; email: string; phone: string; address1: string; address2?: string; city: string; state: string; postalCode: string; country: string };
};

const ORDER_FIELDS = `_id, razorpayOrderId, razorpayPaymentId, status, "testMode": testMode == true, "fulfilment": coalesce(fulfilment, "to-pack"), "item": coalesce(item, "original"),
  artworkTitle, "artworkCode": artwork->code, "artworkSlug": artwork->slug.current, "artworkImage": artwork->image.asset->url, priceINR, shippingINR, totalINR,
  createdAt, paidAt, shippedAt, deliveredAt, courier, trackingNumber, adminNotes, customer`;

export const validOrderId = (id: string) => /^order_[A-Za-z0-9]{6,40}$/.test(id);

/** Orders, newest first. Orders are private documents, so they are read with the server's token. */
export async function listOrders(filter: "all" | "paid" | "unpaid" | "test" | Fulfilment = "paid"): Promise<AdminOrder[]> {
  const sanity = getWriteClient();
  if (!sanity) return [];
  const where =
    filter === "all"
      ? ""
      : filter === "paid"
        ? `&& status == "paid"`
        : filter === "unpaid"
          ? `&& status != "paid"`
          : filter === "test"
            ? `&& testMode == true`
            : `&& status == "paid" && testMode != true && coalesce(fulfilment, "to-pack") == $f`;
  return sanity.fetch<AdminOrder[]>(`*[_type == "order" ${where}] | order(coalesce(paidAt, createdAt) desc)[0...300] { ${ORDER_FIELDS} }`, { f: filter });
}

export async function getOrder(razorpayOrderId: string): Promise<AdminOrder | null> {
  const sanity = getWriteClient();
  if (!sanity || !validOrderId(razorpayOrderId)) return null;
  return sanity.fetch<AdminOrder | null>(`*[_id == $id][0]{ ${ORDER_FIELDS} }`, { id: `order.${razorpayOrderId}` });
}

export type StockRow = {
  _id: string;
  title: string;
  code?: string;
  slug?: string;
  image?: string;
  stock: number;
  reservedUntil?: string;
  /** True while a buyer's 15-minute hold is still running. */
  held: boolean;
  priceOriginalINR?: number;
  pricePrintINR?: number;
  originalsSold: number;
  printsSold: number;
};

export async function listStock(): Promise<StockRow[]> {
  const sanity = getWriteClient();
  if (!sanity) return [];
  return sanity.fetch<StockRow[]>(
    `*[_type == "artwork"] | order(code asc) { _id, title, code, "slug": slug.current, "image": image.asset->url, "stock": coalesce(stock, 1), reservedUntil, "held": defined(reservedUntil) && dateTime(reservedUntil) > dateTime(now()), priceOriginalINR, pricePrintINR,
      "originalsSold": count(*[_type == "order" && status == "paid" && testMode != true && artwork._ref == ^._id && coalesce(item, "original") == "original"]),
      "printsSold": count(*[_type == "order" && status == "paid" && testMode != true && artwork._ref == ^._id && item == "print"]) }`,
  );
}

export async function dashboardNumbers() {
  const sanity = getWriteClient();
  if (!sanity) return null;
  // The month starts at midnight in India (UTC+5:30).
  const india = new Date(Date.now() + 5.5 * 3_600_000);
  const monthStartISO = new Date(Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), 1) - 5.5 * 3_600_000).toISOString();
  return sanity.fetch<{
    toPack: number; packed: number; shipped: number; delivered: number; unpaid: number; testPaid: number;
    monthTotal: number | null; monthCount: number; allTotal: number | null; allCount: number;
    soldOut: number; inStock: number;
  }>(
    `{
      "toPack": count(*[_type == "order" && status == "paid" && testMode != true && coalesce(fulfilment, "to-pack") == "to-pack"]),
      "packed": count(*[_type == "order" && status == "paid" && testMode != true && fulfilment == "packed"]),
      "shipped": count(*[_type == "order" && status == "paid" && testMode != true && fulfilment == "shipped"]),
      "delivered": count(*[_type == "order" && status == "paid" && testMode != true && fulfilment == "delivered"]),
      "unpaid": count(*[_type == "order" && status != "paid"]),
      "testPaid": count(*[_type == "order" && status == "paid" && testMode == true]),
      "monthTotal": math::sum(*[_type == "order" && status == "paid" && testMode != true && fulfilment != "cancelled" && paidAt >= $m].totalINR),
      "monthCount": count(*[_type == "order" && status == "paid" && testMode != true && fulfilment != "cancelled" && paidAt >= $m]),
      "allTotal": math::sum(*[_type == "order" && status == "paid" && testMode != true && fulfilment != "cancelled"].totalINR),
      "allCount": count(*[_type == "order" && status == "paid" && testMode != true && fulfilment != "cancelled"]),
      "soldOut": count(*[_type == "artwork" && defined(priceOriginalINR) && coalesce(stock, 1) <= 0]),
      "inStock": count(*[_type == "artwork" && defined(priceOriginalINR) && coalesce(stock, 1) > 0])
    }`,
    { m: monthStartISO },
  );
}
