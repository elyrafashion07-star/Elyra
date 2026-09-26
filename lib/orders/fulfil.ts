/**
 * What happens after money moves.
 *
 * Two callers race to mark every order paid: the browser, which gets the
 * Razorpay callback first, and the webhook, which is the one that actually
 * matters because it arrives even if the customer closes the tab mid-payment.
 * Everything here is therefore written to be safe to run twice — guards live in
 * the WHERE clause, so the database decides the winner rather than a read
 * followed by a write.
 *
 * Shipping is a separate, deliberate step: an admin packs the order and that
 * creates the Shiprocket shipment.
 */
import "server-only";
import {
  assignAwb,
  createOrder as createShiprocketOrder,
  isShiprocketConfigured,
} from "@/lib/shiprocket/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/supabase/types";

/** Shiprocket wants "YYYY-MM-DD HH:mm". */
function shiprocketDate(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

/**
 * Moves an order from pending to paid, then returns it as it now stands.
 *
 * The status guard is what makes a second call harmless: it updates zero rows
 * instead of overwriting paid_at with a later timestamp or clobbering the
 * payment id that the first caller recorded.
 *
 * `failed` is allowed through as well as `pending`. Razorpay lets a customer
 * retry on the same order after a declined attempt, and `payment.failed` for the
 * first attempt marks the order failed before the second one succeeds — a
 * captured payment must win over an earlier failure, or the customer is charged
 * for an order that never ships.
 */
export async function markOrderPaid({
  orderId,
  paymentId,
}: {
  orderId: string;
  paymentId: string;
}): Promise<OrderRow | null> {
  const db = getSupabaseAdmin();

  const { error } = await db
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
      failure_reason: null,
    })
    .eq("id", orderId)
    .in("status", ["pending", "failed"]);

  if (error) {
    // Not fatal on its own — the row is re-read below, and if the other caller
    // already marked it paid then there is nothing wrong.
    console.error("[checkout] mark paid failed:", orderId, error.message);
  }

  const { data } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  return data;
}

/** Records a payment that Razorpay told us failed. Never touches a paid order. */
export async function markOrderFailed({
  orderId,
  reason,
}: {
  orderId: string;
  reason: string;
}): Promise<void> {
  const db = getSupabaseAdmin();

  await db
    .from("orders")
    .update({ status: "failed", failure_reason: reason.slice(0, 500) })
    .eq("id", orderId)
    .eq("status", "pending");
}

/**
 * How long a shipment claim is honoured before it is treated as abandoned. A
 * claim is only held for the length of one Shiprocket call, so anything older
 * belongs to a request that crashed or timed out and must not block a retry.
 */
const CLAIM_TTL_MS = 2 * 60 * 1000;

/**
 * `awb` is the tracking number when one was assigned; `awbError` says why not.
 * A missing AWB never fails the shipment itself — the order exists in
 * Shiprocket either way, and the AWB can be requested again from the order page.
 */
export type ShipmentResult =
  | { ok: true; awb: string | null; awbError?: string }
  | { ok: false; error: string };

export type AwbResult = { ok: true; awb: string; courier: string | null } | { ok: false; error: string };

/**
 * Gets a courier and tracking number for a shipment that already exists in
 * Shiprocket, and saves them — so the customer sees the tracking ID the moment
 * the order is packed instead of whenever the first courier webhook arrives.
 */
export async function requestAwb(
  order: Pick<OrderRow, "id" | "order_no" | "shiprocket_shipment_id" | "awb">,
): Promise<AwbResult> {
  if (order.awb) return { ok: true, awb: order.awb, courier: null };
  if (!order.shiprocket_shipment_id) {
    return { ok: false, error: "This order has no Shiprocket shipment yet — press Pack first." };
  }

  let assigned: { awb: string; courier: string | null };
  try {
    assigned = await assignAwb(order.shiprocket_shipment_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shipping] AWB assign failed for", order.order_no, message);
    return { ok: false, error: message };
  }

  return saveAwb(order, assigned);
}

async function saveAwb(
  order: Pick<OrderRow, "id" | "order_no">,
  assigned: { awb: string; courier: string | null },
): Promise<AwbResult> {
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ awb: assigned.awb, ...(assigned.courier ? { courier: assigned.courier } : {}) })
    .eq("id", order.id);

  if (error) {
    // The AWB exists in Shiprocket; "Sync from Shiprocket" will pull it in.
    console.error("[shipping] AWB assigned but not saved:", order.order_no, assigned.awb, error.message);
    return { ok: false, error: `AWB ${assigned.awb} was assigned but could not be saved here — press Sync from Shiprocket.` };
  }

  return { ok: true, ...assigned };
}

/**
 * Creates the Shiprocket shipment for a paid order, at most once. This is what
 * the admin's "Pack" button runs — orders are no longer pushed automatically
 * when they are paid, so nothing reaches Shiprocket until someone has actually
 * packed the parcel.
 *
 * Unlike the old automatic push this reports failure to its caller: it is an
 * admin standing at the screen, and "Shiprocket rejected it, here is why" is
 * exactly what they need. On failure the claim is released, so pressing Pack
 * again simply retries.
 */
