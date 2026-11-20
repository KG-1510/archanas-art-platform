import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { dashboardNumbers, listOrders } from "@/lib/admin/data";
import { emailConfigured } from "@/lib/email";
import { formatINR } from "@/lib/format";
import { StatusPill, when } from "./ui";

export default async function AdminDashboard() {
  await requireAdmin();
  const [n, recent] = await Promise.all([dashboardNumbers(), listOrders("paid")]);
  if (!n) return <p className="text-muted">Sanity is not connected, so there is nothing to show yet.</p>;

  const tiles = [
    { label: "To pack", value: n.toPack, href: "/admin/orders?show=to-pack", urgent: n.toPack > 0 },
    { label: "Packed, to send", value: n.packed, href: "/admin/orders?show=packed", urgent: n.packed > 0 },
    { label: "Shipped", value: n.shipped, href: "/admin/orders?show=shipped" },
    { label: "Delivered", value: n.delivered, href: "/admin/orders?show=delivered" },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Dashboard</h1>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={`block border p-5 transition-colors hover:border-oxblood ${t.urgent ? "border-oxblood" : "border-line"}`}>
              <span className="block font-display text-5xl text-oxblood">{t.value}</span>
              <span className="mt-1 block text-sm uppercase tracking-[0.16em] text-muted">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <dl className="mt-10 grid gap-x-10 gap-y-6 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="eyebrow">Sales this month</dt>
          <dd className="mt-2 text-2xl font-medium tabular-nums">{formatINR(n.monthTotal ?? 0)}</dd>
          <dd className="text-sm text-muted">{n.monthCount} paid {n.monthCount === 1 ? "order" : "orders"}, courier included</dd>
        </div>
        <div>
          <dt className="eyebrow">Sales so far</dt>
          <dd className="mt-2 text-2xl font-medium tabular-nums">{formatINR(n.allTotal ?? 0)}</dd>
          <dd className="text-sm text-muted">{n.allCount} paid {n.allCount === 1 ? "order" : "orders"}</dd>
        </div>
        <div>
          <dt className="eyebrow">Originals</dt>
          <dd className="mt-2 text-2xl font-medium tabular-nums">{n.inStock} in stock</dd>
          <dd className="text-sm text-muted">
            {n.soldOut} sold · <Link href="/admin/stock" className="underline underline-offset-4 hover:text-oxblood">see stock</Link>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Payment not completed</dt>
          <dd className="mt-2 text-2xl font-medium tabular-nums">{n.unpaid}</dd>
          <dd className="text-sm text-muted">
            <Link href="/admin/orders?show=unpaid" className="underline underline-offset-4 hover:text-oxblood">Checkouts that were started and left</Link>
          </dd>
        </div>
      </dl>

      {emailConfigured() ? null : (
        <p className="mt-8 border border-line px-4 py-3 text-muted">
          Order emails are switched off: no email service key is set. Orders still work; buyers and the studio are not emailed.
        </p>
      )}

      <h2 className="mt-12 text-3xl">Latest paid orders</h2>
      {recent.length ? (
        <ul className="mt-6 flex flex-col">
          {recent.slice(0, 8).map((o) => (
            <li key={o._id} className="border-t border-line last:border-b">
              <Link href={`/admin/orders/${o.razorpayOrderId}`} className="grid gap-2 py-4 hover:text-oxblood sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
                <span>
                  <span className="font-medium">{o.artworkTitle}</span> <span className="text-muted">({o.item})</span>
                  <span className="block text-sm text-muted">{o.customer?.name} · {when(o.paidAt)}</span>
                </span>
                <span className="tabular-nums">{formatINR(o.totalINR)}</span>
                <StatusPill order={o} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-muted">No paid orders yet.</p>
      )}
    </>
  );
}
