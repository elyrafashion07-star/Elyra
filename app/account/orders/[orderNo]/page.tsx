import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Clock, Package, XCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import { getTrackingEvents } from "@/lib/orders/tracking";
import { formatPaise } from "@/lib/format";
import { createClient, getUser } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

const STATUS: Record<OrderStatus, { label: string; note: string; tone: string }> = {
  pending: {
    label: "Awaiting payment",
    note: "If you have just paid, this updates within a minute — no need to pay again.",
    tone: "text-amber-700",
  },
  paid: {
    label: "Confirmed",
    note: "We have your payment. This ships within 24–48 hours.",
    tone: "text-green-700",
  },
  failed: {
    label: "Payment failed",
    note: "No money was taken. Please place the order again.",
    tone: "text-red-700",
  },
  cancelled: { label: "Cancelled", note: "This order was cancelled.", tone: "text-red-700" },
  shipped: { label: "Shipped", note: "On its way to you.", tone: "text-green-700" },
  delivered: { label: "Delivered", note: "Delivered. Enjoy!", tone: "text-green-700" },
  refunded: { label: "Refunded", note: "The amount has been returned to you.", tone: "text-ink-soft" },
};

function StatusIcon({ status }: { status: OrderStatus }) {
  if (status === "pending") return <Clock className="h-5 w-5" />;
  if (status === "failed" || status === "cancelled") return <XCircle className="h-5 w-5" />;
  if (status === "shipped" || status === "delivered") return <Package className="h-5 w-5" />;
  return <CheckCircle2 className="h-5 w-5" />;
}

export default async function OrderPage({ params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;

  const user = await getUser();
  if (!user) redirect(`/account/login?next=/account/orders/${orderNo}`);

  // Anon-key client on purpose: RLS ("read own orders") is what scopes this, so
  // another customer's order number returns nothing rather than someone else's
  // address and phone number.
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order) notFound();

  const [{ data: items }, events] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    getTrackingEvents(order.id),
  ]);

  const status = STATUS[order.status];

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs
        trail={[
          { label: "My Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: order.order_no },
        ]}
      />

      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">Order {order.order_no}</h1>

      <p className={`mt-3 flex items-center gap-2 text-sm font-semibold ${status.tone}`}>
        <StatusIcon status={order.status} /> {status.label}
      </p>
      <p className="mt-1 text-[13px] text-muted">{status.note}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">Items</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {(items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-4 text-[13px]">
                <span>
                  <span className="text-ink">{item.title}</span>
                  {item.variant ? <span className="text-muted"> · {item.variant}</span> : null}
                  <span className="text-muted"> × {item.qty}</span>
                </span>
                <span className="whitespace-nowrap">{formatPaise(item.line_total_paise)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-[13px]">
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd>{formatPaise(order.subtotal_paise)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>Shipping</dt>
              <dd>{order.shipping_paise === 0 ? "Free" : formatPaise(order.shipping_paise)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-[15px] font-semibold">
              <dt>Total</dt>
              <dd>{formatPaise(order.total_paise)}</dd>
            </div>
          </dl>
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
          </address>

          {order.awb || events.length ? (
            <div className="mt-4 border-t border-line pt-4">
              <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink">
                Tracking
              </h2>
              <TrackingTimeline events={events} awb={order.awb} courier={order.courier} />
            </div>
          ) : null}
        </aside>
      </div>

      <p className="mt-10 text-[13px] text-muted">
        <Link href="/account/orders" className="underline underline-offset-4 transition-colors hover:text-gold">
          All orders
        </Link>
      </p>
    </Container>
  );
}
