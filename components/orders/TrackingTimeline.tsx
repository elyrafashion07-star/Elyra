import { Circle, MapPin } from "lucide-react";
import type { OrderTrackingEventRow } from "@/lib/supabase/types";

/**
 * The parcel's journey, newest first.
 *
 * Shown to both the admin and the customer — the data is the same, and neither
 * needs anything the other should not see.
 */
export default function TrackingTimeline({
  events,
  awb,
  courier,
}: {
  events: OrderTrackingEventRow[];
  awb?: string | null;
  courier?: string | null;
}) {
  if (!events.length) {
    return (
      <p className="mt-3 text-[13px] text-muted">
        {awb
          ? "No courier updates yet. They usually start within a few hours of pickup."
          : "Tracking appears here once the courier is assigned."}
      </p>
    );
  }

  return (
    <div className="mt-4">
      {awb ? (
        <p className="mb-4 text-[13px] text-ink-soft">
          AWB <span className="text-ink">{awb}</span>
          {courier ? ` · ${courier}` : ""}
        </p>
      ) : null}

      <ol className="relative space-y-5 border-l border-line pl-6">
        {events.map((event, i) => (
          <li key={event.id} className="relative">
            {/* -left puts the dot on the rail; the newest one is filled. */}
            <Circle
              className={`absolute -left-[30px] top-1 h-2.5 w-2.5 ${
                i === 0 ? "fill-gold text-gold" : "fill-line text-line"
              }`}
            />

            <p className={`text-[13px] ${i === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}>
              {event.status}
            </p>

            {event.note && event.note !== event.status ? (
              <p className="mt-0.5 text-[12px] text-muted">{event.note}</p>
            ) : null}

            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
              <time dateTime={event.happened_at}>
                {new Date(event.happened_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              {event.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {event.location}
                </span>
              ) : null}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
