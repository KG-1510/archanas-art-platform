import Image from "next/image";
import Link from "next/link";
import { formatINR, formatSize } from "@/lib/format";
import type { Artwork } from "@/lib/types";

const VARIANTS = ["art-a", "art-b", "art-c", "art-d", "art-e", "art-f"];

function variantFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return VARIANTS[h % VARIANTS.length];
}

/** The artwork photograph, or a painted placeholder until one is uploaded. */
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
        <div role="img" aria-label={`Placeholder for ${alt}`} className={`absolute inset-0 ${variantFor(artwork._id)}`} />
      )}
    </div>
  );
}

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const sold = artwork.status === "sold";
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
          <p className="mt-1 text-[0.95rem] font-normal tabular-nums">
            {sold ? <span className="eyebrow">Sold</span> : formatINR(artwork.priceINR)}
            {artwork.sample ? <span className="ml-3 text-xs text-muted">Sample listing</span> : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
