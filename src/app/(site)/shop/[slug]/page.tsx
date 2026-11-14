import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtworkImage } from "@/components/ArtworkCard";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtwork, getArtworks, getShippingRates } from "@/lib/content";
import { formatINR, formatSize } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};
  return pageMeta(
    `/shop/${artwork.slug}`,
    artwork.title,
    `${artwork.title}: ${artwork.medium}, ${formatSize(artwork.widthIn, artwork.heightIn)}. An original by ${site.artist}.`,
    artwork.imageUrl ? `${artwork.imageUrl}?w=1200&h=630&fit=crop&auto=format` : undefined,
  );
}

export default function ArtworkPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<div className="shell min-h-[70vh]" aria-busy="true" />}>
      <ArtworkDetail params={params} />
    </Suspense>
  );
}

async function ArtworkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [artwork, shipping] = await Promise.all([getArtwork(slug), getShippingRates()]);
  if (!artwork) notFound();

  const sold = artwork.status === "sold";
  const url = `${site.url}/shop/${artwork.slug}`;

  return (
    <article className="shell grid gap-12 pt-10 pb-24 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:pt-16 md:pb-32">
      <div className="unveil md:sticky md:top-28 md:self-start">
        <div className="border border-line bg-surface p-4 md:p-6">
          <ArtworkImage artwork={artwork} priority sizes="(min-width: 768px) 52vw, 92vw" className="aspect-[4/5]" />
        </div>
      </div>

      <div>
        <nav aria-label="Breadcrumb" className="rise text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted">
          <Link href="/shop" className="hover:text-oxblood">
            Marketplace
          </Link>{" "}
          / <span>{artwork.category}</span>
        </nav>

        <h1 className="rise rise-2 mt-6 text-5xl md:text-7xl">{artwork.title}</h1>
        <p className="rise rise-3 mt-6 text-2xl font-normal tabular-nums">
          {sold ? <span className="eyebrow text-base">Sold</span> : formatINR(artwork.priceINR)}
        </p>

        {artwork.description ? <p className="rise rise-3 mt-8 max-w-xl whitespace-pre-line text-muted">{artwork.description}</p> : null}

        <dl className="rise rise-4 mt-10 grid grid-cols-[8rem_1fr] gap-y-4 border-y border-line py-8 text-[0.95rem]">
          <dt className="eyebrow self-center">Medium</dt>
          <dd>{artwork.medium}</dd>
          <dt className="eyebrow self-center">Size</dt>
          <dd>{formatSize(artwork.widthIn, artwork.heightIn)}</dd>
          {artwork.year ? (
            <>
              <dt className="eyebrow self-center">Year</dt>
              <dd>{artwork.year}</dd>
            </>
          ) : null}
          <dt className="eyebrow self-center">Edition</dt>
          <dd>One-off original, signed by the artist</dd>
          <dt className="eyebrow self-center">Courier</dt>
          <dd>
            India {formatINR(shipping.indiaINR)} · International {formatINR(shipping.internationalINR)}
          </dd>
        </dl>

        <div className="rise rise-4 mt-10 flex flex-wrap gap-4">
          {sold ? (
            <Link href="/shop" className="btn">
              See available works
            </Link>
          ) : artwork.sample ? (
            <span className="btn" aria-disabled="true">
              Sample listing, not for sale
            </span>
          ) : (
            <Link href={`/checkout/${artwork.slug}`} className="btn">
              Buy this painting
            </Link>
          )}
          <a
            href={whatsappLink(`Hello, I am interested in "${artwork.title}" (${url}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </div>

        <p className="mt-8 max-w-xl text-sm text-muted">
          Secure payment by Razorpay. See <Link href="/shipping-returns" className="underline underline-offset-4 hover:text-oxblood">shipping and returns</Link>.
        </p>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Product", "VisualArtwork"],
          name: artwork.title,
          description: artwork.description || undefined,
          image: artwork.imageUrl || undefined,
          url,
          artMedium: artwork.medium,
          artform: artwork.category,
          creator: { "@type": "Person", name: site.artist },
          width: { "@type": "QuantitativeValue", value: artwork.widthIn, unitCode: "INH" },
          height: { "@type": "QuantitativeValue", value: artwork.heightIn, unitCode: "INH" },
          dateCreated: artwork.year ? String(artwork.year) : undefined,
          offers: {
            "@type": "Offer",
            url,
            price: artwork.priceINR,
            priceCurrency: "INR",
            availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${site.url}/#studio` },
          },
        }}
      />
    </article>
  );
}
