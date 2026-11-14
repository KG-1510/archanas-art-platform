"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  children: ReactNode;
  className?: string;
  /** Animate direct children one after another instead of the block as a whole. */
  stagger?: boolean;
  as?: "div" | "section" | "ul";
};

/**
 * Scroll reveal for content below the fold. Content is fully visible without
 * JavaScript and for people who prefer reduced motion.
 */
export function Reveal({ children, className, stagger = false, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Leave anything already on screen at load alone, so nothing flashes.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          y: 44,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/** Slow vertical drift on scroll, for hero and feature imagery. */
export function Parallax({ children, className, amount = 8 }: { children: ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { yPercent: -amount / 2 },
          { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Pinned horizontal gallery: on large screens the section pins and vertical
 * scrolling moves the row sideways. On small screens, with reduced motion, or
 * without JavaScript it is an ordinary swipeable row.
 */
export function HorizontalGallery({ header, children, label }: { header: ReactNode; children: ReactNode; label: string }) {
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const s = section.current, sc = scroller.current, t = track.current;
        if (!s || !sc || !t) return;
        const distance = () => Math.max(0, t.scrollWidth - sc.clientWidth);
        if (distance() < 80) return;
        gsap.set(sc, { overflow: "hidden" });
        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: s,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-label={label} className="overflow-hidden pt-28 pb-20">
      <div className="shell">{header}</div>
      <div ref={scroller} className="mt-12 overflow-x-auto [scrollbar-width:none]">
        <ul ref={track} className="flex w-max gap-8 px-[clamp(1.25rem,4vw,3.5rem)] will-change-transform">
          {children}
        </ul>
      </div>
    </section>
  );
}

/** An inline element that grows open from nothing as its sentence scrolls into view. */
export function GrowInline({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          width: 0,
          marginInline: 0,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top 85%", end: "top 35%", scrub: 0.6 },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} aria-hidden="true" className={className}>
      {children}
    </span>
  );
}

/** A list where the row nearest the middle of the screen is at full strength and the rest recede. */
export function FocusList({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        Array.from(el.children).forEach((row) => {
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 88%", end: "bottom 12%", scrub: true } })
            .fromTo(row, { opacity: 0.4, x: -18 }, { opacity: 1, x: 0, ease: "power1.out", duration: 1 })
            .to(row, { opacity: 1, duration: 1.2 })
            .to(row, { opacity: 0.4, x: 18, ease: "power1.in", duration: 1 });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
