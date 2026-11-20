import type { MetadataRoute } from "next";
import { getArtworks } from "@/lib/content";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await getArtworks();
  const pages = ["", "/shop", "/services", "/about", "/books", "/contact", "/shipping-returns", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}` })),
    ...artworks.map((a) => ({ url: `${site.url}/shop/${a.slug}` })),
  ];
}
