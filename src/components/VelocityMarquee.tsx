"use client";

import { useEffect, useRef } from "react";

const BASE = 60; // px per second when the page is still
const BOOST = 0.9; // extra px/s per px/s of scroll speed
const MAX_BOOST = 2400;

/**
 * A band of words that listens to the scroll: it drifts on its own, runs faster
 * the faster you scroll, leans into the motion and turns round when you scroll
 * the other way. Decorative, so hidden from screen readers; the same words are
 * in the page's real content.
 */
export function VelocityMarquee({ items, className = "bg-oxblood text-ivory" }: { items: string[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const lean = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    const skew = lean.current;
    if (!el || !skew) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let v = 0;
    let dir = -1;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(el);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
      lastT = now;
      const y = window.scrollY;
      const raw = (y - lastY) / dt;
      lastY = y;
      if (!visible) return;
      v += (raw - v) * 0.12;
      if (Math.abs(raw) > 5) dir = raw > 0 ? -1 : 1;
      const speed = BASE + Math.min(Math.abs(v) * BOOST, MAX_BOOST);
      const half = el.scrollWidth / 2;
      x += dir * speed * dt;
      x = (((x % half) + half) % half) - half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      skew.style.transform = `skewX(${Math.max(-8, Math.min(8, v * -0.004))}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div className={`overflow-hidden py-5 md:py-7 ${className}`} aria-hidden="true">
      <div ref={lean} className="will-change-transform">
        <div ref={track} className="flex w-max will-change-transform">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {items.concat(items).map((m, i) => (
                <span key={i} className="whitespace-nowrap px-6 font-display text-4xl italic md:text-6xl">
                  {m} <span className="pl-10 not-italic text-brass">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
