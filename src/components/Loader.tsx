"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-visit curtain: a thin bar fills under the wordmark, then the curtain lifts. Sets html[data-ready] so the
 * hero's entrance starts as the curtain moves. Skipped on later pages in the
 * same visit and for people who prefer reduced motion.
 */
export function Loader() {
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"count" | "lift" | "gone">("count");
  const raf = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    let seen = false;
    try {
      seen = sessionStorage.getItem("aa-loaded") === "1";
    } catch {}
    const start = performance.now();
    const skip = seen || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = 1300;
    const tick = (t: number) => {
      if (skip) {
        root.dataset.ready = "1";
        setPhase("gone");
        return;
      }
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        setPhase("lift");
        root.dataset.ready = "1";
        try {
          sessionStorage.setItem("aa-loaded", "1");
        } catch {}
        setTimeout(() => setPhase("gone"), 1000);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      aria-hidden="true"
      className={`aa-loader fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 overflow-hidden bg-oxblood-deep px-6 text-ivory transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${phase === "lift" ? "-translate-y-full" : ""}`}
    >
      {/* Three soft pools of colour that drift and breathe behind the words. */}
      <span className="aa-loader-glow aa-loader-glow-1" />
      <span className="aa-loader-glow aa-loader-glow-2" />
      <span className="aa-loader-glow aa-loader-glow-3" />
      <span className="aa-loader-grain" />

      <p className="aa-loader-in relative font-display text-5xl md:text-7xl">
        Archana&rsquo;s <em className="text-brass">Art</em>
      </p>
      {/* The bar */}
      <div className="aa-loader-in relative h-px w-full max-w-sm bg-ivory/25" style={{ animationDelay: "120ms" }}>
        <div className="h-full origin-left bg-brass" style={{ transform: `scaleX(${n / 100})` }} />
      </div>
      <p className="aa-loader-in relative whitespace-nowrap text-center text-[clamp(0.72rem,2.9vw,1.1rem)] text-ivory/85" style={{ animationDelay: "240ms" }}>
        Welcome to the artistic world, created by Dr. Archana Gupta
      </p>
    </div>
  );
}
