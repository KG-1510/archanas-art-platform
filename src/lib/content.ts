import { cacheLife, cacheTag } from "next/cache";
import { readClient } from "@/sanity/client";
import { seedLegal, seedServices, seedShipping } from "./seed";
import type { Artwork, Book, LegalPage, Photo, Service, SizedPhoto, ShippingRates, Testimonial, Workshop } from "./types";

// Field names on the website differ slightly from the studio's, so the mapping lives here.
const ARTWORK_FIELDS = `_id, title, "slug": slug.current, category, medium, widthIn, heightIn,
  "framed": framed == "framed", framedWidthIn, framedHeightIn, "hasGlass": framed == "framed" && hasGlass == true, "vaastu": vaastu == true, year,
  "description": coalesce(description, ""),
  "imageUrl": image.asset->url, "imageAlt": image.alt, "imageAspect": image.asset->metadata.dimensions.aspectRatio,
  "gallery": coalesce(additionalImages[defined(asset)]{ "url": asset->url, alt }, []),
  priceOriginalINR, "stock": coalesce(stock, 1), pricePrintINR, printDetails, featured, code`;

/** Every published painting that has a web address and at least one price. Empty until content is added. */
export async function getArtworks(): Promise<Artwork[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artworks");
  if (!readClient) return [];
  return readClient.fetch<Artwork[]>(
    `*[_type == "artwork" && defined(slug.current) && (defined(priceOriginalINR) || defined(pricePrintINR))]
      | order(_createdAt desc) { ${ARTWORK_FIELDS} }`,
  );
}

export async function getArtwork(slug: string): Promise<Artwork | null> {
  const all = await getArtworks();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getFeaturedArtworks(): Promise<Artwork[]> {
  const all = await getArtworks();
  const featured = all.filter((a) => a.featured);
  // Up to six, by name (so "… - 1" comes before "… - 6"): the homepage shows all six on wide
  // screens and the first three on phones.
  return (featured.length ? featured : all)
    .slice()
    .sort((x, y) => x.title.localeCompare(y.title, "en", { numeric: true }))
    .slice(0, 6);
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  if (!readClient) return seedServices;
  const rows = await readClient.fetch<Service[]>(
    `*[_type == "service" && defined(slug.current)] | order(coalesce(order, 99) asc) { _id, title, "slug": slug.current, summary, "details": coalesce(details, []), "imageUrl": image.asset->url, "imageAlt": image.alt }`,
  );
  return rows.length ? rows : seedServices;
}

/** Workshops and class batches that have not finished yet, soonest first. */
export async function getUpcomingWorkshops(): Promise<Workshop[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("workshops");
  if (!readClient) return [];
  return readClient.fetch<Workshop[]>(
    `*[_type == "workshop" && coalesce(endDate, startDate) >= string::split(string(now()), "T")[0]]
      | order(startDate asc) { _id, title, kind, startDate, endDate, schedule, location, feeINR, seats, description }`,
  );
}

/** Books written by the artist, in the order set in the studio. Empty until some are added. */
export async function getBooks(): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("books");
  if (!readClient) return [];
  return readClient.fetch<Book[]>(
    `*[_type == "book" && defined(cover.asset)] | order(coalesce(order, 99) asc, _createdAt desc) {
      _id, title, subtitle, "coverUrl": cover.asset->url, "coverAspect": cover.asset->metadata.dimensions.aspectRatio,
      "backCoverUrl": backCover.asset->url, "description": coalesce(description, ""),
      "highlights": coalesce(highlights, []), amazonUrl, year }`,
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  if (!readClient) return [];
  return readClient.fetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(coalesce(order, 99) asc, _createdAt desc)[0...3] { _id, quote, name, context }`,
  );
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

type Settings = { shipping: ShippingRates; aboutPhotos: Photo[]; classPhotos: SizedPhoto[] };

async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  const empty: Settings = { shipping: seedShipping, aboutPhotos: [], classPhotos: [] };
  if (!readClient) return empty;
  const row = await readClient.fetch<{ indiaINR?: number; internationalINR?: number; aboutPhotos?: Photo[]; classPhotos?: SizedPhoto[] } | null>(
    `*[_type == "siteSettings"][0]{ "indiaINR": shippingIndiaINR, "internationalINR": shippingInternationalINR,
      "aboutPhotos": coalesce(aboutPhotos[defined(asset)]{ "url": asset->url, alt }, []),
      "classPhotos": coalesce(classPhotos[defined(asset)]{ "url": asset->url, alt,
        "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }, []) }`,
  );
  return {
    shipping: {
      indiaINR: row?.indiaINR ?? seedShipping.indiaINR,
      internationalINR: row?.internationalINR ?? seedShipping.internationalINR,
    },
    aboutPhotos: row?.aboutPhotos ?? [],
    classPhotos: row?.classPhotos ?? [],
  };
}

export async function getShippingRates(): Promise<ShippingRates> {
  return (await getSettings()).shipping;
}

/** Photos of classes and students' work, managed in Sanity → Site settings. */
export async function getClassPhotos(): Promise<SizedPhoto[]> {
  return (await getSettings()).classPhotos;
}

export async function getAboutPhotos(): Promise<Photo[]> {
  return (await getSettings()).aboutPhotos;
}
