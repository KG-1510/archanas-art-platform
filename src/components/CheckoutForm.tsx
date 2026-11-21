"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { INDIAN_STATES } from "@/lib/checkout";
import { RazorpayIcon } from "./Icons";
import { formatINR } from "@/lib/format";
import type { PurchaseItem, ShippingRates } from "@/lib/types";

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
type RazorpayFailure = { error?: { description?: string; reason?: string } };
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
    };
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

type Props = {
  slug: string;
  /** Price of the original, if it can be bought right now. */
  originalINR?: number;
  /** Price of a print, if prints are sold. */
  printINR?: number;
  printDetails?: string;
  shipping: ShippingRates;
};

export function CheckoutForm({ slug, originalINR, printINR, printDetails, shipping }: Props) {
  const router = useRouter();
  // The painting page links here with ?item=print or ?item=original. A choice made
  // on this page takes over from the link.
  const wanted = useSearchParams().get("item");
  const [chosen, setItem] = useState<PurchaseItem | null>(null);
  const fromLink: PurchaseItem =
    wanted === "print" && printINR !== undefined ? "print" : originalINR !== undefined ? "original" : "print";
  const item = chosen ?? fromLink;

  const priceINR = (item === "original" ? originalINR : printINR) ?? 0;
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
        body: JSON.stringify({ slug, item, customer }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "We could not start the payment.");

      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error("The payment window could not load. Check your connection and try again.");

      const checkout = new window.Razorpay({
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
      });
      // A declined card or failed UPI attempt. Razorpay keeps its window open so the buyer can try
      // another method; this message is there if they close it instead.
      checkout.on("payment.failed", (failure) => {
        setError(
          `The payment did not go through${failure.error?.description ? `: ${failure.error.description}` : "."} Nothing has been charged. You can try again or use another method.`,
        );
      });
      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-10">
      {originalINR !== undefined && printINR !== undefined ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-5 font-display text-3xl">What would you like?</legend>
          <label className="flex cursor-pointer items-center justify-between gap-4 border border-line p-4 has-[:checked]:border-oxblood">
            <span className="flex items-center gap-3">
              <input type="radio" name="item" checked={item === "original"} onChange={() => setItem("original")} className="accent-oxblood" />
              <span>
                The original<span className="block text-sm text-muted">The painting itself, signed by the artist.</span>
              </span>
            </span>
            <span className="font-medium tabular-nums">{formatINR(originalINR)}</span>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-4 border border-line p-4 has-[:checked]:border-oxblood">
            <span className="flex items-center gap-3">
              <input type="radio" name="item" checked={item === "print"} onChange={() => setItem("print")} className="accent-oxblood" />
              <span>
                A print<span className="block text-sm text-muted">{printDetails || "A reproduction of this painting."}</span>
              </span>
            </span>
            <span className="font-medium tabular-nums">{formatINR(printINR)}</span>
          </label>
        </fieldset>
      ) : null}

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
            <span>{abroad ? "State / region" : "State"}</span>
            {abroad ? (
              <input name="state" required maxLength={60} autoComplete="address-level1" />
            ) : (
              <select name="state" required defaultValue="" autoComplete="address-level1">
                <option value="" disabled>
                  Choose a state
                </option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="field">
            <span>{abroad ? "Postal code" : "PIN code"}</span>
            <input
              name="postalCode"
              required
              maxLength={abroad ? 12 : 6}
              inputMode={abroad ? "text" : "numeric"}
              pattern={abroad ? undefined : "[1-9][0-9]{5}"}
              title={abroad ? undefined : "A 6-digit PIN code"}
              autoComplete="postal-code"
            />
          </label>
        </div>
      </fieldset>

      <dl className="grid grid-cols-[1fr_auto] gap-y-3 border-y border-line py-6 tabular-nums">
        <dt className="text-muted">{item === "original" ? "Original painting" : "Print"}</dt>
        <dd>{formatINR(priceINR)}</dd>
        <dt className="text-muted">Standard courier ({abroad ? "international" : "India"})</dt>
        <dd>{formatINR(shippingINR)}</dd>
        <dt className="pt-3 font-display text-2xl">Total</dt>
        <dd className="pt-3 font-display text-2xl">{formatINR(priceINR + shippingINR)}</dd>
      </dl>

      {abroad ? (
        <p className="text-sm text-muted">Customs duties and import taxes in your country are not included and are paid by you on delivery.</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <button type="submit" className="btn self-start" disabled={busy}>
          <RazorpayIcon className="h-4 w-4" />
          {busy ? "Opening secure payment…" : "Pay securely with Razorpay"}
        </button>
        <p role="alert" className="min-h-6 text-oxblood">
          {error}
        </p>
      </div>
    </form>
  );
}
