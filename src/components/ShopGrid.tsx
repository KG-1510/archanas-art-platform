"use client";

import { useMemo, useState } from "react";
import type { Artwork } from "@/lib/types";
import { ArtworkCard } from "./ArtworkCard";

export function ShopGrid({ artworks }: { artworks: Artwork[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(artworks.map((a) => a.category)))], [artworks]);
  const [category, setCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  const shown = artworks.filter(
    (a) => (category === "All" || a.category === category) && (!availableOnly || a.status === "available"),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-y border-line py-5">
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
        <label className="flex cursor-pointer items-center gap-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-muted">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 accent-oxblood"
          />
          Available only
        </label>
      </div>

      <p role="status" className="mt-6 text-sm text-muted">
        {shown.length} {shown.length === 1 ? "work" : "works"}
      </p>

      {shown.length ? (
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <ArtworkCard key={a._id} artwork={a} />
          ))}
        </div>
      ) : (
        <p className="mt-16 font-display text-3xl">Nothing matches that filter right now.</p>
      )}
    </div>
  );
}
