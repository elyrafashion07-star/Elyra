/**
 * Courier status → order status, shared by the Shiprocket webhook and the admin
 * "refresh tracking" button so the two can never disagree.
 */
import type { OrderStatus } from "@/lib/supabase/types";

/**
 * Their status strings vary by courier and change over time, so this matches
 * conservatively and falls through to "no change" rather than guessing. An
 * unmapped status is not an error: most of them ("PICKUP SCHEDULED") are detail
 * we already cover with `shipped`.
 *
 * Watch the substrings: "UNDELIVERED" (a failed attempt) and "RTO DELIVERED"
 * (the parcel came back to us) both contain "DELIVERED" and must not count as a
 * delivery, and "CANCELLATION REQUESTED" is a request, not a cancellation.
 */
export function mapCourierStatus(raw: string): OrderStatus | null {
  const status = raw.toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!status) return null;

  // Anything on the way back to us is not progress towards the customer.
  if (/\bRTO\b|\bRETURN(ED)? TO (ORIGIN|SELLER)\b|\bUNDELIVERED\b|\bNOT DELIVERED\b/.test(status)) {
    return null;
  }

  if (/\bDELIVERED\b/.test(status)) return "delivered";
  if (/\bCANCELL?ED\b/.test(status)) return "cancelled";
  if (
    status.includes("SHIPPED") ||
    status.includes("IN TRANSIT") ||
    status.includes("PICKED UP") ||
    status.includes("OUT FOR DELIVERY")
  ) {
    return "shipped";
  }
  return null;
}

/** Only these can be moved by a courier update. */
const ADVANCEABLE: OrderStatus[] = ["paid", "packed", "shipped"];

/**
 * The status an order should move to given a courier update, or null to leave it.
 *
 * Only ever moves forward: a late "in transit" callback after "delivered" must
 * not walk the order backwards, and a refunded, cancelled or unpaid order is not
 * something a courier update should overwrite.
 */
export function nextOrderStatus(current: OrderStatus, rawCourierStatus: string): OrderStatus | null {
  const mapped = mapCourierStatus(rawCourierStatus);
  if (!mapped || mapped === current) return null;
  if (!ADVANCEABLE.includes(current)) return null;
  return mapped;
}
