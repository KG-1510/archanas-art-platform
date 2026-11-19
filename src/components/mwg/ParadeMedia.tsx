import type { Artwork } from "@/lib/types";

/**
 * The `.media` children for the Made With GSAP parade effects (122, 123): the
 * paintings' photographs. Decorative here, so hidden from screen readers; the
 * works are listed elsewhere. Only pass paintings that have a photograph.
 */
export function ParadeMedia({ artworks }: { artworks: Artwork[] }) {
  return (
    <>
      {artworks.map((a) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={a._id} className="media" src={`${a.imageUrl}?w=480&auto=format`} alt="" loading="lazy" decoding="async" />
      ))}
    </>
  );
}
