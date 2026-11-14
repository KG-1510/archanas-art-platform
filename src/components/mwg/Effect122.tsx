"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Made With GSAP — effect 122, "Scaling image parade".
 * Licensed code from madewithgsap.com: keep this repository private.
 * Adapted only to run inside a React component (scoped root, cleanup, reduced motion).
 */
export function Effect122({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      root.classList.add("is-live");

      ScrollTrigger.config({ ignoreMobileResize: true });

      const pinHeight = root.querySelector(".pin-height") as HTMLElement;
      const container = root.querySelector(".container") as HTMLElement;
      const medias = [...root.querySelectorAll<HTMLElement>(".media")];
      if (!medias.length) return;

      const startX = () => window.innerWidth * 0.9;
      const endX = () => window.innerWidth * 0.1;

      const getStagger = () => {
        const w = medias[0].offsetWidth;
        const travel = Math.abs(startX() - endX());
        const gap = window.innerWidth * 0.05;
        return (w + gap) / travel;
      };

      gsap.set(medias, {
        xPercent: -50,
        yPercent: -50,
      });

      gsap.set(medias, {
        scale: 0,
      });

      let tl: gsap.core.Timeline | undefined;

      const buildTimeline = () => {
        if (tl) tl.kill();

        const stagger = getStagger();

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
          defaults: { stagger },
        });

        tl.fromTo(
          medias,
          {
            x: startX,
          },
          {
            x: endX,
            ease: "none",
            duration: 1,
          },
        );

        tl.to(
          medias,
          {
            scale: 1,
            duration: 0.5,
            ease: "power1.out",
          },
          "<",
        );

        tl.to(
          medias,
          {
            scale: 0,
            duration: 0.5,
            ease: "power1.in",
          },
          "<+=0.5",
        );
      };

      ScrollTrigger.create({
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        pin: container,
      });

      const ready = () => {
        buildTimeline();
        ScrollTrigger.refresh();
      };

      let alive = true;
      Promise.all(
        medias.map((img) => {
          if (!(img instanceof HTMLImageElement) || img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
        }),
      ).then(() => alive && ready());

      ready();

      let lastWidth = window.innerWidth;
      const onResize = () => {
        const width = window.innerWidth;
        if (width === lastWidth) return;
        lastWidth = width;
        buildTimeline();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        alive = false;
        window.removeEventListener("resize", onResize);
        root.classList.remove("is-live");
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="mwg_effect122" aria-hidden="true">
      <div className="pin-height">
        <div className="container">
          <div className="medias">{children}</div>
        </div>
      </div>
    </section>
  );
}
