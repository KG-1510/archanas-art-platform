"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Runs `play` once, the first time `el` comes into view. An IntersectionObserver rather than a
 * ScrollTrigger: it keeps working when the page above changes height after load (photos arriving,
 * pinned sections), which had left elements near the foot of the page hidden for good.
 */
function onFirstView(el: Element, play: () => void) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        play();
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

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
        gsap.set(targets, { y: 44, autoAlpha: 0 });
        return onFirstView(el, () =>
          gsap.to(targets, { y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.out", stagger: stagger ? 0.12 : 0, clearProps: "transform" }),
        );
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
 * Masked line reveal: every `.line > span` inside rises from behind its mask
 * when the block scrolls into view. Lines already on screen at load are left alone.
 */
export function Lines({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "h2" | "p" }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        const spans = el.querySelectorAll(".line > span");
        gsap.set(spans, { yPercent: 112 });
        return onFirstView(el, () => gsap.to(spans, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }));
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

/** The block wipes open from its bottom edge as it scrolls into view. For painting photographs. */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        // Starts as a thin sliver at the bottom edge, then wipes open.
        gsap.set(el, { clipPath: "inset(96% 0% 0% 0%)" });
        return onFirstView(el, () =>
          gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", clearProps: "clipPath" }),
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
