import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { FULFILMENT, FULFILMENT_LABEL, getOrder } from "@/lib/admin/data";
import { emailConfigured } from "@/lib/email";
import { formatINR } from "@/lib/format";
import { updateOrder } from "../../../actions";
import { Notice, StatusPill, Thumb, when } from "../../ui";

// Waits for the sign-in check before showing anything, on purpose.
export const instant = false;

export default async function AdminOrder({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const order = await getOrder(id);
  if (!order) notFound();
  const c = order.customer;
  const paid = order.status === "paid";

  return (
    <>
      <p>
        <Link href="/admin/orders" className="link-line">
          All orders
        </Link>
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <Thumb src={order.artworkImage} size={128} />
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl md:text-5xl">{order.artworkTitle}</h1>
            <StatusPill order={order} />
          </div>
          <p className="mt-2 text-muted">
        {order.item === "print" ? "Print" : "Original painting"}
        {order.artworkCode ? ` · ${order.artworkCode}` : ""} · reference {order.razorpayOrderId.replace(/^order_/, "")}
      </p>
          {order.testMode ? <p className="mt-2 text-sm text-brass-deep">Test payment: no real money moved, and stock was not changed.</p> : null}
        </div>
      </div>

      <div className="mt-8">
        <Notice saved={typeof query.saved === "string" ? query.saved : undefined} emailed={typeof query.emailed === "string" ? query.emailed : undefined} />
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="send-to">
            <h2 id="send-to" className="text-2xl">Send to</h2>
            <address className="mt-4 not-italic leading-relaxed">
              {c.name}
              <br />
              {c.address1}
              {c.address2 ? (
                <>
                  <br />
                  {c.address2}
                </>
              ) : null}
              <br />
              {c.city}, {c.state} {c.postalCode}
              <br />
              {c.country}
            </address>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <a href={`tel:${c.phone}`} className="underline underline-offset-4 hover:text-oxblood">{c.phone}</a>
              <a href={`mailto:${c.email}`} className="underline underline-offset-4 hover:text-oxblood">{c.email}</a>
            </p>
          </section>

          <section aria-labelledby="money">
            <h2 id="money" className="text-2xl">Payment</h2>
            <dl className="mt-4 grid grid-cols-[10rem_1fr] gap-y-2">
              <dt className="text-muted">Price</dt>
              <dd className="tabular-nums">{formatINR(order.priceINR)}</dd>
              <dt className="text-muted">Courier</dt>
              <dd className="tabular-nums">{formatINR(order.shippingINR)}</dd>
              <dt className="text-muted">Total</dt>
              <dd className="font-medium tabular-nums">{formatINR(order.totalINR)}</dd>
              <dt className="text-muted">Started</dt>
              <dd>{when(order.createdAt)}</dd>
              <dt className="text-muted">Paid</dt>
              <dd>{paid ? when(order.paidAt) : "Not paid"}</dd>
              {order.razorpayPaymentId ? (
                <>
                  <dt className="text-muted">Razorpay payment</dt>
                  <dd className="break-all text-sm">{order.razorpayPaymentId}</dd>
                </>
              ) : null}
              {order.shippedAt ? (
                <>
                  <dt className="text-muted">Shipped</dt>
                  <dd>{when(order.shippedAt)}</dd>
                </>
              ) : null}
              {order.deliveredAt ? (
                <>
                  <dt className="text-muted">Delivered</dt>
                  <dd>{when(order.deliveredAt)}</dd>
                </>
              ) : null}
            </dl>
          </section>
        </div>

        <section aria-labelledby="progress" className="border border-line bg-surface p-6 md:p-8">
          <h2 id="progress" className="text-2xl">Where it has got to</h2>
          {paid ? (
            <form action={updateOrder} className="mt-6 flex flex-col gap-7">
              <input type="hidden" name="id" value={order.razorpayOrderId} />
              <label className="field">
                <span>Status</span>
                <select name="fulfilment" defaultValue={order.fulfilment}>
                  {FULFILMENT.map((f) => (
                    <option key={f} value={f}>
                      {FULFILMENT_LABEL[f]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Courier</span>
                <input name="courier" maxLength={60} defaultValue={order.courier ?? ""} placeholder="For example DTDC, Blue Dart, India Post" />
              </label>
              <label className="field">
                <span>Tracking number</span>
                <input name="trackingNumber" maxLength={60} defaultValue={order.trackingNumber ?? ""} />
              </label>
              <label className="field">
                <span>Private note</span>
                <textarea name="adminNotes" rows={3} maxLength={1000} defaultValue={order.adminNotes ?? ""} />
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" name="notify" defaultChecked={emailConfigured()} disabled={!emailConfigured()} className="mt-1.5 accent-oxblood" />
                <span>
                  Email the buyer when this is first marked Shipped
                  <span className="block text-sm text-muted">
                    {emailConfigured() ? "Sends the courier name and tracking number." : "Email is not set up yet, so nothing will be sent."}
                  </span>
                </span>
              </label>
              <button type="submit" className="btn self-start">
                Save
              </button>
            </form>
          ) : (
            <p className="mt-4 text-muted">This checkout was started but never paid, so there is nothing to send.</p>
          )}
        </section>
      </div>
    </>
  );
}
