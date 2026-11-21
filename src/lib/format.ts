import type { Artwork } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number) {
  return inr.format(amount);
}

const cm = (inches: number) => Math.round(inches * 2.54);

/** "24 × 36 in" */
export function formatSize(widthIn: number, heightIn: number) {
  return `${widthIn} × ${heightIn} in`;
}

/** "24 × 36 in (61 × 91 cm)". Sizes are entered in inches; centimetres are worked out here. */
export function formatSizeWithCm(widthIn: number, heightIn: number) {
  return `${formatSize(widthIn, heightIn)} (${cm(widthIn)} × ${cm(heightIn)} cm)`;
}

/** True when the original can be bought right now. */
export function originalAvailable(a: Artwork) {
  return typeof a.priceOriginalINR === "number" && a.stock > 0;
}

/** True when a print can be bought. */
export function printAvailable(a: Artwork) {
  return typeof a.pricePrintINR === "number";
}

export function isBuyable(a: Artwork) {
  return originalAvailable(a) || printAvailable(a);
}

/** One-line price summary for cards and lists. */
export function priceSummary(a: Artwork) {
  const parts: string[] = [];
  if (typeof a.priceOriginalINR === "number") {
    parts.push(a.stock > 0 ? `Original ${formatINR(a.priceOriginalINR)}` : "Original sold");
  }
  if (typeof a.pricePrintINR === "number") parts.push(`Print ${formatINR(a.pricePrintINR)}`);
  return parts.join(" · ");
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Formats a YYYY-MM-DD date as "14 November 2026". */
export function formatDate(isoDate: string) {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}
