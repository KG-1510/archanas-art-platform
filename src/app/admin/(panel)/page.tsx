import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { dashboardNumbers, listOrders } from "@/lib/admin/data";
import { emailConfigured } from "@/lib/email";
import { paymentMode } from "@/lib/orders";
import { formatINR } from "@/lib/format";
import { STAGE, StageIcon, StatusPill, Thumb, when } from "./ui";

// Waits for the sign-in check before showing anything, on purpose.
export const instant = false;

export default async function AdminDashboard() {
  await requireAdmin();
  const [n, recent] = await Promise.all([dashboardNumbers(), listOrders("paid")]);
  const mode = paymentMode();
  if (!n) return <p className="text-muted">Sanity is not connected, so there is nothing to show yet.</p>;

  const tiles = [
    { stage: "to-pack" as const, label: "To pack", value: n.toPack },
    { stage: "packed" as const, label: "Packed, to send", value: n.packed },
    { stage: "shipped" as const, label: "Shipped", value: n.shipped },
    { stage: "delivered" as const, label: "Delivered", value: n.delivered },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Dashboard</h1>

      <p role="status" className={`mt-6 border px-4 py-3 ${mode === "live" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : mode === "test" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-rose-300 bg-rose-50 text-rose-900"} rounded-lg`}>
        {mode === "live"
          ? "Payments are live: buyers are charged real money."
          : mode === "test"
            ? "Payments are in test mode here: no real money moves, and test orders do not change stock or the sales figures below."
            : mode === "blocked"
              ? "Payments are blocked here: a live Razorpay key is set outside the production site. Use test keys on this machine and on staging."
              : "Payments are switched off here: no Razorpay keys are set."}
        {n.testPaid ? (
          <>
            {" "}
            <Link href="/admin/orders?show=test" className="underline underline-offset-4">
              {n.testPaid} test {n.testPaid === 1 ? "order" : "orders"}
            </Link>
          </>
        ) : null}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={`/admin/orders?show=${t.stage}`} className="block rounded-lg border border-line bg-white p-5 transition-shadow hover:shadow-md">
              <span className="flex items-start justify-between gap-4">
                <span className={`block text-5xl font-medium tabular-nums ${t.value ? STAGE[t.stage].number : "text-stone-400"}`}>{t.value}</span>
                <span className={`grid h-11 w-11 place-items-center rounded-full ${STAGE[t.stage].tile}`}>
                  <StageIcon stage={t.stage} />
                </span>
              </span>
              <span className="mt-2 block text-sm uppercase tracking-[0.16em] text-muted">{t.label}</span>
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
            {n.soldOut} sold · <Link href="/admin/inventory" className="underline underline-offset-4 hover:text-sky-700">see inventory</Link>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Payment not completed</dt>
          <dd className="mt-2 text-2xl font-medium tabular-nums">{n.unpaid}</dd>
          <dd className="text-sm text-muted">
            <Link href="/admin/orders?show=unpaid" className="underline underline-offset-4 hover:text-sky-700">Checkouts that were started and left</Link>
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
              <Link href={`/admin/orders/${o.razorpayOrderId}`} className="grid gap-2 py-4 hover:text-sky-700 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-6">
                <Thumb src={o.artworkImage} size={56} />
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
