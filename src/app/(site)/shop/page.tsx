import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { ShopGrid } from "@/components/ShopGrid";
import { getArtworks } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata = pageMeta(
  "/shop",
  "Marketplace",
  "Buy original, one-off paintings, mandala and Nippon art by Dr. Archana Gupta. Couriered across India and internationally.",
);

export default async function ShopPage() {
  const artworks = await getArtworks();

  return (
    <>
      <PageIntro eyebrow="Our marketplace" title="Original works, each sold only once">
        <p>Every piece here is a single original. When it is sold, it is gone. Couriered across India and abroad.</p>
      </PageIntro>

      <section aria-label="Artworks" className="shell pb-24 md:pb-32">
        <ShopGrid artworks={artworks} />
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Artworks for sale at Archana's Art",
          itemListElement: artworks.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${site.url}/shop/${a.slug}`,
            name: a.title,
          })),
        }}
      />
    </>
  );
}
