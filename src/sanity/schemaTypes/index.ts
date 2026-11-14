import { defineArrayMember, defineField, defineType, type SchemaTypeDefinition } from "sanity";

const artwork = defineType({
  name: "artwork",
  title: "Artwork",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({
      name: "image", title: "Photograph", type: "image", options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Describe the painting (for screen readers and search)", type: "string" })],
    }),
    defineField({
      name: "category", type: "string", initialValue: "Painting",
      options: { list: ["Painting", "Mandala", "Nippon art", "Other"] }, validation: (r) => r.required(),
    }),
    defineField({ name: "medium", description: "e.g. Acrylic on canvas", type: "string", validation: (r) => r.required() }),
    defineField({ name: "widthIn", title: "Width (inches)", type: "number", validation: (r) => r.required().positive() }),
    defineField({ name: "heightIn", title: "Height (inches)", type: "number", validation: (r) => r.required().positive() }),
    defineField({ name: "year", type: "number" }),
    defineField({ name: "priceINR", title: "Price (₹)", type: "number", validation: (r) => r.required().integer().positive() }),
    defineField({
      name: "status", type: "string", initialValue: "available",
      options: { list: [{ title: "Available", value: "available" }, { title: "Sold", value: "sold" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: false }),
    defineField({ name: "description", title: "Story of the piece", type: "text", rows: 5 }),
    defineField({ name: "reservedUntil", title: "Held for a buyer until", description: "Set automatically during checkout.", type: "datetime", readOnly: true }),
  ],
  preview: { select: { title: "title", subtitle: "status", media: "image" } },
});

const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "summary", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "details", title: "Key points", type: "array", of: [defineArrayMember({ type: "string" })] }),
  ],
});

const legalPage = defineType({
  name: "legalPage",
  title: "Legal page",
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
    defineField({ name: "artwork", type: "reference", to: [{ type: "artwork" }] }),
    defineField({ name: "artworkTitle", type: "string" }),
    defineField({ name: "priceINR", type: "number" }),
    defineField({ name: "shippingINR", type: "number" }),
    defineField({ name: "totalINR", type: "number" }),
    defineField({ name: "razorpayOrderId", type: "string" }),
    defineField({ name: "razorpayPaymentId", type: "string" }),
    defineField({ name: "createdAt", type: "datetime" }),
    defineField({ name: "paidAt", type: "datetime" }),
    defineField({
      name: "customer", type: "object",
      fields: ["name", "email", "phone", "address1", "address2", "city", "state", "postalCode", "country"].map((n) =>
        defineField({ name: n, type: "string" }),
      ),
    }),
  ],
  preview: { select: { title: "artworkTitle", subtitle: "status" } },
});

export const schemaTypes: SchemaTypeDefinition[] = [artwork, service, legalPage, siteSettings, order];
