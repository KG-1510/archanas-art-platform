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
  /** The frame has glass, which is removed before the original is couriered. */
  hasGlass?: boolean;
  /** The painting helps with Vaastu compliance. */
  vaastu?: boolean;
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
  /** Width divided by height of the main photo. */
  imageAspect?: number;
  /** Product code, e.g. AA-0001. */
  code?: string;
};

export type PurchaseItem = "original" | "print";

export type Service = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  details: string[];
  /** A photo for this service, set in Sanity. */
  imageUrl?: string;
  imageAlt?: string;
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

export interface Book {
  _id: string;
  title: string;
  subtitle?: string;
  coverUrl: string;
  /** Width divided by height of the front cover. */
  coverAspect?: number;
  backCoverUrl?: string;
  description: string;
  highlights: string[];
  /** Missing until the Amazon link is added in the studio. */
  amazonUrl?: string;
  year?: number;
}

/** A photo with its pixel size, so the page can reserve the right space for it. */
export type SizedPhoto = { url: string; alt?: string; width: number; height: number };

