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
 *
 * One observer is shared by every element, so things that come into view together (a row of
 * cards) play together, in reading order, a beat apart, instead of popping in one by one.
 */
const waiting = new Map<Element, (order: number) => void>();
let shared: IntersectionObserver | null = null;

function observer() {
  shared ??= new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting && waiting.has(e.target))
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, order) => {
          const play = waiting.get(e.target)!;
          waiting.delete(e.target);
          shared!.unobserve(e.target);
          play(order);
        });
    },
    { rootMargin: "0px 0px -6% 0px" },
  );
  return shared;
}

/**
 * A fast jump (End key, an anchor, the browser restoring the scroll position) can carry an
 * element from below the screen to above it between two frames. The observer never sees it
 * on screen, so it would stay hidden. On scroll, anything waiting that is now above the
 * bottom of the screen plays straight away.
 */
let sweepQueued = false;
function sweep() {
  sweepQueued = false;
  const line = window.innerHeight * 0.94; // same line as the observer's -6% bottom margin
  Array.from(waiting.keys())
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.top < line)
    .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)
    .forEach(({ el }, order) => {
      const play = waiting.get(el)!;
      waiting.delete(el);
      shared?.unobserve(el);
      play(order);
    });
  if (!waiting.size) window.removeEventListener("scroll", onScroll);
}
function onScroll() {
  if (sweepQueued) return;
  sweepQueued = true;
  requestAnimationFrame(sweep);
}

function onFirstView(el: Element, play: (order: number) => void) {
  waiting.set(el, play);
  observer().observe(el);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    waiting.delete(el);
    shared?.unobserve(el);
  };
}

/** Delay for the nth element of a group that came into view together. */
const beat = (order: number) => Math.min(order, 5) * 0.09;

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
        gsap.set(targets, { y: 44, autoAlpha: 0, force3D: true });
        return onFirstView(el, (order) =>
          gsap.to(targets, {
            y: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out", delay: beat(order),
            stagger: stagger ? 0.1 : 0, force3D: true, clearProps: "transform",
          }),
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
        return onFirstView(el, (order) => gsap.to(spans, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: beat(order) }));
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

/**
 * The block rises and fades in as it scrolls into view. For painting photographs.
 * Only opacity and transform are animated, which the browser hands to the GPU, so it stays
 * smooth while scrolling past a full grid of photos (an animated clip-path repainted every
 * frame and stuttered).
 */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        gsap.set(el, { y: 36, autoAlpha: 0, force3D: true });
        return onFirstView(el, (order) =>
          gsap.to(el, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out", delay: beat(order), force3D: true, clearProps: "transform" }),
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
