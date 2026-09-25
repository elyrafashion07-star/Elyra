import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import DeleteBannerButton from "@/components/admin/DeleteBannerButton";
import { importDefaultBanners, moveBanner, toggleBanner } from "@/app/admin/banners/actions";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Banners · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const iconButton =
  "flex items-center justify-center border border-line px-3 py-2 transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30";

const textButton =
  "flex items-center gap-2 border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold";

/** The homepage hero slider, in the order it plays. */
export default async function AdminBannersPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("hero_slides")
    .select("*")
    .order("position");
  const banners = data ?? [];

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Banners</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            The big sliding images at the top of the homepage. They play in this order; hidden
            ones stay here but are not shown.
          </p>
        </div>

        <Link
          href="/admin/banners/new"
          className="flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          <Plus className="h-3.5 w-3.5" /> Add Banner
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          Could not load banners: {error.message}
        </p>
      ) : null}

      {/* An empty table means the homepage is still on the built-in slides from
          data/hero.ts. Importing copies them in so they can be edited here. */}
      {!error && !banners.length ? (
        <div className="mt-8 border border-line bg-white p-8 text-center">
          <p className="text-sm text-ink-soft">
            No banners saved yet. The homepage is showing the built-in ones.
          </p>
          <form action={importDefaultBanners} className="mt-5 inline-block">
            <button
              type="submit"
              className="flex items-center gap-2 border border-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:border-gold hover:text-gold"
            >
              <Download className="h-3.5 w-3.5" /> Import current banners to edit them
            </button>
          </form>
        </div>
      ) : null}

      {banners.length ? (
        <ul className="mt-8 space-y-4">
          {banners.map((b, i) => (
            <li
              key={b.position}
              className={`flex flex-col gap-4 border border-line bg-white p-4 sm:flex-row sm:items-center ${
                b.active ? "" : "opacity-60"
              }`}
            >
              <Link
                href={`/admin/banners/${b.position}`}
                className="relative aspect-video w-full shrink-0 overflow-hidden bg-sand sm:w-56"
              >
                {b.desktop_src ? (
                  <Image src={b.desktop_src} alt="" fill sizes="224px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-muted">
                    No image
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
                  Slide {i + 1}
                  {b.active ? null : <span className="ml-2 text-red-700">· Hidden</span>}
                </p>
                {b.eyebrow ? (
                  <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-gold">{b.eyebrow}</p>
                ) : null}
                <p className="mt-0.5 truncate text-[15px]">{b.title}</p>
                {b.cta_label ? (
                  <p className="mt-1 truncate text-[12px] text-muted">
                    Button: {b.cta_label} → {b.cta_href}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <form action={moveBanner}>
                  <input type="hidden" name="position" value={b.position} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} aria-label="Move up" className={iconButton}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={moveBanner}>
                  <input type="hidden" name="position" value={b.position} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === banners.length - 1}
                    aria-label="Move down"
                    className={iconButton}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={toggleBanner}>
                  <input type="hidden" name="position" value={b.position} />
                  <input type="hidden" name="active" value={String(b.active)} />
                  <button type="submit" className={textButton}>
                    {b.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {b.active ? "Hide" : "Show"}
                  </button>
                </form>
                <Link href={`/admin/banners/${b.position}`} className={textButton}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <DeleteBannerButton position={b.position} title={b.title} compact />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Container>
  );
}
