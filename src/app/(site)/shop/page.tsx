import { JsonLd } from "@/components/JsonLd";
import { PageIntro } from "@/components/PageIntro";
import { ShopGrid } from "@/components/ShopGrid";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtworks } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export const metadata = pageMeta(
  "/shop",
  "Gallery",
  "Browse original paintings and prints by Dr. Archana Gupta. Search by name, medium, size and price. Sent by courier across India and abroad.",
);

export default async function ShopPage() {
  const artworks = await getArtworks();

  return (
    <>
      <PageIntro eyebrow="The gallery" title="Find the painting that feels like yours">
        <p>Original paintings by {site.artist}, each one sold only once, and prints of selected works. Sent by courier across India and abroad.</p>
      </PageIntro>

      <section aria-label="Artworks" className="shell pb-24 md:pb-32">
        {artworks.length ? (
          <ShopGrid artworks={artworks} />
        ) : (
          <div className="flex flex-col items-start gap-6 border-t border-line pt-14">
            <h2 className="text-4xl md:text-5xl">New works are being added.</h2>
            <p className="max-w-xl text-lg text-muted">
              The gallery is being hung. To ask about a painting in the meantime, message {site.artist} directly.
            </p>
            <a
              href={whatsappLink("Hello, I would like to know which paintings are available.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>
        )}
      </section>

      {artworks.length ? (
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
      ) : null}
    </>
  );
}
