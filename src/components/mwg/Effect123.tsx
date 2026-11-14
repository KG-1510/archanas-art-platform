"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

type CharData = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  direction: number;
  setY: (value: number) => void;
};

/**
 * Made With GSAP — effect 123, "Parting letters parade".
 * Licensed code from madewithgsap.com: keep this repository private.
 * Adapted only to run inside a React component (scoped root, cleanup, reduced motion).
 */
export function Effect123({ lines, children }: { lines: [string, string]; children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      root.classList.add("is-live");

      let alive = true;
      let cleanup = () => {};

      const init = () => {
        if (!alive) return;
        ScrollTrigger.config({ ignoreMobileResize: true });

        const pinHeight = root.querySelector(".pin-height") as HTMLElement;
        const container = root.querySelector(".container") as HTMLElement;
        const lineEls = [...root.querySelectorAll<HTMLElement>(".line")];
        const medias = [...root.querySelectorAll<HTMLElement>(".media")];
        if (!medias.length) return;

        const splits = lineEls.map((line) =>
          SplitText.create(line, {
            type: "chars",
            charsClass: "char",
          }),
        );

        let charData: CharData[] = [];

        const buildCharData = () => {
          charData.forEach((c) => c.setY(0));
          charData = [];

          splits.forEach((split, lineIndex) => {
            const direction = lineIndex === 0 ? -1 : 1;

            split.chars.forEach((char) => {
              const rect = char.getBoundingClientRect();
              charData.push({
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                direction,
                setY: gsap.quickTo(char, "y", { duration: 0.4, ease: "power4" }),
              });
            });
          });
        };

        const startX = () => window.innerWidth * 0.9;
        const endX = () => window.innerWidth * 0.1;

        const getStagger = () => {
          const w = medias[0].offsetWidth;
          const travel = Math.abs(startX() - endX());
          const gap = window.innerWidth * 0.5;
          return (w + gap) / travel;
        };

        gsap.set(medias, {
          xPercent: -50,
          yPercent: -50,
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

        const ease = gsap.parseEase("power2.inOut");

        const updateChars = () => {
          const pushes = charData.map(() => 0);
          const pad = window.innerWidth * 0.006;
          const soft = window.innerWidth * 0.06;

          medias.forEach((media) => {
            const r = media.getBoundingClientRect();
            if (r.width < 1 || r.right < -soft || r.left > window.innerWidth + soft) return;

            charData.forEach((c, i) => {
              const gapX = Math.max(c.left - r.right, r.left - c.right);
              if (gapX >= soft) return;

              let t = 1;
              if (gapX > 0) t = ease(1 - gapX / soft);

              const needed = c.direction < 0 ? Math.max(0, c.bottom - r.top + pad) : Math.max(0, r.bottom - c.top + pad);

              pushes[i] = Math.max(pushes[i], needed * t);
            });
          });

          charData.forEach((c, i) => c.setY(pushes[i] * c.direction));
        };

        ScrollTrigger.create({
          trigger: pinHeight,
          start: "top top",
          end: "bottom bottom",
          pin: container,
          onUpdate: updateChars,
          onRefresh: () => {
            buildCharData();
            updateChars();
          },
        });

        const ready = () => {
          buildTimeline();
          buildCharData();
          updateChars();
          ScrollTrigger.refresh();
        };

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
          buildCharData();
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", onResize);
        cleanup = () => window.removeEventListener("resize", onResize);
      };

      // contextSafe keeps everything created after the font wait inside this
      // component's GSAP context, so it is all reverted on unmount.
      document.fonts.ready.then(contextSafe!(init));

      return () => {
        alive = false;
        cleanup();
        root.classList.remove("is-live");
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="mwg_effect123">
      <div className="pin-height">
        <div className="container">
          <div className="title">
            <p className="line">{lines[0]}</p>
            <p className="line">{lines[1]}</p>
          </div>
          <div className="medias" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
