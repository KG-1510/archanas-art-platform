import { getArtwork, getArtworks, getLegalPage, getServices, getShippingRates, getUpcomingWorkshops } from "./content";
import { formatDate, formatINR, formatSize, formatSizeWithCm, isBuyable, originalAvailable, priceSummary, printAvailable } from "./format";
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
    `- Art studio: ${site.studio.line1}, ${site.studio.line2}, ${site.studio.city} - ${site.studio.postalCode}, India`,
    `- Residence (classes also held here): ${site.address.line1}, ${site.address.line2}, ${site.address.city} - ${site.address.postalCode}, India`,
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
    `- [Gallery](${u("/shop.md")}): original artworks for sale`,
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
    ...(artworks.some(isBuyable)
      ? [
          "## Available artworks",
          "",
          ...artworks.filter(isBuyable).map((a) => `- [${a.title}](${u(`/shop/${a.slug}.md`)}): ${a.medium}, ${formatSize(a.widthIn, a.heightIn)}, ${priceSummary(a)}`),
          "",
        ]
      : []),
    contactBlock(),
  ].join("\n");
}

async function shop() {
  const [artworks, shipping] = await Promise.all([getArtworks(), getShippingRates()]);
  return [
    `# Gallery | ${site.name}`,
    "",
    "Each original is sold only once. Selected works are also sold as prints. Prices are in Indian Rupees (INR).",
    `Courier: India ${formatINR(shipping.indiaINR)}, international ${formatINR(shipping.internationalINR)}.`,
    `Machine-readable catalogue: ${u("/api/artworks")}`,
    "",
    ...(artworks.length
      ? [
          "| Artwork | Art form | Medium | Size | Original | Print |",
          "| --- | --- | --- | --- | --- | --- |",
          ...artworks.map(
            (a) =>
              `| [${a.title}](${u(`/shop/${a.slug}.md`)}) | ${a.category} | ${a.medium} | ${formatSize(a.widthIn, a.heightIn)} | ${
                typeof a.priceOriginalINR === "number" ? (originalAvailable(a) ? formatINR(a.priceOriginalINR) : "Sold") : "Not for sale"
              } | ${printAvailable(a) ? formatINR(a.pricePrintINR!) : "No prints"} |`,
          ),
        ]
      : ["New works are being added. No artworks are listed yet."]),
  ].join("\n");
}

async function artwork(slug: string) {
  const [a, shipping] = await Promise.all([getArtwork(slug), getShippingRates()]);
  if (!a) return null;
  return [
    `# ${a.title}`,
    "",
    `By ${site.artist}.`,
    "",
    `- Art form: ${a.category}`,
    `- Medium: ${a.medium}`,
    `- Size: ${formatSizeWithCm(a.widthIn, a.heightIn)}`,
    ...(a.framed && a.framedWidthIn && a.framedHeightIn ? [`- Size with frame: ${formatSizeWithCm(a.framedWidthIn, a.framedHeightIn)}`] : []),
    `- Framing: ${a.framed ? (a.hasGlass ? "framed behind glass (the glass is removed before the original is couriered)" : "framed") : "unframed"}`,
    ...(a.vaastu ? ["- Vaastu compliant"] : []),
    ...(a.year ? [`- Year: ${a.year}`] : []),
    ...(typeof a.priceOriginalINR === "number"
      ? [`- Original: ${originalAvailable(a) ? `${formatINR(a.priceOriginalINR)}, available` : "sold"}`]
      : ["- Original: not for sale"]),
    ...(printAvailable(a) ? [`- Print: ${formatINR(a.pricePrintINR!)}${a.printDetails ? ` (${a.printDetails})` : ""}`] : []),
    `- Courier: India ${formatINR(shipping.indiaINR)}, international ${formatINR(shipping.internationalINR)}`,
    `- Page: ${u(`/shop/${a.slug}`)}`,
    ...(originalAvailable(a) ? [`- Buy the original (guest checkout, Razorpay): ${u(`/checkout/${a.slug}?item=original`)}`] : []),
    ...(printAvailable(a) ? [`- Buy a print (guest checkout, Razorpay): ${u(`/checkout/${a.slug}?item=print`)}`] : []),
    ...(a.imageUrl ? [`- Image: ${a.imageUrl}`] : []),
    "",
    a.description,
  ].join("\n");
}

