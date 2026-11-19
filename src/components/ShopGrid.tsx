"use client";

import { useMemo, useState } from "react";
import { isBuyable, originalAvailable, printAvailable } from "@/lib/format";
import type { Artwork } from "@/lib/types";
import { ArtworkCard } from "./ArtworkCard";

const SHOW = ["Everything", "Originals available", "Prints available"] as const;

export function ShopGrid({ artworks }: { artworks: Artwork[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(artworks.map((a) => a.category)))], [artworks]);
  const [category, setCategory] = useState("All");
  const [show, setShow] = useState<(typeof SHOW)[number]>("Everything");

  const shown = artworks.filter(
    (a) =>
      (category === "All" || a.category === category) &&
      (show === "Everything" || (show === "Originals available" ? originalAvailable(a) : printAvailable(a))),
  );
  // Works that can still be bought come first; fully sold works follow.
  const ordered = [...shown].sort((a, b) => Number(isBuyable(b)) - Number(isBuyable(a)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-y border-line py-5">
        {categories.length > 2 ? (
          <div role="group" aria-label="Filter by art form" className="flex flex-wrap gap-x-7 gap-y-3">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`text-[0.8rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:text-oxblood ${
                  category === c ? "text-oxblood underline decoration-1 underline-offset-8" : "text-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <label className="flex items-center gap-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted">
          <span>Show</span>
          <select
            value={show}
            onChange={(e) => setShow(e.target.value as (typeof SHOW)[number])}
            className="border-b border-line bg-transparent py-1 font-medium uppercase tracking-[0.12em] text-ink focus:border-oxblood focus:outline-none"
          >
            {SHOW.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="mt-6 text-sm text-muted">
        {ordered.length} {ordered.length === 1 ? "work" : "works"}
      </p>

      {ordered.length ? (
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((a) => (
            <ArtworkCard key={a._id} artwork={a} />
          ))}
        </div>
      ) : (
        <p className="mt-16 font-display text-3xl">Nothing matches that filter right now.</p>
      )}
    </div>
  );
}
