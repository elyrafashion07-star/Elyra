/**
 * Turns a code the customer typed into a discount.
 *
 * Like pricing.ts, nothing here trusts the browser: the code comes in, and the
 * amount comes out of the coupons table. Uses are counted from orders rather
 * than a counter column, so a failed or cancelled order gives its use back.
 */
import "server-only";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CouponRow } from "@/lib/supabase/types";

/**
 * Razorpay refuses to charge less than Rs. 1, so a coupon never takes the
 * total below this.
 */
const MIN_TOTAL_PAISE = 100;

/**
 * A pending order holds its use for this long — long enough to finish paying,
 * short enough that an abandoned payment window does not burn the coupon.
 */
const PENDING_HOLD_MS = 30 * 60 * 1000;

/** Statuses whose orders never count as having used a coupon. */
const RELEASED = ["failed", "cancelled", "refunded"];

export function normaliseCode(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase();
}

export type CouponResult =
  | { ok: true; code: string; discountPaise: number }
  | { ok: false; error: string };

/** How many orders have used `code` — optionally only this customer's. */
export async function countUses(code: string, userId?: string): Promise<number> {
  const since = new Date(Date.now() - PENDING_HOLD_MS).toISOString();

  let query = getSupabaseAdmin()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("coupon_code", code)
    .not("status", "in", `(${RELEASED.join(",")})`)
    .or(`status.neq.pending,created_at.gte.${since}`);

  if (userId) query = query.eq("user_id", userId);

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** The discount a coupon gives on `subtotalPaise`, before any usage checks. */
export function discountFor(coupon: CouponRow, subtotalPaise: number): number {
  let discount =
    coupon.kind === "percent" ? Math.floor((subtotalPaise * coupon.value) / 100) : coupon.value;

  if (coupon.max_discount_paise != null) discount = Math.min(discount, coupon.max_discount_paise);
  return Math.max(0, Math.min(discount, subtotalPaise - MIN_TOTAL_PAISE));
}

export async function applyCoupon({
  code: raw,
  subtotalPaise,
  userId,
}: {
  code: string;
  subtotalPaise: number;
  userId: string;
}): Promise<CouponResult> {
  const code = normaliseCode(raw);
  if (!code) return { ok: false, error: "Enter a coupon code." };

  const invalid = { ok: false as const, error: "That coupon code is not valid." };
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return invalid;

  const { data: coupon, error } = await getSupabaseAdmin()
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("[coupon] lookup failed:", error.message);
    return { ok: false, error: "We could not check that coupon just now. Please try again." };
  }
  if (!coupon || !coupon.active) return invalid;

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return invalid;
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= now) {
    return { ok: false, error: "That coupon has expired." };
  }

  if (subtotalPaise < coupon.min_order_paise) {
    return {
      ok: false,
      error: `This coupon needs an order of at least ${formatPaise(coupon.min_order_paise)}.`,
    };
  }

  try {
    if (coupon.usage_limit != null && (await countUses(code)) >= coupon.usage_limit) {
      return { ok: false, error: "That coupon has been fully used." };
    }
    if (coupon.per_user_limit != null && (await countUses(code, userId)) >= coupon.per_user_limit) {
      return { ok: false, error: "You have already used this coupon." };
    }
  } catch (err) {
    console.error("[coupon] usage count failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "We could not check that coupon just now. Please try again." };
  }

  const discountPaise = discountFor(coupon, subtotalPaise);
  if (discountPaise <= 0) return { ok: false, error: "This coupon does not apply to your cart." };

  return { ok: true, code, discountPaise };
}