async function services() {
  const [list, workshops] = await Promise.all([getServices(), getUpcomingWorkshops()]);
  return [
    `# Services | ${site.name}`,
    "",
    `Led and made personally by ${site.artist} in Bengaluru. To enquire, message on WhatsApp: ${whatsappLink()}`,
    "",
    ...(workshops.length
      ? [
          "## Upcoming workshops and classes",
          "",
          ...workshops.map(
            (w) =>
              `- **${w.title}** (${w.kind}): ${formatDate(w.startDate)}${w.endDate && w.endDate !== w.startDate ? ` to ${formatDate(w.endDate)}` : ""}${
                w.schedule ? `, ${w.schedule}` : ""
              }. ${w.location}. ${typeof w.feeINR === "number" ? `Fee ${formatINR(w.feeINR)}` : "Fee on request"}${w.seats ? `, ${w.seats} seats` : ""}.${
                w.description ? ` ${w.description}` : ""
              }`,
          ),
          "",
        ]
      : []),
    ...list.flatMap((s) => [`## ${s.title}`, "", s.summary, "", ...s.details.map((d) => `- ${d}`), ""]),
  ].join("\n");
}

function about() {
  return [
    `# About ${site.artist}`,
    "",
    `${site.artist}, B.A. (Fine Arts), Ph.D. (Political Science), was born in Gwalior in 1963 and has been practising fine arts for more than 40 years. She runs ${site.name} in Bengaluru as an art academy and a painting studio.`,
    "",
    "- Exhibited in several Indian cities and at international exhibitions; numerous national and international awards.",
    "- Works on canvas, paper and pottery, in watercolour, oil, acrylic and mixed media. Signature style: loose watercolour.",
    "- Subjects: landscapes, seascapes, portraits, still life, flora and fauna, and folk arts such as Madhubani, Rajasthani and Tanjore.",
    "- An art educator who has guided over 5,000 students; leads workshops for art students and corporate teams; has judged art competitions.",
    "- Author of five books in the Loose Water Colour series.",
    "- Ace Book of Records National Record: 62 watercolour paintings in 60 minutes at the age of 62, on 16 September 2025.",
    "",
    "The studio is not built around a single medium. Painting, mandala, Lippan art and more are taught and practised in one studio.",
    "",
    `Classes run at the art studio at ${site.studio.line1}, ${site.studio.line2}, ${site.studio.city} - ${site.studio.postalCode}, and at her residence at ${site.address.line1}, ${site.address.line2}, ${site.address.city} - ${site.address.postalCode}.`,
    "",
    contactBlock(),
  ].join("\n");
}

function contact() {
  return [`# Contact | ${site.name}`, "", `The quickest way to reach ${site.artist} is WhatsApp.`, "", contactBlock()].join("\n");
}

async function legal(slug: LegalPage["slug"]) {
  const page = await getLegalPage(slug);
  return [
    `# ${page.title} | ${site.name}`,
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
    `- [Gallery](${u("/shop.md")}): all artworks with medium, size, price and availability`,
    `- [Services](${u("/services.md")}): paintings, art classes, workshops, demos, mandala, Lippan art`,
    `- [About](${u("/about.md")})`,
    `- [Contact](${u("/contact.md")})`,
    "",
    "## Artworks",
    "",
    ...artworks.map((a) => `- [${a.title}](${u(`/shop/${a.slug}.md`)}): ${a.medium}, ${priceSummary(a)}`),
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
