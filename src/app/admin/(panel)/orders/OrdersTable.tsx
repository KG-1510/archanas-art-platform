"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FULFILMENT, FULFILMENT_LABEL, type AdminOrder } from "@/lib/admin/types";
import { formatINR } from "@/lib/format";
import { StatusPill, Thumb, when } from "../ui";

const STATUSES = [
  { key: "all", label: "All orders" },
  { key: "open", label: "Needs action (to pack or packed)" },
  ...FULFILMENT.map((f) => ({ key: f as string, label: FULFILMENT_LABEL[f] })),
  { key: "unpaid", label: "Payment not completed" },
  { key: "test", label: "Test payments" },
];

function matches(o: AdminOrder, status: string) {
  const paid = o.status === "paid";
  if (status === "all") return true;
  if (status === "test") return o.testMode;
  if (status === "unpaid") return !paid;
  if (status === "open") return paid && !o.testMode && (o.fulfilment === "to-pack" || o.fulfilment === "packed");
  return paid && !o.testMode && o.fulfilment === status;
}

/** Every order in one list, newest first, with a search box and one status menu. */
export function OrdersTable({ orders, initialStatus }: { orders: AdminOrder[]; initialStatus: string }) {
  const [status, setStatus] = useState(STATUSES.some((s) => s.key === initialStatus) ? initialStatus : "all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (!matches(o, status)) return false;
      if (!q) return true;
      const c = o.customer ?? ({} as AdminOrder["customer"]);
      return [o.artworkTitle, o.artworkCode, o.razorpayOrderId, o.trackingNumber, c.name, c.phone, c.email, c.city, c.state, c.postalCode]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, status, query]);

  return (
    <>
      <div className="mt-6 grid gap-5 border-y border-line py-5 sm:grid-cols-[1fr_auto]">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Painting, code, buyer, phone, city or tracking number"
          />
        </label>
        <label className="field sm:w-72">
          <span>Show</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({orders.filter((o) => matches(o, s.key)).length})
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="mt-5 text-sm text-muted">
        {shown.length} of {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      {shown.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink text-xs uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">Painting</th>
                <th scope="col" className="py-3 pr-4 font-medium">Buyer</th>
                <th scope="col" className="py-3 pr-4 font-medium">Going to</th>
                <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Total</th>
                <th scope="col" className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o._id} className="border-b border-line align-middle">
                  <td className="py-4 pr-4">
                    <Link href={`/admin/orders/${o.razorpayOrderId}`} className="group flex items-center gap-4">
                      <Thumb src={o.artworkImage} />
                      <span>
                        <span className="font-medium underline underline-offset-4 group-hover:text-sky-700">{o.artworkTitle}</span>
                        <span className="block text-sm text-muted">
                          {o.item === "print" ? "Print" : "Original"}
                          {o.artworkCode ? ` · ${o.artworkCode}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 pr-4">
                    {o.customer?.name}
                    <span className="block text-sm text-muted">{o.customer?.phone}</span>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    {o.customer?.city}, {o.customer?.state}
                    <span className="block text-muted">{o.customer?.country}</span>
                  </td>
                  <td className="py-4 pr-4 text-sm text-muted">{when(o.paidAt ?? o.createdAt)}</td>
                  <td className="py-4 pr-4 text-right tabular-nums">{formatINR(o.totalINR)}</td>
                  <td className="py-4">
                    <StatusPill order={o} />
                    {o.status === "paid" && o.trackingNumber ? <span className="mt-1 block text-xs text-muted">{o.courier} {o.trackingNumber}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-10 text-muted">No orders match.</p>
      )}
    </>
  );
}
