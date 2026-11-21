import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/admin/data";
import { OrdersTable } from "./OrdersTable";

// Waits for the sign-in check before showing anything, on purpose.
export const instant = false;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const raw = (await searchParams).show;
  const orders = await listOrders("all");

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Orders</h1>
      <p className="mt-3 max-w-2xl text-muted">Every order, newest first. Click one to see the address and update where it has got to.</p>
      <OrdersTable orders={orders} initialStatus={typeof raw === "string" ? raw : "all"} />
    </>
  );
}
