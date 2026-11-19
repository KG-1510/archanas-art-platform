"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { site, whatsappLink } from "@/lib/site";

// WebMCP (https://developer.chrome.com/docs/ai/webmcp): lets a browser AI agent call
// site functions directly instead of guessing at the page. The API is still settling,
// so everything is feature-detected and failures are ignored.

type ToolResult = { content: { type: "text"; text: string }[] };
type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
};
type ModelContext = {
  registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => unknown;
  unregisterTool?: (name: string) => void;
};

type CatalogueItem = {
  title: string; slug: string; url: string; category: string; medium: string;
  widthIn: number; heightIn: number; description: string;
  original: { priceINR: number | null; available: boolean };
  print: { priceINR: number | null; available: boolean; details: string | null };
};

/** Lowest price at which the work can be bought right now, or null if it cannot. */
const lowestPrice = (a: CatalogueItem) => {
  const prices = [a.original.available ? a.original.priceINR : null, a.print.available ? a.print.priceINR : null].filter(
    (p): p is number => typeof p === "number",
  );
  return prices.length ? Math.min(...prices) : null;
};

const text = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

async function catalogue(): Promise<CatalogueItem[]> {
  const res = await fetch("/api/artworks");
  if (!res.ok) throw new Error("Catalogue unavailable");
  return (await res.json()).artworks as CatalogueItem[];
}

export function WebMCPTools() {
  const router = useRouter();

  useEffect(() => {
    const mc = ((document as unknown as { modelContext?: ModelContext }).modelContext ??
      (navigator as unknown as { modelContext?: ModelContext }).modelContext) as ModelContext | undefined;
    if (!mc?.registerTool) return;

    const tools: Tool[] = [
      {
        name: "search_artworks",
        description:
          "Search the artworks for sale at Archana's Art. Each work may be sold as the original (one only), as a print, or both. Returns title, medium, size in inches, both prices in INR, availability and URL.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Words to match in the title, medium or description" },
            category: { type: "string", description: "Art form, e.g. Painting, Mandala, Nippon art" },
            maxPriceINR: { type: "number", description: "Upper price limit in Indian Rupees, matched against the cheapest way to buy the work" },
            availableOnly: { type: "boolean", description: "Leave out works that can no longer be bought. Defaults to true." },
          },
        },
        annotations: { readOnlyHint: true },
        async execute(args) {
          const q = String(args.query ?? "").toLowerCase().trim();
          const category = String(args.category ?? "").toLowerCase().trim();
          const max = typeof args.maxPriceINR === "number" ? args.maxPriceINR : Infinity;
          const availableOnly = args.availableOnly !== false;
          const items = (await catalogue()).filter(
            (a) =>
              (!q || `${a.title} ${a.medium} ${a.description}`.toLowerCase().includes(q)) &&
              (!category || a.category.toLowerCase() === category) &&
              (lowestPrice(a) ?? Infinity) <= (max === Infinity ? Infinity : max) &&
              (!availableOnly || lowestPrice(a) !== null),
          );
          return text({ count: items.length, artworks: items });
        },
      },
      {
        name: "get_artwork",
        description: "Get full details of one artwork by its slug, including original and print prices, availability and its page URL.",
        inputSchema: {
          type: "object",
          properties: { slug: { type: "string", description: "The artwork slug from search_artworks" } },
          required: ["slug"],
        },
        annotations: { readOnlyHint: true },
        async execute(args) {
          const item = (await catalogue()).find((a) => a.slug === String(args.slug));
          return item ? text(item) : text("No artwork with that slug.");
        },
      },
      {
        name: "open_checkout",
        description:
          "Take the person to the guest checkout page for one artwork, as the original or as a print. Does not pay or submit anything: the person fills in their delivery details and pays themselves through Razorpay.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The artwork slug from search_artworks" },
            item: { type: "string", enum: ["original", "print"], description: "Which to buy. Defaults to the original if it is available, otherwise the print." },
          },
          required: ["slug"],
        },
        async execute(args) {
          const found = (await catalogue()).find((a) => a.slug === String(args.slug));
          if (!found) return text("No artwork with that slug.");
          const wanted = args.item === "print" ? "print" : args.item === "original" ? "original" : found.original.available ? "original" : "print";
          if (!found[wanted].available) {
            return text(wanted === "original" ? "The original of this artwork is sold or not for sale." : "Prints of this artwork are not available.");
          }
          router.push(`/checkout/${found.slug}?item=${wanted}`);
          return text(`Opened checkout for the ${wanted} of "${found.title}". The person must enter delivery details and pay.`);
        },
      },
      {
        name: "get_studio_contact",
        description: "Get contact details for Archana's Art: phone, WhatsApp link, address, map links and social profiles.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: () =>
          text({
            artist: site.artist,
            phone: site.phoneE164,
            whatsapp: whatsappLink(),
            address: site.address,
            maps: site.maps,
            social: site.social,
          }),
      },
    ];

    const controller = new AbortController();
    for (const tool of tools) {
      try {
        // Some builds return a promise that rejects when the signal aborts on cleanup.
        Promise.resolve(mc.registerTool(tool, { signal: controller.signal })).catch(() => {});
      } catch {
        // Already registered or unsupported shape: ignore.
      }
    }
    return () => {
      controller.abort();
      for (const tool of tools) {
        try {
          mc.unregisterTool?.(tool.name);
        } catch {
          // ignore
        }
      }
    };
  }, [router]);

  return null;
}