export async function createShipment(order: OrderRow): Promise<ShipmentResult> {
  // A "confirmed" order is a COD order — nothing was collected online, but
  // there is nothing to wait on either, so it packs the same as a paid one.
  if (order.status !== "paid" && order.status !== "confirmed") {
    return { ok: false, error: "Only paid or confirmed orders can be packed." };
  }

  // Already created earlier (an older auto-pushed order, or a retry after the
  // status update failed) — nothing to send, just let the caller mark it packed.
  if (order.shiprocket_order_id) {
    if (order.awb || !order.shiprocket_shipment_id) return { ok: true, awb: order.awb };
    const awb = await requestAwb(order);
    return awb.ok ? { ok: true, awb: awb.awb } : { ok: true, awb: null, awbError: awb.error };
  }

  if (!isShiprocketConfigured) {
    return { ok: false, error: "Shiprocket is not configured on this server." };
  }

  const db = getSupabaseAdmin();

  // Claim the push. The WHERE means exactly one concurrent caller gets a row
  // back; everyone else sees nothing and stands down.
  const staleBefore = new Date(Date.now() - CLAIM_TTL_MS).toISOString();
  const { data: claimed } = await db
    .from("orders")
    .update({ shipment_requested_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("shiprocket_order_id", null)
    .or(`shipment_requested_at.is.null,shipment_requested_at.lt.${staleBefore}`)
    .select("id")
    .maybeSingle();

  if (!claimed) {
    return { ok: false, error: "This order is already being sent to Shiprocket. Refresh in a moment." };
  }

  /** Hands the claim back so the next click can try again. */
  const release = () =>
    db
      .from("orders")
      .update({ shipment_requested_at: null })
      .eq("id", order.id)
      .is("shiprocket_order_id", null);

  const { data: items } = await db.from("order_items").select("*").eq("order_id", order.id);

  if (!items?.length) {
    await release();
    return { ok: false, error: "This order has no items, so there is nothing to ship." };
  }

  let created: Awaited<ReturnType<typeof createShiprocketOrder>>;
  try {
    created = await createShiprocketOrder({
      orderId: order.order_no,
      orderDate: shiprocketDate(order.created_at),
      billing: {
        name: order.ship_name,
        address: order.ship_line1,
        address2: order.ship_line2 ?? "",
        city: order.ship_city,
        state: order.ship_state,
        pincode: order.ship_pincode,
        email: order.ship_email,
        phone: order.ship_phone,
      },
      // Shiprocket is denominated in rupees, unlike our ledger.
      items: items.map((i) => ({
        name: i.title,
        sku: i.variant ? `${i.product_handle}-${i.variant}` : i.product_handle,
        units: i.qty,
        sellingPrice: i.unit_price_paise / 100,
      })),
      paymentMethod: order.payment_method === "cod" ? "COD" : "Prepaid",
      subTotal: order.total_paise / 100,
      totalDiscount: order.discount_paise / 100,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shipping] Shiprocket create failed for", order.order_no, message);
    await release();
    return { ok: false, error: `Shiprocket rejected the order: ${message}` };
  }

  const { error } = await db
    .from("orders")
    .update({
      shiprocket_order_id: String(created.order_id),
      shiprocket_shipment_id: String(created.shipment_id),
    })
    .eq("id", order.id);

  if (error) {
    // The shipment exists in Shiprocket but we could not record it. The claim is
    // deliberately left in place (it expires on its own) so a hurried second click
    // does not create a duplicate — check Shiprocket before retrying.
    console.error("[shipping] created in Shiprocket but not saved:", order.order_no, created, error.message);
    return {
      ok: false,
      error: `Created in Shiprocket (order ${created.order_id}) but could not be saved here. Check Shiprocket before trying again.`,
    };
  }

  // With auto-assign on in Shiprocket the AWB is already in the create response;
  // otherwise ask for one now rather than waiting on the courier webhook.
  const ids = { id: order.id, order_no: order.order_no };
  const autoAwb = created.awb_code == null ? "" : String(created.awb_code).trim();
  const awb = autoAwb
    ? await saveAwb(ids, { awb: autoAwb, courier: created.courier_name?.trim() || null })
    : await requestAwb({ ...ids, shiprocket_shipment_id: String(created.shipment_id), awb: null });

  return awb.ok ? { ok: true, awb: awb.awb } : { ok: true, awb: null, awbError: awb.error };
}

/**
 * What happens when money lands: mark the order paid, and stop there.
 *
 * The parcel is not sent to Shiprocket here any more — it waits in the admin
 * panel until someone packs it (see createShipment). Safe to call from both the
 * browser and the webhook.
 */
export async function fulfilOrder({
  orderId,
  paymentId,
}: {
  orderId: string;
  paymentId: string;
}): Promise<OrderRow | null> {
  return markOrderPaid({ orderId, paymentId });
}
