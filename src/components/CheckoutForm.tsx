"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatINR } from "@/lib/format";
import type { ShippingRates } from "@/lib/types";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutForm({ slug, priceINR, shipping }: { slug: string; priceINR: number; shipping: ShippingRates }) {
  const router = useRouter();
  const [abroad, setAbroad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const shippingINR = abroad ? shipping.internationalINR : shipping.indiaINR;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) || "");
    const customer = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      address1: get("address1"),
      address2: get("address2"),
      city: get("city"),
      state: get("state"),
      postalCode: get("postalCode"),
      country: abroad ? get("country") : "India",
    };

    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, customer }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "We could not start the payment.");

      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("The payment window could not load. Check your connection and try again.");

      new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: "#6E1F28" },
        handler: async (response) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verify.ok) {
            router.push("/order/thank-you");
          } else {
            const v = await verify.json().catch(() => ({}));
            setError(v.error || "Your payment went through but we could not confirm it automatically. Please contact the studio.");
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10">
      <fieldset className="flex flex-col gap-7">
        <legend className="mb-7 font-display text-3xl">Your details</legend>
        <label className="field">
          <span>Full name</span>
          <input name="name" required maxLength={80} autoComplete="name" />
        </label>
        <div className="grid gap-7 sm:grid-cols-2">
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required maxLength={120} autoComplete="email" />
          </label>
          <label className="field">
            <span>Phone (with country code)</span>
            <input name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91" />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-7">
        <legend className="mb-7 font-display text-3xl">Delivery address</legend>
        <div role="radiogroup" aria-label="Delivery destination" className="flex flex-wrap gap-8">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="radio" name="destination" checked={!abroad} onChange={() => setAbroad(false)} className="accent-oxblood" />
            Within India
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input type="radio" name="destination" checked={abroad} onChange={() => setAbroad(true)} className="accent-oxblood" />
            Outside India
          </label>
        </div>
        {abroad ? (
          <label className="field">
            <span>Country</span>
            <input name="country" required maxLength={60} autoComplete="country-name" />
          </label>
        ) : null}
        <label className="field">
          <span>Address line 1</span>
          <input name="address1" required maxLength={120} autoComplete="address-line1" />
        </label>
        <label className="field">
          <span>Address line 2 (optional)</span>
          <input name="address2" maxLength={120} autoComplete="address-line2" />
        </label>
        <div className="grid gap-7 sm:grid-cols-3">
          <label className="field">
            <span>City</span>
            <input name="city" required maxLength={60} autoComplete="address-level2" />
          </label>
          <label className="field">
            <span>State / region</span>
            <input name="state" required maxLength={60} autoComplete="address-level1" />
          </label>
          <label className="field">
            <span>{abroad ? "Postal code" : "PIN code"}</span>
            <input name="postalCode" required maxLength={12} autoComplete="postal-code" />
          </label>
        </div>
      </fieldset>

      <dl className="grid grid-cols-[1fr_auto] gap-y-3 border-y border-line py-6 tabular-nums">
        <dt className="text-muted">Painting</dt>
        <dd>{formatINR(priceINR)}</dd>
        <dt className="text-muted">Courier ({abroad ? "international" : "India"})</dt>
        <dd>{formatINR(shippingINR)}</dd>
        <dt className="pt-3 font-display text-2xl">Total</dt>
        <dd className="pt-3 font-display text-2xl">{formatINR(priceINR + shippingINR)}</dd>
      </dl>

      {abroad ? (
        <p className="text-sm text-muted">Customs duties and import taxes in your country are not included and are paid by you on delivery.</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <button type="submit" className="btn self-start" disabled={busy}>
          {busy ? "Opening secure payment…" : "Pay securely with Razorpay"}
        </button>
        <p role="alert" className="min-h-6 text-oxblood">
          {error}
        </p>
      </div>
    </form>
  );
}
