"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type ClippedSection = { title: string; text: ReactNode; media: ReactNode };

/**
 * Made With GSAP — effect 121, "Clipped sections gallery".
 * Licensed code from madewithgsap.com: keep this repository private.
 * Adapted only to run inside a React component (scoped root, cleanup, reduced motion).
 */
export function Effect121({ hero, sections }: { hero?: ReactNode; sections: ClippedSection[] }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        root.classList.add("is-live");
        const sectionEls = Array.from(root.querySelectorAll(".section"));

        sectionEls.forEach((section) => {
          const media = section.querySelector(".media");
          const img = media && media.querySelector("img");
          if (!media || !img) return;

          gsap.fromTo(
            media,
            {
              clipPath: "inset(0% 15% 0% 15% round 1vw)",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 1vw)",
              ease: "power2.out",
              scrollTrigger: {
                trigger: media,
                start: "top bottom",
                end: "top 65%",
                scrub: true,
              },
            },
          );

          gsap.fromTo(
            media,
            {
              clipPath: "inset(0% 0% 0% 0% round 1vw)",
            },
            {
              clipPath: "inset(0% 15% 0% 15% round 1vw)",
              ease: "power2.in",
              immediateRender: false,
              scrollTrigger: {
                trigger: media,
                start: "bottom 35%",
                end: "bottom top",
                scrub: true,
              },
            },
          );

          gsap.fromTo(
            img,
            {
              y: -200,
            },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: media,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        return () => root.classList.remove("is-live");
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="mwg_effect121">
      {hero ? <div className="hero">{hero}</div> : null}
      {sections.map((s, i) => (
        <div className="section" key={s.title}>
          <div className="content">
            <div className="text-left">
              <span className="number">{i + 1}.</span> <h2 className="text">{s.title}</h2>
            </div>
            <div className="text-right">{s.text}</div>
          </div>
          <div className="media">{s.media}</div>
        </div>
      ))}
    </section>
  );
}
