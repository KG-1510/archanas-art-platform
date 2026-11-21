"use client";

import DiagonalGallery from "./annnimate/diagonal-gallery";
import type { Service } from "@/lib/types";

// The gallery inserts the text as HTML, so anything typed in Sanity is escaped first.
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * "From first brushstroke to finished piece": the Annnimate Diagonal Gallery.
 * The section holds the screen while you scroll; each step brings the next
 * service's photo to the middle with its name and summary beside it.
 * Colours and type are set under .aa-diagonal in globals.css.
 */
export function ServicesGallery({ services }: { services: Service[] }) {
  return (
    <DiagonalGallery
      className="aa-diagonal"
      headline="From first brushstroke"
      headlineDim="to finished piece"
      step={70}
      duration={0.9}
      thumb={22}
      photos={services.map((s) => ({
        title: s.title,
        text: escape(s.summary),
        // A tall crop to suit the frame; Sanity serves WebP or AVIF where the browser takes it.
        image: `${s.imageUrl}?w=900&h=1200&fit=crop&auto=format&q=85`,
        alt: s.imageAlt || s.title,
      }))}
    />
  );
}
