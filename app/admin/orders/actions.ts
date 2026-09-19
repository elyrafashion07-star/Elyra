"use server";

import { revalidatePath } from "next/cache";
import { pushToShiprocket } from "@/lib/orders/fulfil";
import { nextOrderStatus } from "@/lib/orders/status";
import { recordTrackingEvents } from "@/lib/orders/tracking";
import { refundPayment } from "@/lib/razorpay/client";
import { trackAwb } from "@/lib/shiprocket/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";
import type { OrderRow, OrderStatus } from "@/lib/supabase/types";

/**
 * Server actions are public HTTP endpoints — the /admin layout guards the page,
 * not the call. Every one of these re-checks the role.
 */

/**
 * Retries a Shiprocket push that failed at checkout time.
 *
 * fulfilOrder swallows Shiprocket errors on purpose: the customer's money has
 * already moved and their order is on record, so a courier outage must not turn
 * into a checkout error. That leaves orders sitting paid-but-unshipped, and this
 * is how they get sent through.
 */
export async function retryShipment(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  if (!orderId) return;

  const db = getSupabaseAdmin();

  // Clear the claim first, or pushToShiprocket sees the earlier attempt's marker
  // and stands down thinking another caller has it.
  await db
    .from("orders")
    .update({ shipment_requested_at: null })
    .eq("id", orderId)
    .is("shiprocket_order_id", null);

  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (order) await pushToShiprocket(order);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order?.order_no ?? ""}`);
}

/**
 * Pulls the latest courier status for an order that already has an AWB.
 *
 * The Shiprocket webhook is the normal path; this is the manual override for
 * when a callback was missed or the webhook is not configured yet.
 */
export async function refreshTracking(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  const awb = String(form.get("awb") ?? "").trim();
  if (!orderId || !awb) return;

  try {
    const tracking = await trackAwb(awb);

    // trackAwb returns the whole checkpoint list; storing it fills in anything
    // the webhook missed while it was misconfigured or down.
    await recordTrackingEvents(
      orderId,
      tracking.checkpoints.map((c) => ({
        status: c.activity || "Update",
        location: c.location,
        happenedAt: c.date,
      })),
    );

    const db = getSupabaseAdmin();
    const { data: order } = await db.from("orders").select("status").eq("id", orderId).maybeSingle();

    const update: Partial<Pick<OrderRow, "courier" | "status">> = {};

    if (tracking.courier) update.courier = tracking.courier;

    // Same forward-only rules as the webhook, so a refresh can never mark a
    // refunded order delivered or walk a delivered one back.
    const next = order ? nextOrderStatus(order.status, tracking.status ?? "") : null;
    if (next) update.status = next;

    if (Object.keys(update).length) {
      await db.from("orders").update(update).eq("id", orderId);
    }
  } catch (err) {
    console.error("[admin] tracking refresh failed:", err instanceof Error ? err.message : err);
  }

  revalidatePath("/admin/orders");
}

/**
 * Refunds the customer in full through Razorpay, then marks the order refunded.
 *
 * Deliberately the only way to reach `refunded`: setting that label by hand told
 * the customer "the amount has been returned" while nothing had moved. The status
 * changes only after Razorpay accepts the refund, so a failure leaves the order
 * as it was and can simply be retried.
 */
export async function refundOrder(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  if (!orderId) return;

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_no, status, total_paise, razorpay_payment_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order?.razorpay_payment_id) return;
  // Only money that actually moved can be returned.
  if (!["paid", "shipped", "delivered", "cancelled"].includes(order.status)) return;

  try {
    await refundPayment({
      paymentId: order.razorpay_payment_id,
      amountPaise: order.total_paise,
      notes: { order_no: order.order_no },
    });
    await db.from("orders").update({ status: "refunded" }).eq("id", order.id);
  } catch (err) {
    console.error("[admin] refund failed:", order.order_no, err instanceof Error ? err.message : err);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.order_no}`);
}

/** Manual status override, for the cases no integration covers. */
export async function setOrderStatus(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  const status = String(form.get("status") ?? "").trim();

  // No "refunded": that one goes through refundOrder so money actually moves.
  const ALLOWED: OrderStatus[] = ["paid", "shipped", "delivered", "cancelled"];
  if (!orderId || !ALLOWED.includes(status as OrderStatus)) return;

  await getSupabaseAdmin()
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
}
