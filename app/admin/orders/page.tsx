import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import { packOrder } from "@/app/admin/orders/actions";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Orders · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; order?: string }>;
}) {
  const { error: errorMessage, notice, order: messageOrderNo } = await searchParams;

  // Service-role: an admin sees every order, and the "read own orders" policy
  // would otherwise scope this to the admin's own purchases.
  const { data: orders } = await getSupabaseAdmin()
    .from("orders")
    .select("id, order_no, status, payment_method, total_paise, created_at, ship_name, awb, shiprocket_order_id")
    .order("created_at", { ascending: false })
    .limit(200);

  // Paid and confirmed (COD) orders both wait here: nothing reaches Shiprocket
  // until someone packs the order. Oldest first, so the queue is worked in the
  // order customers ordered.
  const toPack = (orders ?? []).filter((o) => o.status === "paid" || o.status === "confirmed").reverse();

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">{orders?.length ?? 0} most recent</p>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {messageOrderNo ? <strong>{messageOrderNo}: </strong> : null}
            {errorMessage}
          </span>
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="mt-6 flex items-start gap-2 border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-900"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {notice}
        </p>
      ) : null}

      {toPack.length ? (
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">
            Ready to pack ({toPack.length})
          </h2>
          <ul className="mt-3 divide-y divide-amber-200 border border-amber-200 bg-amber-50">
            {toPack.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <Link
                  href={`/admin/orders/${order.order_no}`}
                  className="w-32 shrink-0 text-[13px] font-semibold underline-offset-4 hover:underline"
                >
                  {order.order_no}
                </Link>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                  {order.ship_name}
                </span>
                {order.payment_method === "cod" ? <CodBadge /> : null}
                <span className="w-20 shrink-0 text-right text-[13px] font-semibold">
                  {formatPaise(order.total_paise)}
                </span>
                <form action={packOrder}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="from" value="list" />
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-cream transition-colors hover:bg-gold"
                  >
                    <PackageCheck className="h-3.5 w-3.5" /> Pack
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <h2 className="mt-10 text-[11px] font-semibold tracking-[0.16em] uppercase">All orders</h2>

      <ul className="mt-3 divide-y divide-line border-y border-line">
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
              {order.payment_method === "cod" ? <CodBadge /> : null}
              <StatusPill status={order.status} />
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

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "paid" || status === "confirmed"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : status === "packed" || status === "delivered" || status === "shipped"
        ? "border-green-200 bg-green-50 text-green-800"
        : status === "pending"
          ? "border-line bg-sand text-ink-soft"
          : "border-red-200 bg-red-50 text-red-800";

  return (
    <span className={`shrink-0 border px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase ${tone}`}>
      {status === "paid" || status === "confirmed" ? "to pack" : status}
    </span>
  );
}

/** Reminds whoever is packing that this parcel needs cash collected at the door. */
function CodBadge() {
  return (
    <span className="shrink-0 border border-gold/40 bg-gold/10 px-2 py-1 text-[10px] font-semibold tracking-[0.1em] text-gold">
      COD
    </span>
  );
}
