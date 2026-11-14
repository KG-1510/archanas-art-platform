import { getArtworks } from "@/lib/content";
import { site } from "@/lib/site";

/** Public, read-only catalogue as JSON. Used by the WebMCP tools and open to any agent. */
export async function GET() {
  const artworks = await getArtworks();
  return Response.json({
    currency: "INR",
    artworks: artworks.map((a) => ({
      title: a.title,
      slug: a.slug,
      url: `${site.url}/shop/${a.slug}`,
      markdown: `${site.url}/shop/${a.slug}.md`,
      category: a.category,
      medium: a.medium,
      widthIn: a.widthIn,
      heightIn: a.heightIn,
      year: a.year ?? null,
      priceINR: a.priceINR,
      status: a.status,
      sample: Boolean(a.sample),
      description: a.description,
    })),
  });
}
