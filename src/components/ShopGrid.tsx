"use client";

import { useMemo, useState } from "react";
import { isBuyable, originalAvailable, printAvailable } from "@/lib/format";
import type { Artwork } from "@/lib/types";
import { ArtworkCard } from "./ArtworkCard";

const AVAILABILITY = [
  { key: "any", label: "Originals and prints" },
  { key: "original", label: "Original available" },
  { key: "print", label: "Print available" },
] as const;

// By the longer side of the sheet, in inches.
const SIZES = [
  { key: "any", label: "Any size" },
  { key: "small", label: "Small (up to 12 in)", test: (n: number) => n <= 12 },
  { key: "medium", label: "Medium (12 to 24 in)", test: (n: number) => n > 12 && n <= 24 },
  { key: "large", label: "Large (over 24 in)", test: (n: number) => n > 24 },
];

const PRICES = [
  { key: "any", label: "Any price" },
  { key: "a", label: "Under ₹5,000", test: (p: number) => p < 5000 },
  { key: "b", label: "₹5,000 to ₹10,000", test: (p: number) => p >= 5000 && p <= 10000 },
  { key: "c", label: "₹10,000 to ₹25,000", test: (p: number) => p > 10000 && p <= 25000 },
  { key: "d", label: "Over ₹25,000", test: (p: number) => p > 25000 },
];

const FRAMING = [
  { key: "any", label: "Framed or unframed" },
  { key: "framed", label: "Framed" },
  { key: "unframed", label: "Unframed" },
];

// The first one is the order the gallery opens in.
const SORTS = [
  { key: "name", label: "Name, A to Z" },
  { key: "newest", label: "Newest first" },
  { key: "low", label: "Price, low to high" },
  { key: "high", label: "Price, high to low" },
];

/** Every price a painting can be bought at right now (original and print). */
function prices(a: Artwork) {
  const list: number[] = [];
  if (originalAvailable(a)) list.push(a.priceOriginalINR!);
  if (printAvailable(a)) list.push(a.pricePrintINR!);
  return list;
}
/** The lowest of those, for sorting. Sold-out works sort by their listed price. */
const lowest = (a: Artwork) => Math.min(...(prices(a).length ? prices(a) : [a.priceOriginalINR ?? a.pricePrintINR ?? Infinity]));

const INITIAL = { q: "", form: "any", medium: "any", size: "any", price: "any", framing: "any", availability: "any" };

/**
 * The marketplace: a search box, filters and sorting over every painting.
 * All of it runs in the browser on the list the page was built with.
 */
