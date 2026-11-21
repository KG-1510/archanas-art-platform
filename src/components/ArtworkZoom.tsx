"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type ZoomPhoto = { url: string; alt: string };

const ZoomIcon = ({ out = false, className = "h-4 w-4" }: { out?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d={out ? "m15.5 15.5 5 5M8 10.5h5" : "m15.5 15.5 5 5M10.5 8v5M8 10.5h5"} />
  </svg>
);

/**
 * The painting's photographs on its own page. The main photo (passed in as `children`) and any
 * extra photos open in a full-screen viewer: tap or click the photo there to zoom in and drag or
 * scroll around it, use the arrows (or arrow keys) to move between photos, Esc or Close to leave.
 */
export function ArtworkZoom({ photos, children }: { photos: ZoomPhoto[]; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const many = photos.length > 1;

  const show = (i: number) => {
    setIndex(i);
    setZoomed(false);
    setOpen(true);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback(
    (by: number) => {
      setZoomed(false);
      setIndex((i) => (i + by + photos.length) % photos.length);
    },
    [photos.length],
  );

  useEffect(() => {
    if (!open || !many) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, many, step]);

  // Zooming in starts from the middle of the photo.
  useEffect(() => {
    const el = stage.current;
    if (!el || !zoomed) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoomed, index]);

  if (!photos.length) return <>{children}</>;
  const photo = photos[index] ?? photos[0];
  const round =
    "grid h-11 w-11 place-items-center rounded-full bg-ivory/10 text-ivory transition-colors duration-300 hover:bg-ivory/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory";

  return (
    <>
      <div className="group relative border border-line bg-surface p-4 md:p-6">
        {children}
        <button type="button" onClick={() => show(0)} aria-label="Expand the photograph" className="absolute inset-0 cursor-zoom-in">
          <span className="absolute bottom-6 right-6 inline-flex items-center gap-2 bg-ivory/95 px-3.5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink shadow-md shadow-ink/10 transition-colors duration-300 group-hover:bg-ink group-hover:text-ivory md:bottom-9 md:right-9">
            <ZoomIcon />
            Expand
          </span>
        </button>
      </div>

      {many ? (
        <ul aria-label="More photographs" className="mt-4 grid grid-cols-4 gap-3">
          {photos.slice(1).map((p, i) => (
            <li key={p.url}>
              <button
                type="button"
                onClick={() => show(i + 1)}
                aria-label={`Expand photograph ${i + 2} of ${photos.length}`}
                className="relative block aspect-square w-full cursor-zoom-in overflow-hidden border border-line bg-surface"
              >
                <Image src={p.url} alt={p.alt} fill sizes="(min-width: 768px) 12vw, 22vw" className="object-cover transition-transform duration-700 ease-luxe hover:scale-105" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dialog
        ref={dialog}
        data-lenis-prevent
        aria-label="Photograph viewer"
        onClose={() => {
          setOpen(false);
          setZoomed(false);
        }}
        className="aa-zoom"
      >
        {open ? (
          <div className="flex h-full w-full flex-col">
            <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 text-ivory md:px-6">
              <p className="text-sm tabular-nums text-ivory/75">{many ? `${index + 1} / ${photos.length}` : " "}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoomed((z) => !z)} aria-label={zoomed ? "Zoom out" : "Zoom in"} aria-pressed={zoomed} className={round}>
                  <ZoomIcon out={zoomed} className="h-5 w-5" />
                </button>
                <button type="button" onClick={close} aria-label="Close" autoFocus className={round}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={stage}
              // A click on the empty area around the photo closes the viewer.
              onClick={(e) => (e.target === e.currentTarget ? close() : undefined)}
              className={`relative min-h-0 flex-1 ${zoomed ? "overflow-auto overscroll-contain" : "overflow-hidden"}`}
            >
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                className={`relative block ${zoomed ? "h-[220%] w-[220%] cursor-zoom-out md:h-[200%] md:w-[200%]" : "h-full w-full cursor-zoom-in"}`}
              >
                <Image key={photo.url} src={photo.url} alt={photo.alt} fill quality={90} sizes={zoomed ? "220vw" : "100vw"} className="object-contain p-3 md:p-6" />
              </button>
            </div>

            {many ? (
              <div className="flex shrink-0 items-center justify-center gap-4 px-4 py-3">
                <button type="button" onClick={() => step(-1)} aria-label="Previous photograph" className={round}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m14.5 6-6 6 6 6" />
                  </svg>
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photograph" className={round}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9.5 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="shrink-0 px-4 pb-4 pt-2 text-center text-[0.72rem] uppercase tracking-[0.16em] text-ivory/60">
                {zoomed ? "Drag or scroll to look around" : "Tap the painting to zoom in"}
              </p>
            )}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
