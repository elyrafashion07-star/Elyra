import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import CouponForm from "@/components/admin/CouponForm";
import DeleteCouponButton from "@/components/admin/DeleteCouponButton";
import { countUses } from "@/lib/orders/coupons";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit Coupon · Admin",
  robots: { index: false, follow: false },
};

export default async function EditCouponPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: coupon } = await getSupabaseAdmin()
    .from("coupons")
    .select("*")
    .eq("code", decodeURIComponent(code).toUpperCase())
    .maybeSingle();
  if (!coupon) notFound();

  const used = await countUses(coupon.code).catch(() => null);

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/coupons" className="text-[12px] text-muted underline underline-offset-4">
        ← Coupons
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">{coupon.code}</h1>
          {used != null ? (
            <p className="mt-2 text-[12px] text-muted">
              Used {used} time{used === 1 ? "" : "s"}
              {coupon.usage_limit ? ` of ${coupon.usage_limit}` : ""}
            </p>
          ) : null}
        </div>
        <DeleteCouponButton code={coupon.code} />
      </div>

      <CouponForm coupon={coupon} />
    </Container>
  );
}