export function ShopGrid({ artworks }: { artworks: Artwork[] }) {
  const [f, setF] = useState(INITIAL);
  const [sort, setSort] = useState("name");
  const [open, setOpen] = useState(false); // search and filter sheet on phones
  const set = (key: keyof typeof INITIAL, value: string) => setF((prev) => ({ ...prev, [key]: value }));

  const forms = useMemo(() => Array.from(new Set(artworks.map((a) => a.category).filter(Boolean))).sort(), [artworks]);
  const mediums = useMemo(() => Array.from(new Set(artworks.map((a) => a.medium).filter(Boolean))).sort(), [artworks]);

  const shown = useMemo(() => {
    const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    const size = SIZES.find((s) => s.key === f.size);
    const price = PRICES.find((p) => p.key === f.price);
    const list = artworks.filter((a) => {
      if (words.length) {
        const text = [a.title, a.code, a.medium, a.category, a.description, a.year].filter(Boolean).join(" ").toLowerCase();
        if (!words.every((w) => text.includes(w))) return false;
      }
      if (f.form !== "any" && a.category !== f.form) return false;
      if (f.medium !== "any" && a.medium !== f.medium) return false;
      if (size?.test && !size.test(Math.max(a.widthIn, a.heightIn))) return false;
      if (f.framing !== "any" && a.framed !== (f.framing === "framed")) return false;
      if (f.availability === "original" && !originalAvailable(a)) return false;
      if (f.availability === "print" && !printAvailable(a)) return false;
      // A price range matches if the painting can be bought at any price inside it.
      if (price?.test && !prices(a).some(price.test)) return false;
      return true;
    });
    const byNewest = (a: Artwork, b: Artwork) => artworks.indexOf(a) - artworks.indexOf(b);
    list.sort((a, b) => {
      if (sort === "low") return lowest(a) - lowest(b) || byNewest(a, b);
      if (sort === "high") return lowest(b) - lowest(a) || byNewest(a, b);
      if (sort === "name") return a.title.localeCompare(b.title, "en", { numeric: true });
      // Newest first, with works that can still be bought ahead of sold ones.
      return Number(isBuyable(b)) - Number(isBuyable(a)) || byNewest(a, b);
    });
    return list;
  }, [artworks, f, sort]);

  const active = (Object.keys(INITIAL) as (keyof typeof INITIAL)[]).filter((k) => f[k] !== INITIAL[k]).length;
  const select = (label: string, key: keyof typeof INITIAL, options: { key: string; label: string }[]) => (
    <label className="field">
      <span>{label}</span>
      <select value={f[key]} onChange={(e) => set(key, e.target.value)}>
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div>
      {/* Phones: search and filters live in a sheet behind a floating button, so paintings come first. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="shop-panel"
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2.5 bg-oxblood px-5 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-ivory shadow-lg shadow-ink/15 md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M7 12h10M10 17h4" />
        </svg>
        Search &amp; filter{active ? ` (${active})` : ""}
      </button>
      {open ? <button type="button" aria-label="Close search and filters" onClick={() => setOpen(false)} className="fixed inset-0 z-[55] cursor-default bg-ink/45 md:hidden" /> : null}

      <div
        id="shop-panel"
        data-lenis-prevent
        className={`border border-line bg-surface p-5 md:block md:p-7 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-[60] max-md:max-h-[85dvh] max-md:overflow-y-auto max-md:border-x-0 max-md:border-b-0 max-md:shadow-2xl ${open ? "block" : "hidden"}`}
      >
        <div className="mb-6 flex items-center justify-between md:hidden">
          <p className="font-display text-2xl">Search and filter</p>
          <button type="button" onClick={() => setOpen(false)} className="link-line">
            Close
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-5">
          <label className="field min-w-0 flex-1 basis-72">
            <span>Search the gallery</span>
            <span className="flex items-center gap-3 border-b border-line focus-within:border-oxblood">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                type="search"
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Painting name, code, medium or a word from the description"
                className="!border-0 min-w-0 flex-1"
              />
            </span>
          </label>
          <label className="field basis-56 max-md:basis-full">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div id="shop-filters" className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-7 md:grid-cols-3 xl:grid-cols-6">
          {select("Art form", "form", [{ key: "any", label: "All art forms" }, ...forms.map((x) => ({ key: x, label: x }))])}
          {select("Medium", "medium", [{ key: "any", label: "Any medium" }, ...mediums.map((x) => ({ key: x, label: x }))])}
          {select("Size", "size", SIZES)}
          {select("Price", "price", PRICES)}
          {select("Framing", "framing", FRAMING)}
          {select("Available as", "availability", [...AVAILABILITY])}
        </div>
        <div className="mt-7 flex items-center gap-5 md:hidden">
          <button type="button" onClick={() => setOpen(false)} className="btn flex-1">
            Show {shown.length} {shown.length === 1 ? "work" : "works"}
          </button>
          {active ? (
            <button type="button" onClick={() => setF(INITIAL)} className="link-line">
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap md:mt-7 items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {shown.length === artworks.length
            ? `${shown.length} ${shown.length === 1 ? "work" : "works"}`
            : `${shown.length} of ${artworks.length} works`}
        </p>
        {active ? (
          <button type="button" onClick={() => setF(INITIAL)} className="link-line">
            Clear {active === 1 ? "the filter" : `all ${active} filters`}
          </button>
        ) : null}
      </div>

      {shown.length ? (
        // One even grid: every card has the same frame, so names and prices line up across a row.
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <ArtworkCard key={a._id} artwork={a} uniform />
          ))}
        </div>
      ) : (
        <div className="mt-14 border-y border-line py-16 text-center">
          <p className="font-display text-3xl md:text-4xl">Nothing matches that just now.</p>
          <p className="mt-3 text-muted">Try a different word, or widen the filters.</p>
          <button type="button" onClick={() => setF(INITIAL)} className="btn mt-8">
            Show every work
          </button>
        </div>
      )}
    </div>
  );
}
