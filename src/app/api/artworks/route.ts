import { getArtworks } from "@/lib/content";
import { originalAvailable, printAvailable } from "@/lib/format";
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
      framed: a.framed,
      framedWidthIn: a.framedWidthIn ?? null,
      framedHeightIn: a.framedHeightIn ?? null,
      year: a.year ?? null,
      original: {
        priceINR: a.priceOriginalINR ?? null,
        available: originalAvailable(a),
      },
      print: {
        priceINR: a.pricePrintINR ?? null,
        available: printAvailable(a),
        details: a.printDetails ?? null,
      },
      description: a.description,
    })),
  });
}
