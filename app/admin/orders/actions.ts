"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createShipment } from "@/lib/orders/fulfil";
import { nextOrderStatus } from "@/lib/orders/status";
import { recordTrackingEvents } from "@/lib/orders/tracking";
import { refundPayment } from "@/lib/razorpay/client";
import { cancelOrders, getOrder, trackAwb } from "@/lib/shiprocket/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";
import type { OrderRow, OrderStatus } from "@/lib/supabase/types";

/**
 * Server actions are public HTTP endpoints — the /admin layout guards the page,
 * not the call. Every one of these re-checks the role.
 */

/**
 * Where an action lands, with a message for the admin to read. Server actions
 * cannot hand a value back to a plain `<form action>`, so the outcome travels on
 * the query string and the page renders it as a banner.
 */
function landing(orderNo: string, from: "list" | "order", msg: { error?: string; notice?: string }) {
  const base = from === "list" ? "/admin/orders" : `/admin/orders/${orderNo}`;
  const qs = new URLSearchParams();
  if (msg.error) qs.set("error", msg.error);
  if (msg.notice) qs.set("notice", msg.notice);
  if (from === "list") qs.set("order", orderNo);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

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
  redirect(landing(order.order_no, from, failure ? { error: failure } : { notice: `${order.order_no} packed — Shiprocket order created.` }));
}

/**
 * Pulls courier checkpoints for an AWB and applies the resulting status.
 * Shared by "Refresh tracking" and "Sync from Shiprocket".
 */
async function pullTracking(orderId: string, awb: string): Promise<void> {
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
    await pullTracking(orderId, awb);
  } catch (err) {
    console.error("[admin] tracking refresh failed:", err instanceof Error ? err.message : err);
  }

  revalidatePath("/admin/orders");
}

/**
 * Asks Shiprocket directly what happened to an order, instead of waiting for a
 * webhook. Picks up a cancellation, an AWB and courier assigned in the Shiprocket
 * panel, and (once there is an AWB) the courier's checkpoints.
 *
 * Needed because Shiprocket does not reliably send a webhook for an order that
 * was cancelled before a courier was assigned — so the panel here never heard.
 */
export async function syncFromShiprocket(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  if (!orderId) return;

  const db = getSupabaseAdmin();
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return;

  let outcome: { error?: string; notice?: string };

  if (!order.shiprocket_order_id) {
    outcome = { error: "This order has not been sent to Shiprocket yet — there is nothing to sync." };
  } else {
    try {
      const remote = await getOrder(order.shiprocket_order_id);
      const changes: string[] = [];
      const update: Partial<Pick<OrderRow, "awb" | "courier" | "status">> = {};

      if (remote.awb && remote.awb !== order.awb) {
        update.awb = remote.awb;
        changes.push(`AWB ${remote.awb}`);
      }
      if (remote.courier && remote.courier !== order.courier) {
        update.courier = remote.courier;
        changes.push(`courier ${remote.courier}`);
      }

      // Shiprocket's own order status ("CANCELED", "DELIVERED"…) goes through the
      // same forward-only mapping as courier updates.
      const next = nextOrderStatus(order.status, remote.status ?? "");
      if (next) {
        update.status = next;
        changes.push(`status ${next}`);
      }

      if (Object.keys(update).length) {
        await db.from("orders").update(update).eq("id", order.id);
      }

      const awb = update.awb ?? order.awb;
      if (awb) {
        try {
          await pullTracking(order.id, awb);
        } catch (err) {
          console.error("[admin] sync tracking failed:", order.order_no, err instanceof Error ? err.message : err);
        }
      }

      outcome = {
        notice: changes.length
          ? `Synced from Shiprocket: ${changes.join(", ")}.`
          : `Already up to date. Shiprocket says: ${remote.status ?? "no status yet"}.`,
      };
    } catch (err) {
      console.error("[admin] Shiprocket sync failed:", order.order_no, err instanceof Error ? err.message : err);
      outcome = { error: `Could not reach Shiprocket: ${err instanceof Error ? err.message : "unknown error"}` };
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.order_no}`);
  redirect(landing(order.order_no, "order", outcome));
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

  if (!order) return;

  let outcome: { error?: string; notice?: string };

  if (!order.razorpay_payment_id) {
    outcome = { error: "This order has no captured payment, so there is nothing to refund." };
  } else if (!["paid", "packed", "shipped", "delivered", "cancelled"].includes(order.status)) {
    // Only money that actually moved can be returned.
    outcome = { error: `An order that is ${order.status} cannot be refunded.` };
  } else {
    try {
      await refundPayment({
        paymentId: order.razorpay_payment_id,
        amountPaise: order.total_paise,
        notes: { order_no: order.order_no },
      });
      await db.from("orders").update({ status: "refunded" }).eq("id", order.id);
      outcome = { notice: "Refund issued through Razorpay. It reaches the customer in 5–7 working days." };
    } catch (err) {
      console.error("[admin] refund failed:", order.order_no, err instanceof Error ? err.message : err);
      outcome = { error: `Refund failed: ${err instanceof Error ? err.message : "unknown error"}` };
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.order_no}`);
  redirect(landing(order.order_no, "order", outcome));
}

/**
 * Manual status override, for the cases no integration covers.
 *
 * Cancelling also cancels the shipment in Shiprocket when one exists, so the
 * courier is not sent to collect a parcel for an order we have called off. That
 * part is best effort: Shiprocket refuses once a parcel is with the courier, and
 * the order should still be marked cancelled here — the admin is told to finish
 * it in the Shiprocket panel instead.
 */
export async function setOrderStatus(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  const status = String(form.get("status") ?? "").trim();

  // No "refunded": that one goes through refundOrder so money actually moves.
  const ALLOWED: OrderStatus[] = ["paid", "packed", "shipped", "delivered", "cancelled"];
  if (!orderId || !ALLOWED.includes(status as OrderStatus)) return;

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_no, status, shiprocket_order_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const { error } = await db
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", order.id);

  let outcome: { error?: string; notice?: string };

  if (error) {
    console.error("[admin] status update failed:", order.order_no, error.message);
    outcome = {
      error:
        status === "packed"
          ? "Could not set packed. Run migration 0008 in Supabase, then try again."
          : `Could not update the status: ${error.message}`,
    };
  } else if (status === "cancelled" && order.shiprocket_order_id && order.status !== "cancelled") {
    try {
      await cancelOrders([Number(order.shiprocket_order_id)]);
      outcome = { notice: "Marked cancelled here and cancelled in Shiprocket. Use Refund to return the money." };
    } catch (err) {
      console.error("[admin] Shiprocket cancel failed:", order.order_no, err instanceof Error ? err.message : err);
      outcome = {
        error: `Marked cancelled here, but Shiprocket did not cancel it (${
          err instanceof Error ? err.message : "unknown error"
        }). Cancel it in the Shiprocket panel too.`,
      };
    }
  } else {
    outcome = {
      notice:
        status === "cancelled"
          ? "Marked cancelled. Use Refund to return the money."
          : `Status set to ${status}.`,
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.order_no}`);
  redirect(landing(order.order_no, "order", outcome));
}
