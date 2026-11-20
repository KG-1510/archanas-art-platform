import { defineArrayMember, defineField, defineType, type SchemaTypeDefinition } from "sanity";

/** Art forms offered in the marketplace filter. Add a line here to add a new one. */
export const ART_FORMS = ["Painting", "Mandala", "Nippon art", "Sketch", "Craft", "Other"];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const artwork = defineType({
  name: "artwork",
  title: "Painting",
  type: "document",
  groups: [
    { name: "main", title: "Painting", default: true },
    { name: "size", title: "Size" },
    { name: "sale", title: "Price & stock" },
  ],
  fields: [
    // --- Painting -----------------------------------------------------------
    defineField({
      name: "image", title: "Photo", type: "image", group: "main",
      description: "The picture shown in the marketplace. Photograph the painting straight on, in daylight, without flash.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt", title: "Describe the painting in one sentence", type: "string",
          description: "Read aloud to blind visitors and used by search engines.",
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "additionalImages", title: "More photos", type: "array", group: "main",
      description: "Optional: close-ups, the signature, the painting in its frame or on a wall.",
      of: [
        defineArrayMember({
          type: "image", options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "What this photo shows", type: "string" })],
        }),
      ],
      options: { layout: "grid" },
      validation: (r) => r.max(8),
    }),
    defineField({ name: "title", title: "Painting name", type: "string", group: "main", validation: (r) => r.required().max(80) }),
    defineField({
      name: "code", title: "Product code", type: "string", group: "main",
      description: "Filled in automatically as the next free number (AA-0001, AA-0002, ...). Shown on the painting page, so a buyer can quote it. Write it on the back of the painting.",
      // Next free AA-number, worked out when a new painting is started.
      initialValue: async (_params, context) => {
        const codes: string[] = await context
          .getClient({ apiVersion: "2025-01-01" })
          .fetch(`*[_type == "artwork" && defined(code)].code`);
        const highest = codes.reduce((max, c) => {
          const n = /^AA-(\d+)$/.exec(c);
          return n ? Math.max(max, Number(n[1])) : max;
        }, 0);
        return `AA-${String(highest + 1).padStart(4, "0")}`;
      },
      validation: (r) =>
        r.required().custom(async (value, context) => {
          if (!value) return true;
          const id = (context.document?._id ?? "").replace(/^drafts\./, "");
          const clash: number = await context
            .getClient({ apiVersion: "2025-01-01" })
            .fetch(`count(*[_type == "artwork" && code == $code && !(_id in [$id, "drafts." + $id])])`, { code: value, id });
          return clash ? "Another painting already uses this code." : true;
        }),
    }),
    defineField({
      name: "slug", title: "Web address", type: "slug", group: "main",
      description: "Press Generate after typing the name. This becomes archanasart.in/shop/…",
      options: { source: "title", maxLength: 80 }, validation: (r) => r.required(),
    }),
    defineField({
      name: "description", type: "text", rows: 5, group: "main",
      description: "A few sentences a buyer would enjoy: what it shows, what inspired it, how it was made.",
    }),
    defineField({
      name: "medium", type: "string", group: "main",
      description: "For example: Acrylic on canvas, Oil on linen, Watercolour on paper",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "category", title: "Art form", type: "string", group: "main", initialValue: "Painting",
      description: "Used for the filter buttons in the marketplace.",
      options: { list: ART_FORMS }, validation: (r) => r.required(),
    }),
    defineField({ name: "year", type: "number", group: "main", validation: (r) => r.integer().min(1950).max(2100) }),

    // --- Size -----------------------------------------------------------------
    defineField({
      name: "widthIn", title: "Sheet width (inches)", type: "number", group: "size",
      description: "Size of the painting itself, without a frame. The website shows centimetres automatically.",
      validation: (r) => r.required().positive(),
    }),
    defineField({ name: "heightIn", title: "Sheet height (inches)", type: "number", group: "size", validation: (r) => r.required().positive() }),
    defineField({
      name: "framed", title: "Framed or unframed", type: "string", group: "size", initialValue: "unframed",
      options: { list: [{ title: "Unframed", value: "unframed" }, { title: "Framed", value: "framed" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "framedWidthIn", title: "Width with frame (inches)", type: "number", group: "size",
      description: "Outer size including the frame. The website shows centimetres automatically.",
      hidden: ({ document }) => document?.framed !== "framed",
      validation: (r) => r.positive(),
    }),
    defineField({
      name: "framedHeightIn", title: "Height with frame (inches)", type: "number", group: "size",
      hidden: ({ document }) => document?.framed !== "framed",
      validation: (r) => r.positive(),
    }),

    // --- Price & stock --------------------------------------------------------
    defineField({
      name: "priceOriginalINR", title: "Price, original (₹)", type: "number", group: "sale",
      description: "Price of the original painting. Courier charges are added at checkout. Leave empty if the original is not for sale.",
      validation: (r) => r.integer().positive(),
    }),
    defineField({
      name: "stock", title: "Stock available", type: "number", group: "sale", initialValue: 1,
      description: "How many originals you have. Usually 1. It goes down by one on its own when an original is bought on the website; at 0 the original shows as sold.",
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({
      name: "pricePrintINR", title: "Price, print (₹)", type: "number", group: "sale",
      description: "Price of a print of this painting. Leave empty if you do not sell prints of it. Prints stay on sale after the original is sold.",
      validation: (r) => r.integer().positive(),
    }),
    defineField({
      name: "printDetails", title: "About the print", type: "string", group: "sale",
      description: "Optional. Size and paper, for example: A3 print on 300 gsm archival paper, unframed.",
      hidden: ({ document }) => !document?.pricePrintINR,
    }),
    defineField({
      name: "featured", title: "Show on the homepage", type: "boolean", group: "sale", initialValue: false,
      description: "The homepage shows up to three featured paintings.",
    }),
    defineField({
      name: "reservedUntil", title: "Original held for a buyer until", type: "datetime", group: "sale", readOnly: true,
      description: "Set automatically while someone is paying.",
    }),
  ],
  validation: (r) =>
    r.custom((doc) =>
      doc?.priceOriginalINR || doc?.pricePrintINR ? true : "Add a price for the original, the print, or both (Price & stock tab).",
    ),
  orderings: [
    { title: "Newest first", name: "newest", by: [{ field: "_createdAt", direction: "desc" }] },
    { title: "Price, high to low", name: "priceDesc", by: [{ field: "priceOriginalINR", direction: "desc" }] },
    { title: "Price, low to high", name: "priceAsc", by: [{ field: "priceOriginalINR", direction: "asc" }] },
    { title: "Name, A to Z", name: "title", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", code: "code", stock: "stock", original: "priceOriginalINR", print: "pricePrintINR", media: "image" },
    prepare: ({ title, code, stock, original, print, media }) => {
      const parts: string[] = code ? [code] : [];
      if (typeof original === "number") parts.push((stock ?? 1) > 0 ? `Original ${inr.format(original)}` : "Original SOLD");
      if (typeof print === "number") parts.push(`Print ${inr.format(print)}`);
      return { title, subtitle: parts.join(" · ") || "No price yet", media };
    },
  },
});

const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Position on the page", description: "1 appears first.", type: "number" }),
    defineField({ name: "summary", description: "One or two sentences.", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "details", title: "Key points", type: "array", of: [defineArrayMember({ type: "string" })] }),
  ],
  orderings: [{ title: "Position on the page", name: "order", by: [{ field: "order", direction: "asc" }] }],
});

