import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshCw, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import { refreshTracking, retryShipment, setOrderStatus } from "@/app/admin/orders/actions";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import { getTrackingEvents } from "@/lib/orders/tracking";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Order · Admin",
  robots: { index: false, follow: false },
};

const STATUSES = ["paid", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const db = getSupabaseAdmin();

  const { data: order } = await db.from("orders").select("*").eq("order_no", orderNo).maybeSingle();
  if (!order) notFound();

  const [{ data: items }, events] = await Promise.all([
    db.from("order_items").select("*").eq("order_id", order.id),
    getTrackingEvents(order.id),
  ]);

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/orders" className="text-[12px] text-muted underline underline-offset-4">
        ← Orders
      </Link>

      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">{order.order_no}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.status} · {formatPaise(order.total_paise)} ·{" "}
        {new Date(order.created_at).toLocaleString("en-IN")}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">Items</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {(items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-[13px]">
                <span>
                  {item.title}
                  {item.variant ? <span className="text-muted"> · {item.variant}</span> : null}
                  <span className="text-muted"> × {item.qty}</span>
                </span>
                <span className="whitespace-nowrap">{formatPaise(item.line_total_paise)}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-[11px] font-semibold tracking-[0.16em] uppercase">Payment</h2>
          <dl className="mt-3 space-y-1.5 text-[13px] text-ink-soft">
            <Row label="Razorpay order" value={order.razorpay_order_id} />
            <Row label="Razorpay payment" value={order.razorpay_payment_id} />
            <Row
              label="Paid at"
              value={order.paid_at ? new Date(order.paid_at).toLocaleString("en-IN") : null}
            />
            <Row label="Failure" value={order.failure_reason} />
          </dl>

          <h2 className="mt-10 text-[11px] font-semibold tracking-[0.16em] uppercase">Shipping</h2>
          <dl className="mt-3 space-y-1.5 text-[13px] text-ink-soft">
            <Row label="Shiprocket order" value={order.shiprocket_order_id} />
            <Row label="Shipment" value={order.shiprocket_shipment_id} />
            <Row label="AWB" value={order.awb} />
            <Row label="Courier" value={order.courier} />
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            {!order.shiprocket_order_id && order.status === "paid" ? (
              <form action={retryShipment}>
                <input type="hidden" name="order_id" value={order.id} />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-ink px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase text-cream transition-colors hover:bg-gold"
                >
                  <Truck className="h-3.5 w-3.5" /> Retry shipment
                </button>
              </form>
            ) : null}

            {order.awb ? (
              <form action={refreshTracking}>
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="awb" value={order.awb} />
                <button
                  type="submit"
                  className="flex items-center gap-2 border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh tracking
                </button>
              </form>
            ) : null}
          </div>

          <h2 className="mt-10 text-[11px] font-semibold tracking-[0.16em] uppercase">Tracking</h2>
          <TrackingTimeline events={events} awb={order.awb} courier={order.courier} />

          <form action={setOrderStatus} className="mt-10 flex items-end gap-3">
            <input type="hidden" name="order_id" value={order.id} />
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
                Set status
              </span>
              <select
                name="status"
                defaultValue={order.status}
                className="border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Update
            </button>
          </form>
        </div>

        <aside className="h-max border border-line bg-white p-6 text-[13px] text-ink-soft">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink">
            Delivering To
          </h2>
          <address className="mt-3 not-italic">
            {order.ship_name}
            <br />
            {order.ship_line1}
            {order.ship_line2 ? (
              <>
                <br />
                {order.ship_line2}
              </>
            ) : null}
            <br />
            {order.ship_city}, {order.ship_state} {order.ship_pincode}
            <br />
            {order.ship_phone}
            <br />
            {order.ship_email}
          </address>

          {order.note ? (
            <p className="mt-4 border-t border-line pt-4">
              <span className="text-ink">Note:</span> {order.note}
            </p>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="truncate text-right text-ink">{value || "—"}</dd>
    </div>
  );
}
