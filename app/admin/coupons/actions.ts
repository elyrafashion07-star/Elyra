"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toPaise } from "@/lib/format";
import { normaliseCode } from "@/lib/orders/coupons";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

export type CouponField =
  | "code"
  | "value"
  | "max_discount"
  | "min_order"
  | "starts_at"
  | "expires_at"
  | "usage_limit"
  | "per_user_limit";

export type CouponFormState = {
  error?: string;
  fieldErrors?: Partial<Record<CouponField, string>>;
  values?: Record<string, string>;
};

/** Blank → null; anything else must be a positive whole number. */
function optionalCount(raw: string): number | null | "bad" {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : "bad";
}

/** Blank → null; rupees → paise, which must be above zero. */
function optionalRupees(raw: string): number | null | "bad" {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? toPaise(n) : "bad";
}

/**
 * The form's datetime-local inputs carry no zone. The admin is in India, so
 * they are read as IST rather than as whatever zone the server runs in.
 */
function istToIso(raw: string): string | null | "bad" {
  if (!raw) return null;
  const date = new Date(`${raw}:00+05:30`);
  return Number.isNaN(date.getTime()) ? "bad" : date.toISOString();
}

/**
 * Creates or updates a coupon. The code is the key, so an existing coupon keeps
 * its code — past orders refer to it by that text.
 */
export async function saveCoupon(_prev: CouponFormState, form: FormData): Promise<CouponFormState> {
  if (!(await isAdmin())) return { error: "You do not have permission to do that." };

  const get = (key: string) => String(form.get(key) ?? "").trim();

  const original = normaliseCode(get("original_code"));
  const code = original || normaliseCode(get("code"));
  const description = get("description");
  const kind = get("kind") === "flat" ? "flat" : "percent";
  const valueRaw = get("value");
  const maxRaw = get("max_discount");
  const minRaw = get("min_order");
  const startsRaw = get("starts_at");
  const expiresRaw = get("expires_at");
  const usageRaw = get("usage_limit");
  const perUserRaw = get("per_user_limit");
  const active = form.get("active") === "on";

  const values = {
    code,
    description,
    kind,
    value: valueRaw,
    max_discount: maxRaw,
    min_order: minRaw,
    starts_at: startsRaw,
    expires_at: expiresRaw,
    usage_limit: usageRaw,
    per_user_limit: perUserRaw,
  };
  const fieldErrors: Partial<Record<CouponField, string>> = {};

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    fieldErrors.code = "3–30 characters: letters, numbers, - or _ only.";
  }

  const valueNum = Number(valueRaw);
  let value = 0;
  if (kind === "percent") {
    if (!Number.isInteger(valueNum) || valueNum < 1 || valueNum > 100) {
      fieldErrors.value = "Enter a whole percentage from 1 to 100.";
    } else value = valueNum;
  } else if (!Number.isFinite(valueNum) || valueNum <= 0) {
    fieldErrors.value = "Enter the amount off in rupees.";
  } else value = toPaise(valueNum);

  const maxDiscount = kind === "percent" ? optionalRupees(maxRaw) : null;
  if (maxDiscount === "bad") fieldErrors.max_discount = "Leave blank, or enter an amount above 0.";

  const minNum = minRaw ? Number(minRaw) : 0;
  if (!Number.isFinite(minNum) || minNum < 0) fieldErrors.min_order = "Enter 0 or more.";

  const startsAt = istToIso(startsRaw);
  const expiresAt = istToIso(expiresRaw);
  if (startsAt === "bad") fieldErrors.starts_at = "Pick a valid date and time.";
  if (expiresAt === "bad") fieldErrors.expires_at = "Pick a valid date and time.";
  if (startsAt && expiresAt && startsAt !== "bad" && expiresAt !== "bad" && expiresAt <= startsAt) {
    fieldErrors.expires_at = "The end must be after the start.";
  }

  const usageLimit = optionalCount(usageRaw);
  const perUserLimit = optionalCount(perUserRaw);
  if (usageLimit === "bad") fieldErrors.usage_limit = "Leave blank, or enter a whole number above 0.";
  if (perUserLimit === "bad") fieldErrors.per_user_limit = "Leave blank, or enter a whole number above 0.";

  if (Object.keys(fieldErrors).length) {
    return { error: "Could not save. Please fix the fields marked below.", fieldErrors, values };
  }

  const fields = {
    description,
    kind: kind as "percent" | "flat",
    value,
    max_discount_paise: maxDiscount as number | null,
    min_order_paise: toPaise(minNum),
    starts_at: startsAt as string | null,
    expires_at: expiresAt as string | null,
    usage_limit: usageLimit as number | null,
    per_user_limit: perUserLimit as number | null,
    active,
  };

  const db = getSupabaseAdmin();

  if (!original) {
    const { data: taken } = await db.from("coupons").select("code").eq("code", code).maybeSingle();
    if (taken) {
      return { error: "Could not save.", fieldErrors: { code: "A coupon with this code already exists." }, values };
    }
  }

  const { error } = original
    ? await db.from("coupons").update(fields).eq("code", original)
    : await db.from("coupons").insert({ code, ...fields });

  if (error) {
    console.error("[admin] coupon save failed:", error.message);
    return { error: `Could not save: ${error.message}`, values };
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

/** Past orders keep the code as text, so deleting never changes them. */
export async function deleteCoupon(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const code = normaliseCode(String(form.get("code") ?? ""));
  if (!code) return;

  const { error } = await getSupabaseAdmin().from("coupons").delete().eq("code", code);
  if (error) console.error("[admin] coupon delete failed:", error.message);

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

/** The quick on/off switch on the list page. */
export async function toggleCoupon(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const code = normaliseCode(String(form.get("code") ?? ""));
  const active = form.get("active") === "true";
  if (!code) return;

  const { error } = await getSupabaseAdmin().from("coupons").update({ active }).eq("code", code);
  if (error) console.error("[admin] coupon toggle failed:", error.message);

  revalidatePath("/admin/coupons");
}
