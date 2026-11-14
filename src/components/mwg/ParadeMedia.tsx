import { variantFor } from "@/components/ArtworkCard";
import type { Artwork } from "@/lib/types";

/**
 * The `.media` children for the Made With GSAP parade effects (122, 123):
 * the painting's photograph, or its painted placeholder until one is uploaded.
 * Decorative here, so hidden from screen readers; the works are listed elsewhere.
 */
export function ParadeMedia({ artworks }: { artworks: Artwork[] }) {
  return (
    <>
      {artworks.map((a) =>
        a.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={a._id} className="media" src={`${a.imageUrl}?w=480&auto=format`} alt="" loading="lazy" decoding="async" />
        ) : (
          <div key={a._id} className={`media ${variantFor(a._id)}`} aria-hidden="true" />
        ),
      )}
    </>
  );
}
