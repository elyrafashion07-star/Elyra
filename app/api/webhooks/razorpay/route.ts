import { NextResponse, type NextRequest } from "next/server";
import { fulfilOrder, markOrderFailed } from "@/lib/orders/fulfil";
import { verifyWebhookSignature } from "@/lib/razorpay/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Razorpay webhook — the authoritative half of checkout.
 *
 * The browser callback in app/checkout/actions.ts is a convenience: it makes the
 * confirmation instant for someone watching the page. This is what guarantees an
 * order is fulfilled at all, because it still arrives when the customer closes
 * the tab, loses signal, or the UPI app takes ninety seconds to come back.
 *
 * Set it up in Razorpay → Settings → Webhooks:
 *   URL     https://<site>/api/webhooks/razorpay
 *   Events  payment.captured, payment.failed
 *   Secret  the same value as RAZORPAY_WEBHOOK_SECRET
 */

type PaymentEntity = {
  id?: string;
  order_id?: string;
  error_description?: string;
  error_reason?: string;
};

export async function POST(request: NextRequest) {
  // Raw text, never request.json(): the signature is computed over these exact
  // bytes, and re-serialising parsed JSON changes them (key order, whitespace)
  // so the HMAC would never match.
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  try {
    if (!verifyWebhookSignature(raw, signature)) {
      console.error("[razorpay] webhook signature mismatch");
      return NextResponse.json({ error: "bad signature" }, { status: 400 });
    }
  } catch (err) {
    // Secret not configured — a 500 makes Razorpay retry, which is what we want
    // once the env var is actually set.
    console.error("[razorpay] webhook not verifiable:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;

  // Anything we do not handle is still a success — returning non-2xx would make
  // Razorpay retry an event we are never going to act on.
  if (!razorpayOrderId || !payment?.id) {
    return NextResponse.json({ ok: true, ignored: event.event ?? "unknown" });
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_no")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (!order) {
    // Worth shouting about: a payment exists for an order we have no record of.
    console.error("[razorpay] webhook for unknown order:", razorpayOrderId);
    return NextResponse.json({ ok: true, ignored: "unknown order" });
  }

  try {
    if (event.event === "payment.captured") {
      await fulfilOrder({ orderId: order.id, paymentId: payment.id });
    } else if (event.event === "payment.failed") {
      await markOrderFailed({
        orderId: order.id,
        reason: payment.error_description ?? payment.error_reason ?? "payment failed",
      });
    }
  } catch (err) {
    // 500 so Razorpay retries — better a duplicate delivery, which fulfilOrder
    // is built to absorb, than an order that silently never ships.
    console.error("[razorpay] webhook handling failed:", order.order_no, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
