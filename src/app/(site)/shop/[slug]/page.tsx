import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtworkImage } from "@/components/ArtworkCard";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getArtwork, getArtworks, getShippingRates } from "@/lib/content";
import { formatINR, formatSize, formatSizeWithCm, originalAvailable, printAvailable } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import { site, whatsappLink } from "@/lib/site";

// Cache Components needs at least one path to prerender; this one simply 404s.
const NO_PAINTINGS = [{ slug: "-" }];

export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.length ? artworks.map((a) => ({ slug: a.slug })) : NO_PAINTINGS;
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtwork(slug);
  if (!artwork) return {};
  return pageMeta(
    `/shop/${artwork.slug}`,
    artwork.title,
    shareText(artwork),
    // The whole painting on the site's mat colour, at the size link previews expect. JPEG keeps it small enough for WhatsApp.
    artwork.imageUrl ? `${artwork.imageUrl}?w=1200&h=630&fit=fill&bg=f0eae0&fm=jpg&q=80` : undefined,
  );
}

/** The line shown under the name in a link preview: the start of the description, then the facts. */
function shareText(artwork: { title: string; description: string; medium: string; widthIn: number; heightIn: number }) {
  const facts = `${artwork.medium}, ${formatSize(artwork.widthIn, artwork.heightIn)}. By ${site.artist}.`;
  const first = artwork.description.split("\n")[0].trim();
  if (!first) return `${artwork.title}: ${facts}`;
  const lead = first.length > 150 ? `${first.slice(0, first.lastIndexOf(" ", 150))}…` : first;
  return `${lead} ${facts}`;
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

  const url = `${site.url}/shop/${artwork.slug}`;
  const hasOriginal = typeof artwork.priceOriginalINR === "number";
  const canBuyOriginal = originalAvailable(artwork);
  const canBuyPrint = printAvailable(artwork);

  const offers = [
    hasOriginal
      ? {
          "@type": "Offer",
          name: "Original",
          url,
          price: artwork.priceOriginalINR,
          priceCurrency: "INR",
          availability: canBuyOriginal ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          seller: { "@id": `${site.url}/#studio` },
        }
      : null,
    canBuyPrint
      ? {
          "@type": "Offer",
          name: "Print",
          url,
          price: artwork.pricePrintINR,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          seller: { "@id": `${site.url}/#studio` },
        }
      : null,
  ].filter(Boolean);

  return (
    <article className="shell grid gap-12 pt-10 pb-24 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:pt-16 md:pb-32">
      <div className="unveil md:sticky md:top-28 md:self-start">
        <div className="border border-line bg-surface p-4 md:p-6">
          <ArtworkImage artwork={artwork} priority natural sizes="(min-width: 768px) 52vw, 92vw" className="aspect-[4/5]" />
        </div>
        {artwork.gallery.length ? (
          <ul aria-label="More photographs" className="mt-4 grid grid-cols-4 gap-3">
            {artwork.gallery.map((photo) => (
              <li key={photo.url}>
                <a
                  href={`${photo.url}?w=1800&auto=format`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-square overflow-hidden border border-line bg-surface"
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt || `${artwork.title}, detail`}
                    fill
                    sizes="(min-width: 768px) 12vw, 22vw"
                    className="object-cover transition-transform duration-700 ease-luxe hover:scale-105"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <nav aria-label="Breadcrumb" className="rise text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted">
          <Link href="/shop" className="hover:text-oxblood">
            Marketplace
          </Link>{" "}
          / <span>{artwork.category}</span>
        </nav>

        <h1 className="rise rise-2 mt-6 text-5xl md:text-7xl">{artwork.title}</h1>
        {/* Sits above the text below it, so its menu is never covered. */}
        <div className="relative z-10 mt-5">
          <ShareButton title={`${artwork.title} — ${site.name}`} text={`${artwork.title}, by ${site.artist}.`} url={url} />
        </div>

        {artwork.description ? <p className="rise rise-3 mt-8 max-w-xl whitespace-pre-line text-muted">{artwork.description}</p> : null}

        <dl className="rise rise-3 mt-10 grid grid-cols-[11rem_1fr] gap-y-4 border-y border-line py-8 text-[0.95rem]">
          <dt className="eyebrow self-center">Medium</dt>
          <dd>{artwork.medium}</dd>
          <dt className="eyebrow self-center">Size (L × W)</dt>
          <dd>{formatSizeWithCm(artwork.widthIn, artwork.heightIn)}</dd>
          {artwork.framed && artwork.framedWidthIn && artwork.framedHeightIn ? (
            <>
              <dt className="eyebrow self-center">With frame (L × W)</dt>
              <dd>{formatSizeWithCm(artwork.framedWidthIn, artwork.framedHeightIn)}</dd>
            </>
          ) : null}
          <dt className="eyebrow self-center">Framing</dt>
          <dd>{artwork.framed ? "Framed" : "Unframed"}</dd>
          {artwork.year ? (
            <>
              <dt className="eyebrow self-center">Year</dt>
              <dd>{artwork.year}</dd>
            </>
          ) : null}
          {artwork.code ? (
            <>
              <dt className="eyebrow self-center">Code</dt>
              <dd className="tabular-nums">{artwork.code}</dd>
            </>
          ) : null}
          <dt className="eyebrow self-center">Courier</dt>
          <dd>
            India {formatINR(shipping.indiaINR)} · International {formatINR(shipping.internationalINR)}
            <span className="block text-sm text-muted">Standard courier. Charges are subject to change.</span>
          </dd>
        </dl>

        {/* Two ways to buy: the original, and a print. */}
        <div className="rise rise-4 mt-10 flex flex-col gap-5">
          {hasOriginal ? (
            <section aria-label="Original" className="flex flex-wrap items-center justify-between gap-4 border border-line p-5">
              <div>
                <h2 className="font-display text-2xl">Original</h2>
                <p className="mt-1 text-sm text-muted">
                  {canBuyOriginal ? "The painting itself, signed by the artist." : "The original has found a home."}
                </p>
              </div>
              {canBuyOriginal ? (
                <div className="flex flex-wrap items-center gap-5">
                  <p className="text-2xl font-medium tabular-nums">{formatINR(artwork.priceOriginalINR!)}</p>
                  <Link href={`/checkout/${artwork.slug}?item=original`} className="btn">
                    Buy the original
                  </Link>
                </div>
              ) : (
                <p className="eyebrow text-base">Sold</p>
              )}
            </section>
          ) : null}

          {canBuyPrint ? (
            <section aria-label="Print" className="flex flex-wrap items-center justify-between gap-4 border border-line p-5">
              <div>
                <h2 className="font-display text-2xl">Print</h2>
                <p className="mt-1 text-sm text-muted">{artwork.printDetails || "A reproduction of this painting."}</p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <p className="text-2xl font-medium tabular-nums">{formatINR(artwork.pricePrintINR!)}</p>
                <Link href={`/checkout/${artwork.slug}?item=print`} className={canBuyOriginal ? "btn btn-ghost" : "btn"}>
                  Buy a print
                </Link>
              </div>
            </section>
          ) : null}

          <a
            href={whatsappLink(`Hello, I am interested in "${artwork.title}"${artwork.code ? `, code ${artwork.code}` : ""} (${url}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost self-start"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Ask on WhatsApp
          </a>
        </div>

        <p className="mt-8 max-w-xl text-sm text-muted">
          Secure payment by Razorpay. See{" "}
          <Link href="/shipping-returns" className="underline underline-offset-4 hover:text-oxblood">
            shipping and returns
          </Link>
          .
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
          ...(artwork.code ? { sku: artwork.code } : {}),
          artform: artwork.category,
          creator: { "@type": "Person", name: site.artist },
          width: { "@type": "QuantitativeValue", value: artwork.widthIn, unitCode: "INH" },
          height: { "@type": "QuantitativeValue", value: artwork.heightIn, unitCode: "INH" },
          dateCreated: artwork.year ? String(artwork.year) : undefined,
          offers,
        }}
      />
    </article>
  );
}
