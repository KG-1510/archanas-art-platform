"use client";

import { useState } from "react";
import { WhatsAppIcon } from "./WhatsAppButton";

/**
 * Share a painting. On phones this opens the device's own share sheet; elsewhere
 * (or if that is cancelled or unavailable) it offers WhatsApp and a copy-link button.
 * The preview people see (name, description, photo) comes from the page's own tags.
 */
export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Closing the share sheet is not an error; anything else falls through to the menu.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button type="button" onClick={share} aria-expanded={open} className="link-line inline-flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
        </svg>
        Share this painting
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-3 flex w-64 flex-col border border-line bg-ivory p-2 shadow-[0_12px_30px_-12px_rgb(31_26_23/0.35)]">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Share on WhatsApp
          </a>
          <button type="button" onClick={copy} className="flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
            <span aria-live="polite">{copied ? "Link copied" : "Copy the link"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