const workshop = defineType({
  name: "workshop",
  title: "Workshop or class",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", description: "For example: Weekend Mandala Workshop", validation: (r) => r.required().max(90) }),
    defineField({
      name: "kind", title: "Type", type: "string", initialValue: "Workshop",
      options: { list: ["Workshop", "Class batch", "Demo"], layout: "radio" }, validation: (r) => r.required(),
    }),
    defineField({ name: "startDate", title: "Starts on", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "endDate", title: "Ends on", type: "date",
      description: "Optional. The listing leaves the website the day after this date (or after the start date if empty).",
    }),
    defineField({ name: "schedule", title: "Timing", type: "string", description: "For example: Saturdays and Sundays, 10 am to 1 pm" }),
    defineField({
      name: "location", title: "Where", type: "string", initialValue: "Art studio",
      options: { list: ["Art studio", "Residence (Prestige Tranquility)", "Online"] }, validation: (r) => r.required(),
    }),
    defineField({ name: "feeINR", title: "Fee (₹)", type: "number", description: "Leave empty to show 'Fee on request'.", validation: (r) => r.integer().min(0) }),
    defineField({ name: "seats", title: "Number of seats", type: "number", validation: (r) => r.integer().positive() }),
    defineField({ name: "description", title: "What it covers", type: "text", rows: 4 }),
  ],
  orderings: [{ title: "Date, soonest first", name: "date", by: [{ field: "startDate", direction: "asc" }] }],
  preview: {
    select: { title: "title", kind: "kind", date: "startDate" },
    prepare: ({ title, kind, date }) => ({ title, subtitle: [kind, date].filter(Boolean).join(" · ") }),
  },
});

