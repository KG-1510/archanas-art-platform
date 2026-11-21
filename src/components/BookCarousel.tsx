"use client";

import { Children, useState, type ReactNode } from "react";

/**
 * Shows one book at a time, with arrows and a row of dots to move between them.
 * Each child is one book's section, already rendered; `titles` names them for the controls.
 */
export function BookCarousel({ titles, children }: { titles: string[]; children: ReactNode }) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const go = (i: number) => setIndex((i + count) % count);
  if (count <= 1) return <>{slides}</>;

  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      onClick={() => go(index + dir)}
      aria-label={dir === -1 ? "Previous book" : "Next book"}
      className="grid h-12 w-12 place-items-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-ivory"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={dir === -1 ? "M14.5 6 8.5 12l6 6" : "m9.5 6 6 6-6 6"} />
      </svg>
    </button>
  );

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Books by Dr. Archana Gupta">
      {slides.map((slide, i) => (
        <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}: ${titles[i] ?? ""}`} hidden={i !== index} className={i === index ? "book-slide" : undefined}>
          {slide}
        </div>
      ))}
      <div className="shell flex flex-wrap items-center justify-between gap-6 pb-20 md:pb-28">
        <div className="flex min-w-0 flex-wrap gap-2" role="tablist" aria-label="Choose a book">
          {titles.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => go(i)}
              className={`border px-4 py-2 text-[0.8rem] font-medium uppercase tracking-[0.16em] transition-colors ${i === index ? "border-oxblood bg-oxblood text-ivory" : "border-line hover:border-oxblood"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm tabular-nums text-muted" aria-live="polite">
            {index + 1} / {count}
          </span>
          {arrow(-1)}
          {arrow(1)}
        </div>
      </div>
    </div>
  );
}
