// Brand facts. Mirrors docs/BRAND.md.

/** The live address. Used for link previews, the sitemap, llms.txt and structured data. */
export const PRODUCTION_URL = "https://archanasart.in";

// NEXT_PUBLIC_SITE_URL overrides this (for a preview deployment, say). Otherwise
// production builds use the live domain and local development uses localhost.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  name: "Archana's Art",
  artist: "Dr. Archana Gupta",
  tagline: "Original paintings and art classes in Bengaluru",
  description:
    "Archana's Art is the studio of Dr. Archana Gupta in Bengaluru: original one-off paintings to buy, and classes, workshops and demos across art forms, drawing on 40+ years of teaching and creating.",
  url: siteUrl,
  phoneDisplay: "+91 89716 85880",
  phoneE164: "+918971685880",
  whatsappNumber: "918971685880",
  /** The art studio. This is the business address used in the footer, contact page and structured data. */
  studio: {
    line1: "2nd Floor, A1 Market",
    line2: "Near Nitesh Forest Hills, Seegehalli, Krishnarajapuram",
    city: "Bengaluru",
    postalCode: "560115",
    region: "Karnataka",
    country: "IN",
  },
  /** The residence, where classes are also held. */
  address: {
    line1: "3041, Prestige Tranquility",
    line2: "Off Old Madras Road",
    city: "Bengaluru",
    postalCode: "560049",
    region: "Karnataka",
    country: "IN",
  },
  maps: {
    studio: "https://maps.app.goo.gl/8rvRL8QJHBRyYCvv8",
    residence: "https://share.google/jaq5bEkhkZrzt4VD9",
  },
  social: {
    instagram: "https://www.instagram.com/archanasartspace/",
    youtube: "https://www.youtube.com/@archanagupt",
    facebook: "https://www.facebook.com/ArchanasArt/",
  },
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const nav = [
  { href: "/shop", label: "Marketplace" },
  { href: "/services", label: "Services" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
] as const;