const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Book title", type: "string", validation: (r) => r.required().max(120) }),
    defineField({ name: "subtitle", description: "Optional. The line under the title on the cover.", type: "string" }),
    defineField({
      name: "cover", title: "Front cover", type: "image",
      description: "A straight-on photo or scan of the front cover, cropped to the edges of the book.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "backCover", title: "Back cover", type: "image",
      description: "Optional. With a back cover, visitors get a button to turn the book round.",
    }),
    defineField({ name: "description", title: "About the book", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({
      name: "highlights", title: "Inside the book", type: "array", of: [defineArrayMember({ type: "string" })],
      description: "Optional. Up to four short points.",
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "amazonUrl", title: "Amazon link", type: "url",
      description: "The book's page on Amazon. The website's button opens this link. Until it is filled in, the button says \"Ask on WhatsApp\" instead.",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "year", title: "Year published", type: "number", validation: (r) => r.integer().min(1950).max(2100) }),
    defineField({ name: "order", title: "Position on the page", description: "1 appears first.", type: "number" }),
  ],
  preview: { select: { title: "title", subtitle: "subtitle", media: "cover" } },
});

const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "What they said", type: "text", rows: 4, validation: (r) => r.required().max(400) }),
    defineField({ name: "name", title: "Their name", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "context", title: "Who they are", type: "string", description: "For example: Mandala student, or Collector, Mumbai" }),
    defineField({ name: "order", title: "Position on the homepage", description: "1 appears first. The homepage shows up to three.", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "quote" } },
});

const legalPage = defineType({
  name: "legalPage",
  title: "Policy page",
  type: "document",
  fields: [
    defineField({
      name: "slug", title: "Page", type: "string",
      options: { list: [{ title: "Privacy Policy", value: "privacy" }, { title: "Terms of Service", value: "terms" }, { title: "Shipping & Returns", value: "shipping-returns" }] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "updated", title: "Last updated", type: "date", validation: (r) => r.required() }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    defineField({
      name: "sections", type: "array",
      of: [defineArrayMember({
        type: "object", name: "section",
        fields: [defineField({ name: "heading", type: "string" }), defineField({ name: "body", type: "text", rows: 5 })],
      })],
    }),
  ],
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "shippingIndiaINR", title: "Courier charge within India (₹)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({ name: "shippingInternationalINR", title: "Courier charge outside India (₹)", type: "number", validation: (r) => r.required().min(0) }),
    defineField({
      name: "aboutPhotos", title: "About page photos", type: "array",
      description: "Up to three, in this order: you in the studio, students' work or a class, the studio itself. The About page shows only text until all three are added.",
      of: [
        defineArrayMember({
          type: "image", options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "What this photo shows", type: "string" })],
        }),
      ],
      options: { layout: "grid" },
      validation: (r) => r.max(3),
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

// Orders are written by the website with IDs like "order.<razorpay id>". A dot in the
// ID keeps the document private: it cannot be read without a token.
const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "status", type: "string" }),
    defineField({ name: "item", title: "Bought", description: "original or print", type: "string" }),
    defineField({ name: "artwork", title: "Painting", type: "reference", to: [{ type: "artwork" }] }),
    defineField({ name: "artworkTitle", title: "Painting name", type: "string" }),
    defineField({ name: "priceINR", title: "Price (₹)", type: "number" }),
    defineField({ name: "shippingINR", title: "Courier (₹)", type: "number" }),
    defineField({ name: "totalINR", title: "Total paid (₹)", type: "number" }),
    defineField({ name: "razorpayOrderId", type: "string" }),
    defineField({ name: "razorpayPaymentId", type: "string" }),
    defineField({ name: "createdAt", type: "datetime" }),
    defineField({ name: "paidAt", type: "datetime" }),
    // Set from the admin panel (/admin), not here.
    defineField({ name: "fulfilment", title: "Where it has got to", description: "to-pack, packed, shipped, delivered or cancelled", type: "string" }),
    defineField({ name: "courier", type: "string" }),
    defineField({ name: "trackingNumber", title: "Tracking number", type: "string" }),
    defineField({ name: "shippedAt", type: "datetime" }),
    defineField({ name: "deliveredAt", type: "datetime" }),
    defineField({ name: "adminNotes", title: "Private note", type: "text" }),
    defineField({
      name: "customer", type: "object",
      fields: ["name", "email", "phone", "address1", "address2", "city", "state", "postalCode", "country"].map((n) =>
        defineField({ name: n, type: "string" }),
      ),
    }),
  ],
  preview: {
    select: { title: "artworkTitle", item: "item", status: "status", name: "customer.name" },
    prepare: ({ title, item, status, name }) => ({
      title: `${title ?? "Order"} (${item ?? "original"})`,
      subtitle: [status, name].filter(Boolean).join(" · "),
    }),
  },
});

export const schemaTypes: SchemaTypeDefinition[] = [artwork, book, workshop, testimonial, service, legalPage, siteSettings, order];
