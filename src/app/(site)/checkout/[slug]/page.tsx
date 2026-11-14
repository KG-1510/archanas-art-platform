import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArtworkImage } from "@/components/ArtworkCard";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getArtwork, getArtworks, getShippingRates } from "@/lib/content";
import { formatINR, formatSize } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((a) => ({ slug: a.slug }));
}

export default function CheckoutPage({ params }: PageProps<"/checkout/[slug]">) {
  return (
    <Suspense fallback={<div className="shell min-h-[70vh]" aria-busy="true" />}>
      <Checkout params={params} />
    </Suspense>
  );
}

async function Checkout({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [artwork, shipping] = await Promise.all([getArtwork(slug), getShippingRates()]);
  if (!artwork) notFound();

  const unavailable = artwork.status !== "available" || artwork.sample;

  return (
    <div className="shell grid gap-14 pt-12 pb-24 md:grid-cols-[1.2fr_0.8fr] md:gap-20 md:pt-20 md:pb-32">
      <div>
        <p className="eyebrow">Guest checkout</p>
        <h1 className="mt-5 text-5xl md:text-6xl">Complete your purchase</h1>

        {unavailable ? (
          <div className="mt-10 flex flex-col items-start gap-6">
            <p className="text-lg text-muted">
              {artwork.sample ? "This is a sample listing and cannot be bought." : "Sorry, this painting has been sold."}
            </p>
            <Link href="/shop" className="btn">
              See available works
            </Link>
          </div>
        ) : (
          <div className="mt-12">
            <CheckoutForm slug={artwork.slug} priceINR={artwork.priceINR} shipping={shipping} />
          </div>
        )}
      </div>

      <aside aria-label="Order summary" className="md:sticky md:top-28 md:self-start">
        <div className="border border-line bg-surface p-4">
          <ArtworkImage artwork={artwork} sizes="(min-width: 768px) 32vw, 92vw" className="aspect-[4/5]" />
        </div>
        <h2 className="mt-5 text-3xl">{artwork.title}</h2>
        <p className="mt-1 text-sm text-muted">
          {artwork.medium} · {formatSize(artwork.widthIn, artwork.heightIn)}
        </p>
        <p className="mt-2 font-normal tabular-nums">{formatINR(artwork.priceINR)}</p>
        <p className="mt-6 text-sm text-muted">
          One-off original. The painting is held for you for 15 minutes once you start payment.
        </p>
      </aside>
    </div>
  );
}
