export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderRequest = { slug: string; item: "original" | "print"; customer: CustomerDetails };

const LIMITS: Record<keyof CustomerDetails, { max: number; required: boolean }> = {
  name: { max: 80, required: true },
  email: { max: 120, required: true },
  phone: { max: 20, required: true },
  address1: { max: 120, required: true },
  address2: { max: 120, required: false },
  city: { max: 60, required: true },
  state: { max: 60, required: true },
  postalCode: { max: 12, required: true },
  country: { max: 60, required: true },
};

/** Validates and normalises an order request from the browser. Returns an error message or the clean value. */
export function parseOrderRequest(input: unknown): { ok: true; value: OrderRequest } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request." };
  const body = input as Record<string, unknown>;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!/^[a-z0-9-]{1,96}$/.test(slug)) return { ok: false, error: "Unknown artwork." };
  const item = body.item === "print" ? "print" : body.item === "original" ? "original" : null;
  if (!item) return { ok: false, error: "Choose the original or a print." };

  const raw = body.customer;
  if (!raw || typeof raw !== "object") return { ok: false, error: "Delivery details are missing." };
  const customer = {} as CustomerDetails;
  for (const key of Object.keys(LIMITS) as (keyof CustomerDetails)[]) {
    const v = (raw as Record<string, unknown>)[key];
    const text = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";
    if (LIMITS[key].required && !text) return { ok: false, error: "Please fill in every required field." };
    if (text.length > LIMITS[key].max) return { ok: false, error: "One of the fields is too long." };
    customer[key] = text;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return { ok: false, error: "Please enter a valid email address." };
  if (!/^\+?[0-9 ()-]{7,20}$/.test(customer.phone)) return { ok: false, error: "Please enter a valid phone number." };

  return { ok: true, value: { slug, item, customer } };
}

export function isIndia(country: string) {
  return country.trim().toLowerCase() === "india";
}
