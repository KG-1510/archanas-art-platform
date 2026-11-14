import { getArtwork, getArtworks, getLegalPage, getServices, getShippingRates } from "./content";
import { formatINR, formatSize } from "./format";
import { site, whatsappLink } from "./site";
import type { LegalPage } from "./types";

// Markdown twins: every public page has a plain Markdown version at <path>.md
// (and via "Accept: text/markdown"), so AI agents can read it without parsing HTML.

const u = (path: string) => `${site.url}${path}`;

const contactBlock = () =>
  [
    "## Contact",
    "",
    `- Phone: ${site.phoneE164}`,
    `- WhatsApp: ${whatsappLink()}`,
    `- Address: ${site.address.line1}, ${site.address.line2}, ${site.address.city} - ${site.address.postalCode}, India`,
    `- Art studio map: ${site.maps.studio}`,
    `- Residence map: ${site.maps.residence}`,
    `- Instagram: ${site.social.instagram}`,
    `- YouTube: ${site.social.youtube}`,
    `- Facebook: ${site.social.facebook}`,
  ].join("\n");

async function home() {
  const [artworks, services] = await Promise.all([getArtworks(), getServices()]);
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Pages",
    "",
    `- [Marketplace](${u("/shop.md")}): original artworks for sale`,
    `- [Services](${u("/services.md")}): classes, workshops, demos and commissions`,
    `- [About](${u("/about.md")}): about ${site.artist}`,
    `- [Contact](${u("/contact.md")})`,
    `- [Shipping & Returns](${u("/shipping-returns.md")})`,
    `- [Privacy Policy](${u("/privacy.md")})`,
    `- [Terms of Service](${u("/terms.md")})`,
    "",
    "## Services",
    "",
    ...services.map((s) => `- **${s.title}**: ${s.summary}`),
    "",
    "## Available artworks",
    "",
    ...artworks.filter((a) => a.status === "available").map((a) => `- [${a.title}](${u(`/shop/${a.slug}.md`)}): ${a.medium}, ${formatSize(a.widthIn, a.heightIn)}, ${formatINR(a.priceINR)}`),
    "",
    contactBlock(),
  ].join("\n");
}

async function shop() {
  const [artworks, shipping] = await Promise.all([getArtworks(), getShippingRates()]);
  return [
    `# Marketplace — ${site.name}`,
    "",
    "Every artwork is a single original, sold only once. Prices are in Indian Rupees (INR).",
    `Courier: India ${formatINR(shipping.indiaINR)}, international ${formatINR(shipping.internationalINR)}.`,
    `Machine-readable catalogue: ${u("/api/artworks")}`,
    "",
    "| Artwork | Art form | Medium | Size | Price | Status |",
    "| --- | --- | --- | --- | --- | --- |",
    ...artworks.map(
      (a) =>
        `| [${a.title}](${u(`/shop/${a.slug}.md`)}) | ${a.category} | ${a.medium} | ${formatSize(a.widthIn, a.heightIn)} | ${formatINR(a.priceINR)} | ${a.status === "sold" ? "Sold" : a.sample ? "Sample listing" : "Available"} |`,
    ),
  ].join("\n");
}

async function artwork(slug: string) {
  const [a, shipping] = await Promise.all([getArtwork(slug), getShippingRates()]);
  if (!a) return null;
  return [
    `# ${a.title}`,
    "",
    `An original by ${site.artist}.${a.sample ? " (Sample listing, not for sale.)" : ""}`,
    "",
    `- Art form: ${a.category}`,
    `- Medium: ${a.medium}`,
    `- Size: ${formatSize(a.widthIn, a.heightIn)}`,
    ...(a.year ? [`- Year: ${a.year}`] : []),
    `- Price: ${formatINR(a.priceINR)}`,
    `- Status: ${a.status === "sold" ? "Sold" : "Available"}`,
    "- Edition: one-off original, signed by the artist",
    `- Courier: India ${formatINR(shipping.indiaINR)}, international ${formatINR(shipping.internationalINR)}`,
    `- Page: ${u(`/shop/${a.slug}`)}`,
    ...(a.status === "available" && !a.sample ? [`- Buy (guest checkout, Razorpay): ${u(`/checkout/${a.slug}`)}`] : []),
    ...(a.imageUrl ? [`- Image: ${a.imageUrl}`] : []),
    "",
    a.description,
  ].join("\n");
}

async function services() {
  const list = await getServices();
  return [
    `# Services — ${site.name}`,
    "",
    `Taught and made personally by ${site.artist} in Bengaluru. To enquire, message on WhatsApp: ${whatsappLink()}`,
    "",
    ...list.flatMap((s) => [`## ${s.title}`, "", s.summary, "", ...s.details.map((d) => `- ${d}`), ""]),
  ].join("\n");
}

function about() {
  return [
    `# About ${site.artist}`,
    "",
    `${site.name} is run by ${site.artist}, who has spent more than 40 years teaching and creating art.`,
    "",
    "The studio is not built around a single medium. Painting, mandala, Nippon art and more are taught and practised under one roof.",
    "",
    `Classes run at the art studio and at her residence at ${site.address.line1}, ${site.address.line2}, ${site.address.city} - ${site.address.postalCode}.`,
    "",
    contactBlock(),
  ].join("\n");
}

function contact() {
  return [`# Contact — ${site.name}`, "", `The quickest way to reach ${site.artist} is WhatsApp.`, "", contactBlock()].join("\n");
}

async function legal(slug: LegalPage["slug"]) {
  const page = await getLegalPage(slug);
  return [
    `# ${page.title} — ${site.name}`,
    "",
    `Last updated: ${page.updated}`,
    "",
    ...(page.intro ? [`> ${page.intro}`, ""] : []),
    ...page.sections.flatMap((s) => [`## ${s.heading}`, "", s.body, ""]),
  ].join("\n");
}

/** Returns the Markdown twin for a site path, or null if there is none. */
export async function markdownFor(segments: string[]): Promise<string | null> {
  const path = segments.join("/");
  if (path === "" || path === "index") return home();
  if (path === "shop") return shop();
  if (path === "services") return services();
  if (path === "about") return about();
  if (path === "contact") return contact();
  if (path === "privacy" || path === "terms" || path === "shipping-returns") return legal(path);
  if (segments.length === 2 && segments[0] === "shop" && /^[a-z0-9-]+$/.test(segments[1])) return artwork(segments[1]);
  return null;
}

export async function llmsTxt() {
  const artworks = await getArtworks();
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Every page on this site has a Markdown twin: add `.md` to the URL, or request it with `Accept: text/markdown`.",
    "The site also registers WebMCP tools in supporting browsers: search_artworks, get_artwork, open_checkout, get_studio_contact.",
    "",
    "## Pages",
    "",
    `- [Home](${u("/index.md")})`,
    `- [Marketplace](${u("/shop.md")}): all artworks with medium, size, price and availability`,
    `- [Services](${u("/services.md")}): paintings, art classes, workshops, demos, mandala, Nippon art`,
    `- [About](${u("/about.md")})`,
    `- [Contact](${u("/contact.md")})`,
    "",
    "## Artworks",
    "",
    ...artworks.map((a) => `- [${a.title}](${u(`/shop/${a.slug}.md`)}): ${a.medium}, ${a.status}`),
    "",
    "## Data",
    "",
    `- [Catalogue JSON](${u("/api/artworks")})`,
    "",
    "## Policies",
    "",
    `- [Shipping & Returns](${u("/shipping-returns.md")})`,
    `- [Privacy Policy](${u("/privacy.md")})`,
    `- [Terms of Service](${u("/terms.md")})`,
  ].join("\n");
}
