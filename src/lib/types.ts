export type Photo = { url: string; alt?: string };

export type Artwork = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  medium: string;
  /** Size of the painting itself (the sheet or canvas), in inches. */
  widthIn: number;
  heightIn: number;
  framed: boolean;
  /** Outer size including the frame, in inches. Only for framed works. */
  framedWidthIn?: number;
  framedHeightIn?: number;
  year?: number;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Extra photographs: close-ups, signature, on a wall. */
  gallery: Photo[];
  /** Price of the original. Absent when the original is not for sale. */
  priceOriginalINR?: number;
  /** Originals in stock. 0 means the original is sold. */
  stock: number;
  /** Price of a print. Absent when no prints are sold. Prints have no stock limit. */
  pricePrintINR?: number;
  printDetails?: string;
  featured?: boolean;
};

export type PurchaseItem = "original" | "print";

export type Service = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  details: string[];
};

export type Workshop = {
  _id: string;
  title: string;
  kind: string;
  startDate: string;
  endDate?: string;
  schedule?: string;
  location: string;
  feeINR?: number;
  seats?: number;
  description?: string;
};

export type Testimonial = { _id: string; quote: string; name: string; context?: string };

export type LegalSection = { heading: string; body: string };

export type LegalPage = {
  slug: "privacy" | "terms" | "shipping-returns";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type ShippingRates = { indiaINR: number; internationalINR: number };
