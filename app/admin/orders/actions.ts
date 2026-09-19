"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createShipment } from "@/lib/orders/fulfil";
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
 * Marks a paid order as packed, creating its Shiprocket shipment on the way.
 *
 * This is the only thing that sends an order to Shiprocket: nothing is pushed
 * when the customer pays, so the parcel is only booked once someone has really
 * packed it. The status moves to `packed` only after Shiprocket accepts the
 * order — on failure it stays `paid`, the reason is shown on the page, and
 * pressing Pack again retries.
 *
 * `from` is where to land afterwards (the list or the order page) so an admin
 * working down the queue is not thrown to a different screen.
 */
export async function packOrder(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  const from = String(form.get("from") ?? "") === "list" ? "list" : "order";
  if (!orderId) return;

  const db = getSupabaseAdmin();
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return;

  const back = (packError?: string) => {
    const base = from === "list" ? "/admin/orders" : `/admin/orders/${order.order_no}`;
    const qs = packError
      ? `?packError=${encodeURIComponent(packError)}&packOrder=${encodeURIComponent(order.order_no)}`
      : "";
    return `${base}${qs}`;
  };

  let failure: string | null = null;

  if (order.status !== "paid") {
    failure = "Only paid orders can be packed.";
  } else {
    const shipment = await createShipment(order);

    if (!shipment.ok) {
      failure = shipment.error;
    } else {
      const { error } = await db
        .from("orders")
        .update({ status: "packed" })
        .eq("id", order.id)
        .eq("status", "paid");

      if (error) {
        // Almost always: migration 0008 has not been run, so the database does not
        // know the "packed" status yet. The shipment is already saved, so the next
        // click skips Shiprocket and only retries this step.
        console.error("[admin] could not mark packed:", order.order_no, error.message);
        failure = "Shipment created, but the order could not be marked packed. Run migration 0008 and press Pack again.";
      }
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.order_no}`);
  revalidatePath("/admin");

  // redirect() throws, so it has to sit outside any try/catch.
  redirect(back(failure ?? undefined));
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
  if (!["paid", "packed", "shipped", "delivered", "cancelled"].includes(order.status)) return;

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
  const ALLOWED: OrderStatus[] = ["paid", "packed", "shipped", "delivered", "cancelled"];
  if (!orderId || !ALLOWED.includes(status as OrderStatus)) return;

  await getSupabaseAdmin()
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
}
