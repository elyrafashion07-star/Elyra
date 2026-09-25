import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import BannerForm from "@/components/admin/BannerForm";
import DeleteBannerButton from "@/components/admin/DeleteBannerButton";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Edit Banner · Admin",
  robots: { index: false, follow: false },
};

export default async function EditBannerPage({ params }: { params: Promise<{ position: string }> }) {
  const position = Number((await params).position);
  if (!Number.isInteger(position)) notFound();

  // The raw row, not the storefront shape: the form needs to know whether a
  // phone image was actually set or is just falling back to the banner image.
  const { data: banner } = await getSupabaseAdmin()
    .from("hero_slides")
    .select("*")
    .eq("position", position)
    .maybeSingle();
  if (!banner) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/banners" className="text-[12px] text-muted underline underline-offset-4">
        ← Banners
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Edit Banner</h1>
        <DeleteBannerButton position={banner.position} title={banner.title} />
      </div>

      <BannerForm banner={banner} />
    </Container>
  );
}
