import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Container from "@/components/ui/Container";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Orders · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  // Service-role: an admin sees every order, and the "read own orders" policy
  // would otherwise scope this to the admin's own purchases.
  const { data: orders } = await getSupabaseAdmin()
    .from("orders")
    .select("id, order_no, status, total_paise, created_at, ship_name, awb, shiprocket_order_id")
    .order("created_at", { ascending: false })
    .limit(200);

  // Paid but never pushed to Shiprocket — the thing worth acting on first.
  const stuck = (orders ?? []).filter((o) => o.status === "paid" && !o.shiprocket_order_id);

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">{orders?.length ?? 0} most recent</p>

      {stuck.length ? (
        <p className="mt-6 flex items-start gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {stuck.length} paid order{stuck.length === 1 ? "" : "s"} never reached Shiprocket. Open one
          and use “Retry shipment”.
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {(orders ?? []).map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/orders/${order.order_no}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-sand"
            >
              <span className="w-32 shrink-0 text-[13px] font-semibold">{order.order_no}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                {order.ship_name}
              </span>
              <StatusPill status={order.status} shipped={Boolean(order.shiprocket_order_id)} />
              <span className="w-20 shrink-0 text-right text-[13px] font-semibold">
                {formatPaise(order.total_paise)}
              </span>
              <span className="w-24 shrink-0 text-right text-[12px] text-muted">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {!orders?.length ? (
        <p className="py-24 text-center text-sm text-muted">No orders yet.</p>
      ) : null}
    </Container>
  );
}

function StatusPill({ status, shipped }: { status: string; shipped: boolean }) {
  const tone =
    status === "paid"
      ? shipped
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-amber-200 bg-amber-50 text-amber-900"
      : status === "delivered" || status === "shipped"
        ? "border-green-200 bg-green-50 text-green-800"
        : status === "pending"
          ? "border-line bg-sand text-ink-soft"
          : "border-red-200 bg-red-50 text-red-800";

  return (
    <span className={`shrink-0 border px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase ${tone}`}>
      {status === "paid" && !shipped ? "paid · not shipped" : status}
    </span>
  );
}
