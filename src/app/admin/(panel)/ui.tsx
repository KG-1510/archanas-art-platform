import { FULFILMENT_LABEL, type AdminOrder, type Fulfilment } from "@/lib/admin/types";

// One colour per stage, used on the status labels and the dashboard boxes.
export const STAGE: Record<Fulfilment, { pill: string; tile: string; number: string }> = {
  "to-pack": { pill: "bg-amber-100 text-amber-900 ring-amber-300", tile: "bg-amber-100 text-amber-800", number: "text-amber-700" },
  packed: { pill: "bg-sky-100 text-sky-900 ring-sky-300", tile: "bg-sky-100 text-sky-800", number: "text-sky-700" },
  shipped: { pill: "bg-violet-100 text-violet-900 ring-violet-300", tile: "bg-violet-100 text-violet-800", number: "text-violet-700" },
  delivered: { pill: "bg-emerald-100 text-emerald-900 ring-emerald-300", tile: "bg-emerald-100 text-emerald-800", number: "text-emerald-700" },
  cancelled: { pill: "bg-stone-100 text-stone-600 ring-stone-300 line-through", tile: "bg-stone-100 text-stone-600", number: "text-stone-500" },
};

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

/** The small picture for each stage: open box, sealed parcel, truck, tick, cross. */
export function StageIcon({ stage, className = "h-5 w-5" }: { stage: Fulfilment; className?: string }) {
  const paths: Record<Fulfilment, React.ReactNode> = {
    "to-pack": (
      <>
        <path d="M4 9.5 12 13l8-3.5M12 13v8" />
        <path d="M4 9.5V17l8 4 8-4V9.5" />
        <path d="M4 9.5 6.5 5 12 7.5 17.5 5 20 9.5" />
      </>
    ),
    packed: (
      <>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5Z" />
        <path d="M4 7.5 12 12l8-4.5M12 12v9M8 5.3l8 4.5" />
      </>
    ),
    shipped: (
      <>
        <path d="M2.5 6.5h11v10h-11Z" />
        <path d="M13.5 10h4l3.5 3.5v3h-7.5Z" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </>
    ),
    delivered: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8 12.3 2.8 2.8L16 9.5" />
      </>
    ),
    cancelled: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </>
    ),
  };
  return (
    <svg {...svg} className={className}>
      {paths[stage]}
    </svg>
  );
}

const PILL = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.1em] ring-1 ring-inset";

export function StatusPill({ order }: { order: Pick<AdminOrder, "status" | "fulfilment" | "testMode"> }) {
  const test = order.testMode ? <span className={`${PILL} ml-2 bg-white text-slate-600 ring-slate-300`}>Test</span> : null;
  if (order.status !== "paid") {
    return (
      <span className="whitespace-nowrap">
        <span className={`${PILL} bg-stone-100 text-stone-600 ring-stone-300`}>Not paid</span>
        {test}
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap">
      <span className={`${PILL} ${STAGE[order.fulfilment].pill}`}>
        <StageIcon stage={order.fulfilment} className="h-3.5 w-3.5" />
        {FULFILMENT_LABEL[order.fulfilment]}
      </span>
      {test}
    </span>
  );
}

/** A small picture of the painting, whole, on the mat colour. Decorative: the name is always beside it. */
export function Thumb({ src, size = 64 }: { src?: string; size?: number }) {
  const box = { width: size, height: size };
  if (!src) return <span aria-hidden="true" className="block shrink-0 border border-line bg-surface" style={box} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${src}?w=${size * 2}&h=${size * 2}&fit=fill&bg=f0eae0&auto=format`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="block shrink-0 border border-line bg-surface"
      style={box}
    />
  );
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
    <p role="status" className={`mb-8 border px-4 py-3 ${ok ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>
      {ok ? "Saved." : "That could not be saved. Check the values and try again."}
      {emailed === "yes" ? " The buyer has been emailed." : ""}
      {emailed === "no" ? " The email to the buyer could not be sent; tell them yourself." : ""}
    </p>
  );
}
