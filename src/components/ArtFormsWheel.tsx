"use client";

import RotatingWords from "./annnimate/rotating-words";

/**
 * "All under one roof": the Annnimate Rotating Words wheel, turned by the
 * scroll, listing what is taught and made at the studio. Colours and type are
 * set under .aa-wheel in globals.css.
 */
export function ArtFormsWheel({ words }: { words: string[] }) {
  return (
    <section className="aa-wheel rw_page" aria-label="What is taught and made at the studio">
      <div className="rw_track" data-anm-rw-track="">
        <div className="rw_stage">
          <div className="aa-wheel-label">
            <p className="eyebrow">Taught and made here</p>
            <p className="mt-3 font-display text-[9vw] font-medium leading-none md:text-[4.3vw]">
              All under <em className="text-brass">one roof</em>
            </p>
          </div>
          <RotatingWords words={words} scrub spin={1.4} settle={0.15} step={20} start="top 75%" nav blur={6} />
        </div>
      </div>
    </section>
  );
}
