import Image from "next/image";
import Link from "next/link";
import { formatINR, formatSize, originalAvailable, printAvailable } from "@/lib/format";
import type { Artwork } from "@/lib/types";

/** The painting's photograph. A plain tinted panel stands in if one is somehow missing. */
export function ArtworkImage({
  artwork,
  sizes,
  priority = false,
  className = "",
}: {
  artwork: Artwork;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const alt = artwork.imageAlt || `${artwork.title}, ${artwork.medium}`;
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {artwork.imageUrl ? (
        <Image src={artwork.imageUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
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
    <article className="group flex flex-col">
      <Link href={`/shop/${artwork.slug}`} className="block">
        <div className="border border-line bg-surface p-3 transition-colors duration-500 group-hover:border-brass">
          <ArtworkImage
            artwork={artwork}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="aspect-[4/5] transition-transform duration-[1200ms] ease-luxe group-hover:scale-[1.02]"
          />
        </div>
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
