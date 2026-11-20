import { FULFILMENT_LABEL, type AdminOrder, type Fulfilment } from "@/lib/admin/data";

const TONE: Record<Fulfilment, string> = {
  "to-pack": "bg-oxblood text-ivory",
  packed: "bg-brass text-ink",
  shipped: "bg-ink text-ivory",
  delivered: "border border-line text-muted",
  cancelled: "border border-line text-muted line-through",
};

export function StatusPill({ order }: { order: Pick<AdminOrder, "status" | "fulfilment"> }) {
  if (order.status !== "paid") return <span className="inline-block border border-line px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-muted">Not paid</span>;
  return <span className={`inline-block px-2.5 py-1 text-xs uppercase tracking-[0.14em] ${TONE[order.fulfilment]}`}>{FULFILMENT_LABEL[order.fulfilment]}</span>;
}

/** Date and time in India, whatever the server's own timezone. */
export function when(iso?: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function Notice({ saved, emailed }: { saved?: string; emailed?: string }) {
  if (!saved) return null;
  const ok = saved === "yes";
  return (
    <p role="status" className={`mb-8 border px-4 py-3 ${ok ? "border-brass" : "border-oxblood text-oxblood"}`}>
      {ok ? "Saved." : "That could not be saved. Check the values and try again."}
      {emailed === "yes" ? " The buyer has been emailed." : ""}
      {emailed === "no" ? " The email to the buyer could not be sent; tell them yourself." : ""}
    </p>
  );
}
