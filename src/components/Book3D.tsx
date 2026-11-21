"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Props = {
  title: string;
  coverUrl: string;
  backCoverUrl?: string;
  /** Width divided by height of the front cover. */
  aspect?: number;
  /** Which way the book leans at rest. */
  lean?: "left" | "right";
};

const REST = { x: 5, y: 26 };

/**
 * A book standing in 3D: front cover, spine, page edges and (when there is
 * one) a back cover. It turns in as it scrolls into view, drifts gently, leans
 * toward the pointer, and can be turned round to read the back. Without motion
 * (reduced-motion setting) it simply stands at its resting angle.
 */
export function Book3D({ title, coverUrl, backCoverUrl, aspect = 2 / 3, lean = "left" }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const sign = lean === "left" ? -1 : 1;
  /** The resting turn of the book: its lean, plus half a turn when it is showing its back. */
  const base = () => sign * REST.y + (flippedRef.current ? 180 : 0);

  useGSAP(
    () => {
      const el = book.current;
      const area = stage.current;
      if (!el || !area) return;
      gsap.set(el, { rotationY: sign * REST.y, rotationX: REST.x });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance: the book swings round from edge-on the first time it is seen.
        gsap.set(el, { rotationY: sign * 96, y: 70, autoAlpha: 0 });
        const io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io.disconnect();
            gsap.to(el, { rotationY: base(), y: 0, autoAlpha: 1, duration: 1.8, ease: "expo.out" });
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        io.observe(area);

        // A slow drift, on the wrapper so it never fights the tilt.
        const float = gsap.to(area.querySelector(".book3d-float"), { y: -14, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

        // Lean toward the pointer.
        const toY = gsap.quickTo(el, "rotationY", { duration: 0.9, ease: "power3.out" });
        const toX = gsap.quickTo(el, "rotationX", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          const r = area.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          toY(base() + px * 34);
          toX(REST.x - py * 18);
        };
        const leave = () => {
          toY(base());
          toX(REST.x);
        };
        area.addEventListener("pointermove", move);
        area.addEventListener("pointerleave", leave);
        return () => {
          io.disconnect();
          float.kill();
          area.removeEventListener("pointermove", move);
          area.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: stage },
  );

  const flip = () => {
    const next = !flippedRef.current;
    flippedRef.current = next;
    setFlipped(next);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Also brings the book fully in, in case it is turned before its entrance has finished.
    gsap.to(book.current, { rotationY: base(), rotationX: REST.x, y: 0, autoAlpha: 1, duration: reduced ? 0 : 1.2, ease: "expo.inOut", overwrite: true });
  };

  return (
    <div className="book3d-wrap">
      <div ref={stage} className={`book3d-stage ${aspect > 1 ? "is-wide" : ""}`}>
        <div className="book3d-disc" aria-hidden="true" />
        <div className="book3d-float">
          <div ref={book} className="book3d" style={{ aspectRatio: aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="book3d-face book3d-front" src={`${coverUrl}?w=900&auto=format`} alt={`Front cover of ${title}`} decoding="async" />
            {/* Not lazy-loaded: the browser treats a face turned away as off screen and would never fetch it. */}
            {backCoverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="book3d-face book3d-back" src={`${backCoverUrl}?w=900&auto=format`} alt={`Back cover of ${title}`} decoding="async" />
            ) : (
              <div className="book3d-face book3d-back" aria-hidden="true" />
            )}
            {/* The spine takes the colour of the cover's own edge. */}
            <div className="book3d-spine" aria-hidden="true" style={{ backgroundImage: `url(${coverUrl}?w=900&auto=format)` }} />
            <div className="book3d-pages" aria-hidden="true" />
          </div>
        </div>
        <div className="book3d-shadow" aria-hidden="true" />
      </div>
      {backCoverUrl ? (
        <button type="button" onClick={flip} aria-pressed={flipped} className="btn btn-ghost mt-10">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
          {flipped ? "Back to the front cover" : "Turn to the back cover"}
        </button>
      ) : null}
    </div>
  );
}
