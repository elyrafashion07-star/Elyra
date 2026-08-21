"use server";

import { revalidatePath } from "next/cache";
import { pushToShiprocket } from "@/lib/orders/fulfil";
import { recordTrackingEvents } from "@/lib/orders/tracking";
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

    const update: Partial<Pick<OrderRow, "courier" | "status">> = {};

    if (tracking.courier) update.courier = tracking.courier;

    const status = (tracking.status ?? "").toUpperCase();
    if (status.includes("DELIVERED")) update.status = "delivered";
    else if (status.includes("TRANSIT") || status.includes("PICKED")) update.status = "shipped";

    if (Object.keys(update).length) {
      await getSupabaseAdmin().from("orders").update(update).eq("id", orderId);
    }
  } catch (err) {
    console.error("[admin] tracking refresh failed:", err instanceof Error ? err.message : err);
  }

  revalidatePath("/admin/orders");
}

/** Manual status override, for the cases no integration covers. */
export async function setOrderStatus(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const orderId = String(form.get("order_id") ?? "").trim();
  const status = String(form.get("status") ?? "").trim();

  const ALLOWED: OrderStatus[] = ["paid", "shipped", "delivered", "cancelled", "refunded"];
  if (!orderId || !ALLOWED.includes(status as OrderStatus)) return;

  await getSupabaseAdmin()
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
}
