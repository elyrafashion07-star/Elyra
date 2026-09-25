import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import BannerForm from "@/components/admin/BannerForm";

export const metadata: Metadata = {
  title: "New Banner · Admin",
  robots: { index: false, follow: false },
};

export default function NewBannerPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/banners" className="text-[12px] text-muted underline underline-offset-4">
        ← Banners
      </Link>
      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">New Banner</h1>

      <BannerForm />
    </Container>
  );
}
