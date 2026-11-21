import Image from "next/image";
import { getClassPhotos } from "@/lib/content";
import type { SizedPhoto } from "@/lib/types";
import { ClipReveal } from "./Reveal";

function Photo({ p, sizes }: { p: SizedPhoto; sizes: string }) {
  return (
    <ClipReveal className="overflow-hidden border border-line bg-surface p-2 md:p-2.5">
      {/* Opens the full-size photograph, since many are collages with small details.
          `relative` keeps the hidden screen-reader text inside this card: without it, the text is placed
          against the page and, in the phone's swipe row, stretched the whole page sideways. */}
      <a href={`${p.url}?auto=format`} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden">
        <Image
          src={p.url}
          alt={p.alt || "Students of Archana's Art with work made in class"}
          width={p.width}
          height={p.height}
          sizes={sizes}
          quality={90}
          className="h-auto w-full transition-transform duration-700 hover:scale-[1.03]"
        />
        <span className="sr-only">(opens the full-size photograph in a new tab)</span>
      </a>
    </ClipReveal>
  );
}

/**
 * Photographs from the classes, kept in Sanity (Site settings → Class and student photos).
 * - `limit` set (homepage): a staggered row of the first few; a row you swipe sideways on a phone.
 * - no limit (services page): every photograph, in columns.
 * Renders nothing until photos have been added.
 */
export async function StudentGallery({ limit }: { limit?: number }) {
  const photos = await getClassPhotos();
  if (!photos.length) return null;
  if (limit) {
    return (
      <ul className="shell flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:snap-none md:grid-cols-5 md:items-start md:gap-5 md:overflow-visible md:pb-0">
        {photos.slice(0, limit).map((p, i) => (
          <li key={p.url} className={`w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto ${i % 2 ? "md:mt-14" : ""}`}>
            <Photo p={p} sizes="(min-width: 768px) 19vw, 72vw" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="shell columns-2 gap-4 md:columns-3 md:gap-5 xl:columns-4">
      {photos.map((p) => (
        <li key={p.url} className="mb-4 break-inside-avoid md:mb-5">
          <Photo p={p} sizes="(min-width: 1280px) 23vw, (min-width: 768px) 31vw, 46vw" />
        </li>
      ))}
    </ul>
  );
}
