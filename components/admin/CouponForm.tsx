"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveCoupon, type CouponFormState } from "@/app/admin/coupons/actions";
import type { CouponRow } from "@/lib/supabase/types";

/** ISO → the "YYYY-MM-DDTHH:mm" a datetime-local input wants, in IST. */
function toIstInput(iso: string | null): string {
  if (!iso) return "";
  const ist = new Date(new Date(iso).getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16);
}

const rupees = (paise: number | null | undefined) => (paise == null ? "" : String(paise / 100));

/**
 * Add or edit a coupon. Every rule is optional except the code and the amount;
 * a blank limit means "no limit".
 */
export default function CouponForm({ coupon }: { coupon?: CouponRow }) {
  const [state, formAction] = useActionState<CouponFormState, FormData>(saveCoupon, {});

  const value = (key: string, fallback: string) => state.values?.[key] ?? fallback;

  const [kind, setKind] = useState<"percent" | "flat">(
    (value("kind", coupon?.kind ?? "percent") as "percent" | "flat") || "percent",
  );

  const error = state.fieldErrors ?? {};
  const initialValue = coupon ? (coupon.kind === "percent" ? String(coupon.value) : rupees(coupon.value)) : "";

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-8">
      <input type="hidden" name="original_code" value={coupon?.code ?? ""} />

      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-5">
        <Field
          name="code"
          label="Coupon code"
          defaultValue={value("code", coupon?.code ?? "")}
          disabled={Boolean(coupon)}
          maxLength={30}
          placeholder="e.g. WELCOME10"
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.toUpperCase().replace(/\s/g, "");
          }}
          className="uppercase tracking-[0.08em]"
          error={error.code}
          hint={
            coupon
              ? "The code cannot be changed — past orders refer to it."
              : "What customers type at checkout. Letters, numbers, - and _."
          }
        />

        <Field
          name="description"
          label="Note (only you see this)"
          defaultValue={value("description", coupon?.description ?? "")}
          placeholder="e.g. Diwali Instagram offer"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <Label>Discount type</Label>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.currentTarget.value as "percent" | "flat")}
              className={inputClass()}
            >
              <option value="percent">Percentage off (%)</option>
              <option value="flat">Flat amount off (Rs.)</option>
            </select>
          </label>

          <Field
            name="value"
            label={kind === "percent" ? "Percent off" : "Amount off (Rs.)"}
            type="number"
            min={kind === "percent" ? 1 : 0}
            max={kind === "percent" ? 100 : undefined}
            step={kind === "percent" ? 1 : "0.01"}
            defaultValue={value("value", initialValue)}
            error={error.value}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="min_order"
            label="Minimum order (Rs.)"
            type="number"
            min={0}
            step="0.01"
            defaultValue={value("min_order", coupon ? rupees(coupon.min_order_paise) : "0")}
            error={error.min_order}
            hint="0 = any order."
          />

          {kind === "percent" ? (
            <Field
              name="max_discount"
              label="Maximum discount (Rs.)"
              type="number"
              min={0}
              step="0.01"
              defaultValue={value("max_discount", rupees(coupon?.max_discount_paise))}
              error={error.max_discount}
              hint="Blank = no cap. e.g. 20% off up to Rs. 500."
            />
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="starts_at"
            label="Starts (IST)"
            type="datetime-local"
            defaultValue={value("starts_at", toIstInput(coupon?.starts_at ?? null))}
            error={error.starts_at}
            hint="Blank = works right away."
          />
          <Field
            name="expires_at"
            label="Expires (IST)"
            type="datetime-local"
            defaultValue={value("expires_at", toIstInput(coupon?.expires_at ?? null))}
            error={error.expires_at}
            hint="Blank = never expires."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="usage_limit"
            label="Total uses allowed"
            type="number"
            min={1}
            step={1}
            defaultValue={value("usage_limit", coupon?.usage_limit?.toString() ?? "")}
            error={error.usage_limit}
            hint="Blank = unlimited. Across all customers."
          />
          <Field
            name="per_user_limit"
            label="Uses per customer"
            type="number"
            min={1}
            step={1}
            defaultValue={value("per_user_limit", coupon ? (coupon.per_user_limit?.toString() ?? "") : "1")}
            error={error.per_user_limit}
            hint="Blank = unlimited. 1 = once per customer."
          />
        </div>

        <label className="flex items-start gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="active"
            defaultChecked={coupon?.active ?? true}
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
          />
          <span>
            Active
            <span className="mt-0.5 block text-[11px] text-muted">
              Untick to switch the coupon off without deleting it.
            </span>
          </span>
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Submit label={coupon ? "Save changes" : "Create coupon"} />
        <Link href="/admin/coupons" className="text-[13px] text-muted underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="mt-1 block text-[12px] text-red-700">
      {message}
    </span>
  );
}

function inputClass(error?: string): string {
  return `w-full border bg-white px-4 py-3 text-sm outline-none disabled:bg-sand disabled:text-muted ${
    error ? "border-red-300 focus:border-red-400" : "border-line focus:border-gold"
  }`;
}

function Field({
  name,
  label,
  hint,
  error,
  className = "",
  ...rest
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        name={name}
        aria-invalid={Boolean(error)}
        className={`${inputClass(error)} ${className}`}
        {...rest}
      />
      <FieldError message={error} />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 bg-ink px-8 py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {pending ? "Saving…" : label}
    </button>
  );
}
