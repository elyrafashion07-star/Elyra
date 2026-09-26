import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import DeleteCouponButton from "@/components/admin/DeleteCouponButton";
import { toggleCoupon } from "@/app/admin/coupons/actions";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CouponRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Coupons · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function offLabel(c: CouponRow): string {
  if (c.kind === "flat") return `${formatPaise(c.value)} off`;
  return `${c.value}% off${c.max_discount_paise ? ` (up to ${formatPaise(c.max_discount_paise)})` : ""}`;
}

function statusOf(c: CouponRow, used: number): { label: string; tone: string } {
  const now = Date.now();
  if (!c.active) return { label: "Off", tone: "bg-sand text-muted" };
  if (c.expires_at && new Date(c.expires_at).getTime() <= now) return { label: "Expired", tone: "bg-sand text-muted" };
  if (c.usage_limit != null && used >= c.usage_limit) return { label: "Used up", tone: "bg-sand text-muted" };
  if (c.starts_at && new Date(c.starts_at).getTime() > now) {
    return { label: "Scheduled", tone: "bg-amber-50 text-amber-800" };
  }
  return { label: "Live", tone: "bg-emerald-50 text-emerald-800" };
}

const date = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

/**
 * Every coupon, newest first, with how often it has been used. Failed,
 * cancelled, refunded and unpaid orders do not count as a use.
 */
export default async function AdminCouponsPage() {
  const db = getSupabaseAdmin();

  const [{ data: coupons }, { data: usedRows }] = await Promise.all([
    db.from("coupons").select("*").order("created_at", { ascending: false }),
    db
      .from("orders")
      .select("coupon_code")
      .not("coupon_code", "is", null)
      .not("status", "in", "(failed,cancelled,refunded,pending)"),
  ]);

  const uses = new Map<string, number>();
  for (const row of usedRows ?? []) {
    if (row.coupon_code) uses.set(row.coupon_code, (uses.get(row.coupon_code) ?? 0) + 1);
  }

  const list = coupons ?? [];

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Coupons</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">Discount codes customers can enter at checkout.</p>
        </div>

        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          <Plus className="h-3.5 w-3.5" /> Add Coupon
        </Link>
      </div>

      {list.length ? (
        <ul className="mt-8 divide-y divide-line border-y border-line bg-white">
          {list.map((c) => {
            const used = uses.get(c.code) ?? 0;
            const status = statusOf(c, used);
            const href = `/admin/coupons/${encodeURIComponent(c.code)}`;

            return (
              <li key={c.code} className="flex flex-wrap items-center gap-4 px-3 py-4 sm:flex-nowrap">
                <Link href={href} className="group min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold tracking-[0.08em] transition-colors group-hover:text-gold">
                      {c.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </p>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    {offLabel(c)}
                    {c.min_order_paise > 0 ? ` · min order ${formatPaise(c.min_order_paise)}` : ""}
                    {c.per_user_limit ? ` · ${c.per_user_limit}× per customer` : ""}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    Used {used}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                    {c.expires_at ? ` · ends ${date(c.expires_at)}` : ""}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </Link>

                <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                  <form action={toggleCoupon}>
                    <input type="hidden" name="code" value={c.code} />
                    <input type="hidden" name="active" value={c.active ? "false" : "true"} />
                    <button
                      type="submit"
                      className="border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
                    >
                      {c.active ? "Turn off" : "Turn on"}
                    </button>
                  </form>
                  <Link
                    href={href}
                    className="flex items-center gap-2 border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <DeleteCouponButton code={c.code} compact />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 border-y border-line py-6 text-[13px] text-muted">
          No coupons yet.{" "}
          <Link href="/admin/coupons/new" className="underline underline-offset-4 hover:text-gold">
            Create the first one
          </Link>
        </p>
      )}
    </Container>
  );
}
