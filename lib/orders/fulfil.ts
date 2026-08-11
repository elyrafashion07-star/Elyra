/**
 * What happens after money moves.
 *
 * Two callers race to run this for every order: the browser, which gets the
 * Razorpay callback first, and the webhook, which is the one that actually
 * matters because it arrives even if the customer closes the tab mid-payment.
 * Everything here is therefore written to be safe to run twice — guards live in
 * the WHERE clause, so the database decides the winner rather than a read
 * followed by a write.
 */
import "server-only";
import { createOrder as createShiprocketOrder, isShiprocketConfigured } from "@/lib/shiprocket/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/supabase/types";

/** Shiprocket wants "YYYY-MM-DD HH:mm". */
function shiprocketDate(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}

/**
 * Moves an order from pending to paid, then returns it as it now stands.
 *
 * The `status = 'pending'` guard is what makes a second call harmless: it
 * updates zero rows instead of overwriting paid_at with a later timestamp or
 * clobbering the payment id that the first caller recorded.
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
    })
    .eq("id", orderId)
    .eq("status", "pending");

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
 * Pushes a paid order to Shiprocket, at most once.
 *
 * A failure here is deliberately not propagated to the customer: their money has
 * already moved, and the order is on record. It leaves shipment_requested_at set
 * and the Shiprocket ids null, which is exactly the state to look for when
 * retrying by hand.
 */
export async function pushToShiprocket(order: OrderRow): Promise<void> {
  if (order.status !== "paid") return;
  if (order.shiprocket_order_id) return;

  if (!isShiprocketConfigured) {
    console.error("[checkout] Shiprocket not configured — order not shipped:", order.order_no);
    return;
  }

  const db = getSupabaseAdmin();

  // Claim the push. `is null` in the WHERE means exactly one concurrent caller
  // gets a row back; everyone else sees nothing and returns.
  const { data: claimed } = await db
    .from("orders")
    .update({ shipment_requested_at: new Date().toISOString() })
    .eq("id", order.id)
    .is("shipment_requested_at", null)
    .select("id")
    .maybeSingle();

  if (!claimed) return;

  const { data: items } = await db
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (!items?.length) {
    console.error("[checkout] order has no items, not shipping:", order.order_no);
    return;
  }

  try {
    const result = await createShiprocketOrder({
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
      paymentMethod: "Prepaid",
      subTotal: order.total_paise / 100,
    });

    await db
      .from("orders")
      .update({
        shiprocket_order_id: String(result.order_id),
        shiprocket_shipment_id: String(result.shipment_id),
      })
      .eq("id", order.id);
  } catch (err) {
    console.error(
      "[checkout] Shiprocket push failed for",
      order.order_no,
      err instanceof Error ? err.message : err,
    );
  }
}

/** Mark paid and ship, in that order. Safe to call from both the browser and the webhook. */
export async function fulfilOrder({
  orderId,
  paymentId,
}: {
  orderId: string;
  paymentId: string;
}): Promise<OrderRow | null> {
  const order = await markOrderPaid({ orderId, paymentId });
  if (order) await pushToShiprocket(order);
  return order;
}
