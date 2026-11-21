// Types for the Annnimate Diagonal Gallery (the component ships as JSX).
import type { ForwardRefExoticComponent, RefAttributes } from "react";

/** `text` is inserted as HTML (it may contain <b>), so pass only escaped or trusted text. */
export type DiagonalPhoto = { title: string; text: string; image: string; alt: string };

export type DiagonalGalleryProps = {
  className?: string;
  step?: number;
  duration?: number;
  thumb?: number;
  photos?: DiagonalPhoto[];
  headline?: string;
  headlineDim?: string;
};

declare const DiagonalGallery: ForwardRefExoticComponent<DiagonalGalleryProps & RefAttributes<{ refresh: () => void }>>;
export default DiagonalGallery;
