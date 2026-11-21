// Types and labels shared by the admin pages and their browser-side components. No server code here.

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

