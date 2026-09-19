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
 * Shiprocket's dates arrive in assorted shapes ("2026-08-14 16:22:00",
 * "14 08 2026 16:22:00", ISO, sometimes empty) and carry no timezone. They are
 * India time; parsing them as-is would read them in the server's zone (UTC on
 * most hosts) and shift every checkpoint by five and a half hours. Anything
 * unparseable falls back to now rather than throwing away the checkpoint.
 */
const IST = "+05:30";

function toIso(value: string | null | undefined): string {
  const fallback = new Date().toISOString();
  const raw = value?.trim();
  if (!raw) return fallback;

  let candidate = raw;

  const dayFirst = raw.match(/^(\d{2})[ /-](\d{2})[ /-](\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (dayFirst) {
    const [, dd, mm, yyyy, hh, min, ss = "00"] = dayFirst;
    candidate = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${IST}`;
  } else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    // No offset on the string: it is IST.
    candidate = `${raw.replace(" ", "T")}${IST}`;
  } else if (!raw.includes("T")) {
    candidate = raw.replace(" ", "T");
  }

  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
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
