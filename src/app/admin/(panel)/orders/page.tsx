import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { FULFILMENT, FULFILMENT_LABEL, listOrders, type Fulfilment } from "@/lib/admin/data";
import { formatINR } from "@/lib/format";
import { StatusPill, when } from "../ui";

const FILTERS = [
  { key: "paid", label: "All paid" },
  ...FULFILMENT.map((f) => ({ key: f as string, label: FULFILMENT_LABEL[f] })),
  { key: "unpaid", label: "Not paid" },
];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const raw = (await searchParams).show;
  const show = typeof raw === "string" && FILTERS.some((f) => f.key === raw) ? raw : "paid";
  const orders = await listOrders(show as "paid" | "unpaid" | Fulfilment);

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Orders</h1>
      <nav aria-label="Filter orders" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <li key={f.key}>
              <Link
                href={`/admin/orders?show=${f.key}`}
                aria-current={show === f.key ? "page" : undefined}
                className={`inline-block border px-3 py-1.5 text-sm ${show === f.key ? "border-oxblood bg-oxblood text-ivory" : "border-line hover:border-oxblood"}`}
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {orders.length ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink text-xs uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">Paid</th>
                <th scope="col" className="py-3 pr-4 font-medium">Painting</th>
                <th scope="col" className="py-3 pr-4 font-medium">Buyer</th>
                <th scope="col" className="py-3 pr-4 font-medium">Going to</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Total</th>
                <th scope="col" className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-line align-top">
                  <td className="py-4 pr-4 text-sm text-muted">{when(o.paidAt ?? o.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <Link href={`/admin/orders/${o.razorpayOrderId}`} className="font-medium underline underline-offset-4 hover:text-oxblood">
                      {o.artworkTitle}
                    </Link>
                    <span className="block text-sm text-muted">
                      {o.item === "print" ? "Print" : "Original"}
                      {o.artworkCode ? ` · ${o.artworkCode}` : ""}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    {o.customer?.name}
                    <span className="block text-sm text-muted">{o.customer?.phone}</span>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    {o.customer?.city}, {o.customer?.state}
                    <span className="block text-muted">{o.customer?.country}</span>
                  </td>
                  <td className="py-4 pr-4 text-right tabular-nums">{formatINR(o.totalINR)}</td>
                  <td className="py-4">
                    <StatusPill order={o} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-10 text-muted">No orders here.</p>
      )}
    </>
  );
}
