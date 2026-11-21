import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listStock } from "@/lib/admin/data";
import { formatINR } from "@/lib/format";
import { releaseHold, setStock } from "../../actions";
import { Notice, Thumb, when } from "../ui";

// Waits for the sign-in check before showing anything, on purpose.
export const instant = false;

export default async function AdminInventory({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = await searchParams;
  const rows = await listStock();

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Inventory</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Stock counts originals only. A paid order for an original takes one off automatically (test payments do not). Prints have no stock limit. Change a number
        here only to correct it, for example after selling a painting in person.
      </p>
      <div className="mt-8">
        <Notice saved={typeof query.saved === "string" ? query.saved : undefined} />
      </div>

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink text-xs uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">Code</th>
                <th scope="col" className="py-3 pr-4 font-medium">Painting</th>
                <th scope="col" className="py-3 pr-4 font-medium">Original</th>
                <th scope="col" className="py-3 pr-4 font-medium">Sold online</th>
                <th scope="col" className="py-3 font-medium">In stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const held = r.held;
                const sellsOriginal = typeof r.priceOriginalINR === "number";
                return (
                  <tr key={r._id} className="border-b border-line align-top">
                    <td className="py-4 pr-4 tabular-nums">{r.code ?? ""}</td>
                    <td className="py-4 pr-4">
                      <span className="flex items-center gap-4">
                        <Thumb src={r.image} />
                        {r.slug ? (
                          <Link href={`/shop/${r.slug}`} className="font-medium underline underline-offset-4 hover:text-sky-700">
                            {r.title}
                          </Link>
                        ) : (
                          <span className="font-medium">{r.title}</span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {sellsOriginal ? (
                        r.stock > 0 ? (
                          <span>{formatINR(r.priceOriginalINR!)}</span>
                        ) : (
                          <span className="font-medium text-rose-700">Sold</span>
                        )
                      ) : (
                        <span className="text-muted">Not for sale</span>
                      )}
                      {held ? (
                        <form action={releaseHold} className="mt-2">
                          <input type="hidden" name="id" value={r._id} />
                          <span className="block text-sm text-muted">Held for a buyer until {when(r.reservedUntil)}</span>
                          <button type="submit" className="text-sm underline underline-offset-4 hover:text-sky-700">
                            Release the hold
                          </button>
                        </form>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      {r.originalsSold} original{r.originalsSold === 1 ? "" : "s"}
                      <span className="block text-muted">
                        {r.printsSold} print{r.printsSold === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="py-4">
                      <form action={setStock} className="flex items-center gap-3">
                        <input type="hidden" name="id" value={r._id} />
                        <label className="sr-only" htmlFor={`stock-${r._id}`}>
                          Originals in stock for {r.title}
                        </label>
                        <input
                          id={`stock-${r._id}`}
                          name="stock"
                          type="number"
                          min={0}
                          max={999}
                          step={1}
                          required
                          defaultValue={r.stock}
                          className="w-20 border border-line bg-transparent px-2 py-1.5 tabular-nums"
                        />
                        <button type="submit" className="text-sm underline underline-offset-4 hover:text-sky-700">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No paintings yet.</p>
      )}
    </>
  );
}
