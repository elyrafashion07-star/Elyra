/**
 * Recording courier checkpoints.
 *
 * Two callers write here: the Shiprocket webhook, which pushes as things happen,
 * and the admin "refresh tracking" button, which pulls the whole history at
 * once. Both replay checkpoints they have already sent, so every insert here is
 * written to be safe to repeat.
 */
import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderTrackingEventRow } from "@/lib/supabase/types";

export type TrackingEventInput = {
  status: string;
  location?: string | null;
  note?: string | null;
  /** ISO timestamp. Defaults to now when the courier gives no date. */
  happenedAt?: string | null;
};

/**
 * Shiprocket's dates arrive in assorted shapes ("2026-08-14 16:22:00", ISO,
 * sometimes empty). Anything unparseable falls back to now rather than throwing
 * away the checkpoint.
 */
function toIso(value: string | null | undefined): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Inserts checkpoints, ignoring any that are already stored.
 *
 * The `(order_id, status, happened_at)` unique constraint from 0006 is what
 * de-duplicates — `ignoreDuplicates` turns a repeat delivery into a no-op
 * instead of an error, which is what lets the webhook and the refresh button
 * both replay freely.
 */
export async function recordTrackingEvents(
  orderId: string,
  events: TrackingEventInput[],
): Promise<void> {
  if (!events.length) return;

  const rows = events
    .filter((e) => e.status?.trim())
    .map((e) => ({
      order_id: orderId,
      status: e.status.trim(),
      location: e.location?.trim() || null,
      note: e.note?.trim() || null,
      happened_at: toIso(e.happenedAt),
    }));

  if (!rows.length) return;

  const { error } = await getSupabaseAdmin()
    .from("order_tracking_events")
    .upsert(rows, {
      onConflict: "order_id,status,happened_at",
      ignoreDuplicates: true,
    });

  if (error) console.error("[tracking] could not record events:", error.message);
}

/** Newest first, for the timeline. */
export async function getTrackingEvents(orderId: string): Promise<OrderTrackingEventRow[]> {
  const { data } = await getSupabaseAdmin()
    .from("order_tracking_events")
    .select("*")
    .eq("order_id", orderId)
    .order("happened_at", { ascending: false });

  return data ?? [];
}
