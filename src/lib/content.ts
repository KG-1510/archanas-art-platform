import { cacheLife, cacheTag } from "next/cache";
import { readClient } from "@/sanity/client";
import { seedArtworks, seedLegal, seedServices, seedShipping } from "./seed";
import type { Artwork, LegalPage, Service, ShippingRates } from "./types";

const ARTWORK_FIELDS = `_id, title, "slug": slug.current, category, medium, widthIn, heightIn, year,
  priceINR, status, "description": coalesce(description, ""), "imageUrl": image.asset->url,
  "imageAlt": image.alt, featured`;

export async function getArtworks(): Promise<Artwork[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks");
  if (!readClient) return seedArtworks;
  const rows = await readClient.fetch<Artwork[]>(
    `*[_type == "artwork" && defined(slug.current)] | order(status asc, _createdAt desc) { ${ARTWORK_FIELDS} }`,
  );
  return rows.length ? rows : seedArtworks;
}

export async function getArtwork(slug: string): Promise<Artwork | null> {
  const all = await getArtworks();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  const featured = all.filter((a) => a.featured);
  return (featured.length ? featured : all).slice(0, 3);
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  if (!readClient) return seedServices;
  const rows = await readClient.fetch<Service[]>(
    `*[_type == "service"] | order(coalesce(order, 99) asc) { _id, title, "slug": slug.current, summary, "details": coalesce(details, []) }`,
  );
  return rows.length ? rows : seedServices;
}

export async function getLegalPage(slug: LegalPage["slug"]): Promise<LegalPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("legal");
  const fallback = seedLegal.find((p) => p.slug === slug)!;
  if (!readClient) return fallback;
  const row = await readClient.fetch<LegalPage | null>(
    `*[_type == "legalPage" && slug == $slug][0]{ slug, title, updated, "intro": coalesce(intro, ""), "sections": coalesce(sections[]{heading, body}, []) }`,
    { slug },
  );
  return row ?? fallback;
}

export async function getShippingRates(): Promise<ShippingRates> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  if (!readClient) return seedShipping;
  const row = await readClient.fetch<{ indiaINR?: number; internationalINR?: number } | null>(
    `*[_type == "siteSettings"][0]{ "indiaINR": shippingIndiaINR, "internationalINR": shippingInternationalINR }`,
  );
  return {
    indiaINR: row?.indiaINR ?? seedShipping.indiaINR,
    internationalINR: row?.internationalINR ?? seedShipping.internationalINR,
  };
}
