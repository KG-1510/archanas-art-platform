import Image from "next/image";
import Link from "next/link";
import { formatINR, formatSize, originalAvailable, printAvailable } from "@/lib/format";
import type { Artwork } from "@/lib/types";
import { ClipReveal } from "./Reveal";

/**
 * The painting's photograph, always shown whole (never cropped). In a fixed-shape frame it sits
 * on the mat colour; with `natural` the frame takes the photo's own shape.
 */
export function ArtworkImage({
  artwork,
  sizes,
  priority = false,
  natural = false,
  className = "",
}: {
  artwork: Artwork;
  sizes: string;
  priority?: boolean;
  natural?: boolean;
  className?: string;
}) {
  const alt = artwork.imageAlt || `${artwork.title}, ${artwork.medium}`;
  return (
    <div
      className={`relative overflow-hidden bg-surface ${className}`}
      // Capped between a tall 9:16 and a wide 16:9, so one extreme photo cannot dominate a page.
      style={natural && artwork.imageAspect ? { aspectRatio: Math.min(16 / 9, Math.max(9 / 16, artwork.imageAspect)) } : undefined}
    >
      {artwork.imageUrl ? (
        <Image src={artwork.imageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
      ) : (
        <div role="img" aria-label={`${alt} (photograph coming soon)`} className="absolute inset-0 grid place-items-center text-sm text-muted">
          Photograph coming soon
        </div>
      )}
    </div>
  );
}

/** Price line for a card: original price or "Original sold", plus the print price if prints are sold. */
export function PriceLine({ artwork }: { artwork: Artwork }) {
  const hasOriginal = typeof artwork.priceOriginalINR === "number";
  return (
    <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem] font-medium tabular-nums">
      {hasOriginal ? (
        originalAvailable(artwork) ? (
          <span>{formatINR(artwork.priceOriginalINR!)}</span>
        ) : (
          <span className="eyebrow">Original sold</span>
        )
      ) : null}
      {printAvailable(artwork) ? (
        <span className="text-sm font-normal text-muted">Print {formatINR(artwork.pricePrintINR!)}</span>
      ) : null}
    </p>
  );
}

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <article className="art-card group flex flex-col">
      <Link href={`/shop/${artwork.slug}`} className="block">
        <ClipReveal className="overflow-hidden border border-line bg-surface p-3 transition-colors duration-500 group-hover:border-brass">
          <ArtworkImage
            artwork={artwork}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            natural
            className="art-photo aspect-[4/5]"
          />
        </ClipReveal>
        <div className="mt-5 flex flex-col gap-1">
          <h3 className="font-display text-2xl transition-colors duration-300 group-hover:text-oxblood">{artwork.title}</h3>
          <p className="text-sm text-muted">
            {artwork.medium} · {formatSize(artwork.widthIn, artwork.heightIn)}
          </p>
          <PriceLine artwork={artwork} />
        </div>
      </Link>
    </article>
  );
}
