import type { Metadata } from "next";
import { site } from "./site";

/**
 * Page metadata: canonical URL, a pointer to the page's Markdown twin, and the
 * Open Graph / Twitter tags that WhatsApp, iMessage and social apps read to build
 * a link preview. Pass `image` for pages with their own picture (a painting);
 * otherwise the site-wide preview image, public/og.jpg, is used.
 */
/** Site-wide link preview picture: 1200 × 630 JPEG, kept small so WhatsApp shows it. */
export const defaultShareImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name} | ${site.tagline}`,
  type: "image/jpeg",
};

export function pageMeta(path: string, title: string | undefined, description: string, image?: string): Metadata {
  const md = path === "/" ? "/index.md" : `${path}.md`;
  const shareTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline}`;
  const images = [image ? { url: image, width: 1200, height: 630, alt: title || site.name } : defaultShareImage];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path, types: { "text/markdown": md } },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_IN",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images },
  };
}
