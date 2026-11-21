import Image from "next/image";
import { site } from "@/lib/site";
import { ClipReveal } from "./Reveal";

/** The portrait of the artist, in the same thin frame as the paintings. The file is public/dr-archana-gupta.jpg. */
export function ArtistPortrait({ sizes, priority = false, className = "" }: { sizes: string; priority?: boolean; className?: string }) {
  return (
    <figure className={className}>
      <ClipReveal className="overflow-hidden border border-line bg-surface p-3 md:p-4">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src="/dr-archana-gupta.jpg"
            alt={`${site.artist}, artist, art educator and author`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
        </div>
      </ClipReveal>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-sm text-muted">
        <span className="font-display text-xl text-ink">{site.artist}</span>
        <span>Artist, educator, author</span>
      </figcaption>
    </figure>
  );
}
