import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import CouponForm from "@/components/admin/CouponForm";

export const metadata: Metadata = {
  title: "New Coupon · Admin",
  robots: { index: false, follow: false },
};

export default function NewCouponPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/coupons" className="text-[12px] text-muted underline underline-offset-4">
        ← Coupons
      </Link>
      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">New Coupon</h1>

      <CouponForm />
    </Container>
  );
}
