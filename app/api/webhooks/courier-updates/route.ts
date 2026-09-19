import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { nextOrderStatus } from "@/lib/orders/status";
import { recordTrackingEvents } from "@/lib/orders/tracking";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/supabase/types";

/**
 * Shiprocket status webhook.
 *
 * Nothing else fills in `awb` and `courier`: those are assigned only once a
 * courier is allocated, which happens minutes to hours after the order is
 * pushed. Polling every pending order would be wasteful, so Shiprocket pushes
 * to us instead.
 *
 * Set it up in Shiprocket → Settings → API → Webhooks (the URL must not contain
 * "shiprocket", "sr", "kr" etc. — Shiprocket rejects such addresses):
 *   URL    https://<site>/api/webhooks/courier-updates
 *   Token  the same value as SHIPROCKET_WEBHOOK_TOKEN
 *
 * Shiprocket authenticates with a shared token header rather than a signature,
 * so there is no body signing to verify here — only the token.
 */

/** Constant-time compare, so a wrong token cannot be guessed a character at a time. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

type Payload = {
  order_id?: string | number;
  awb?: string | number;
  courier_name?: string;
  current_status?: string;
  shipment_status?: string;
  current_timestamp?: string;
  location?: string;
  /** Some payloads carry the whole history rather than just the latest hop. */
  scans?: { date?: string; activity?: string; location?: string; status?: string }[];
};

export async function POST(request: NextRequest) {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;

  if (!expected) {
    console.error("[shiprocket] webhook token not configured — SHIPROCKET_WEBHOOK_TOKEN");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const token = request.headers.get("x-api-key") ?? "";
  if (!safeEqual(token, expected)) {
    console.error("[shiprocket] webhook token mismatch");
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // `order_id` is what we sent as our order_no when creating the shipment.
  const orderNo = payload.order_id == null ? "" : String(payload.order_id).trim();
  if (!orderNo) return NextResponse.json({ ok: true, ignored: "no order id" });

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, order_no, status")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order) {
    console.error("[shiprocket] webhook for unknown order:", orderNo);
    return NextResponse.json({ ok: true, ignored: "unknown order" });
  }

  // Store the journey before touching the order row: even a callback that
  // changes nothing on the order is still a checkpoint worth keeping.
  const rawStatus = payload.current_status ?? payload.shipment_status ?? "";
  await recordTrackingEvents(order.id, [
    ...(payload.scans ?? []).map((scan) => ({
      status: scan.status || scan.activity || "",
      location: scan.location,
      note: scan.activity,
      happenedAt: scan.date,
    })),
    ...(rawStatus
      ? [{ status: rawStatus, location: payload.location, happenedAt: payload.current_timestamp }]
      : []),
  ]);

  // Typed rather than a loose record: `status` has to stay an OrderStatus, and
  // a stray key here would be written straight to the row.
  const update: Partial<Pick<OrderRow, "awb" | "courier" | "status">> = {};

  if (payload.awb) update.awb = String(payload.awb);
  if (payload.courier_name) update.courier = payload.courier_name;

  // Forward-only, and conservative about what counts as delivered — see status.ts.
  const nextStatus = nextOrderStatus(order.status, rawStatus);
  if (nextStatus) update.status = nextStatus;

  if (!Object.keys(update).length) {
    return NextResponse.json({ ok: true, ignored: "nothing to change" });
  }

  const { error } = await db.from("orders").update(update).eq("id", order.id);

  if (error) {
    // 500 so Shiprocket retries rather than dropping a tracking number.
    console.error("[shiprocket] order update failed:", order.order_no, error.message);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: Object.keys(update) });
}
