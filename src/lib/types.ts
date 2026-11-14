export type ArtworkStatus = "available" | "sold";

export type Artwork = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  medium: string;
  widthIn: number;
  heightIn: number;
  year?: number;
  priceINR: number;
  status: ArtworkStatus;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  featured?: boolean;
  /** True for built-in sample listings shown before Sanity is connected. */
  sample?: boolean;
};

export type Service = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  details: string[];
};

export type LegalSection = { heading: string; body: string };

export type LegalPage = {
  slug: "privacy" | "terms" | "shipping-returns";
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type ShippingRates = { indiaINR: number; internationalINR: number };
