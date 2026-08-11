"use server";

import { revalidatePath } from "next/cache";
import { fulfilOrder, markOrderFailed } from "@/lib/orders/fulfil";
import { priceCart, type CartLineInput } from "@/lib/orders/pricing";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayKeyId,
  verifyPaymentSignature,
} from "@/lib/razorpay/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

export type Address = {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

/** Everything the browser needs to open the Razorpay widget. */
export type StartResult =
  | {
      ok: true;
      orderId: string;
      orderNo: string;
      razorpayOrderId: string;
      keyId: string;
      amountPaise: number;
      name: string;
      email: string;
      phone: string;
    }
  | { ok: false; error: string };

export type ConfirmResult = { ok: true; orderNo: string } | { ok: false; error: string };

const PINCODE = /^[1-9][0-9]{5}$/;
const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shiprocket rejects an address with a bad pincode or phone *after* the customer
 * has already paid, which is the worst possible moment to find out. Checking the
 * shapes here keeps that failure on the form.
 */
function validate(address: Address): string | null {
  if (!address.name?.trim()) return "Enter the full name for delivery.";
  if (!PHONE.test(address.phone?.trim() ?? "")) {
    return "Enter a valid 10-digit Indian mobile number.";
  }
  if (!EMAIL.test(address.email?.trim() ?? "")) return "Enter a valid email address.";
  if (!address.line1?.trim()) return "Enter the address.";
  if (!address.city?.trim()) return "Enter the city.";
  if (!address.state?.trim()) return "Enter the state.";
  if (!PINCODE.test(address.pincode?.trim() ?? "")) return "Enter a valid 6-digit pin code.";
  return null;
}

/**
 * Creates the order, then the Razorpay order to pay for it.
 *
 * The DB row comes first on purpose: it is what the webhook looks the payment up
 * against, and a payment that arrives for an order we never recorded is far
 * harder to reconcile than an unpaid order sitting in `pending`.
 */
export async function startCheckout({
  lines,
  address,
  note,
}: {
  lines: CartLineInput[];
  address: Address;
  note?: string;
}): Promise<StartResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Please sign in to place an order." };

  if (!isRazorpayConfigured) {
    console.error("[checkout] Razorpay env vars missing");
    return { ok: false, error: "Payments are temporarily unavailable. Please try again shortly." };
  }

  const invalid = validate(address);
  if (invalid) return { ok: false, error: invalid };

  // Prices come from the database, never from the cart the browser sent.
  const priced = await priceCart(lines);
  if (!priced.ok) return { ok: false, error: priced.error };

  const { items, subtotalPaise, shippingPaise, discountPaise, totalPaise } = priced.cart;
  const db = getSupabaseAdmin();

  const { data: order, error } = await db
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      discount_paise: discountPaise,
      total_paise: totalPaise,
      currency: "INR",
      ship_name: address.name.trim(),
      ship_phone: address.phone.trim(),
      ship_email: address.email.trim(),
      ship_line1: address.line1.trim(),
      ship_line2: address.line2?.trim() || null,
      ship_city: address.city.trim(),
      ship_state: address.state.trim(),
      ship_pincode: address.pincode.trim(),
      ship_country: "India",
      razorpay_order_id: null,
      razorpay_payment_id: null,
      paid_at: null,
      shipment_requested_at: null,
      shiprocket_order_id: null,
      shiprocket_shipment_id: null,
      awb: null,
      courier: null,
      note: note?.trim() || null,
      failure_reason: null,
    })
    .select()
    .single();

  if (error || !order) {
    console.error("[checkout] order insert failed:", error?.message);
    return { ok: false, error: "We could not start your order. Please try again." };
  }

  const { error: itemsError } = await db
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    console.error("[checkout] order items insert failed:", itemsError.message);
    await markOrderFailed({ orderId: order.id, reason: "items insert failed" });
    return { ok: false, error: "We could not start your order. Please try again." };
  }

  try {
    const rzp = await createRazorpayOrder({
      amountPaise: totalPaise,
      receipt: order.order_no,
      notes: { order_no: order.order_no, order_id: order.id },
    });

    await db.from("orders").update({ razorpay_order_id: rzp.id }).eq("id", order.id);

    return {
      ok: true,
      orderId: order.id,
      orderNo: order.order_no,
      razorpayOrderId: rzp.id,
      keyId: razorpayKeyId(),
      amountPaise: totalPaise,
      name: order.ship_name,
      email: order.ship_email,
      phone: order.ship_phone,
    };
  } catch (err) {
    console.error("[checkout] Razorpay order failed:", err instanceof Error ? err.message : err);
    await markOrderFailed({ orderId: order.id, reason: "razorpay order creation failed" });
    return { ok: false, error: "We could not reach the payment gateway. Please try again." };
  }
}

/**
 * Confirms the payment the browser just reported.
 *
 * The signature is the whole security boundary: without it this is just the
 * browser asserting it paid. The webhook covers the same ground independently,
 * so a customer who closes the tab here still ends up with a fulfilled order —
 * this path exists to make the confirmation instant, not to be the only one.
 */
export async function confirmPayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  signature,
}: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): Promise<ConfirmResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Please sign in to place an order." };

  if (!verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature })) {
    console.error("[checkout] signature mismatch for order", orderId);
    return { ok: false, error: "We could not verify that payment. Please contact us before retrying." };
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_no, user_id, razorpay_order_id")
    .eq("id", orderId)
    .maybeSingle();

  // A valid signature for somebody else's order is still somebody else's order.
  if (!order || order.user_id !== user.id || order.razorpay_order_id !== razorpayOrderId) {
    return { ok: false, error: "That order could not be found." };
  }

  await fulfilOrder({ orderId, paymentId: razorpayPaymentId });

  revalidatePath("/account");
  return { ok: true, orderNo: order.order_no };
}
