import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";
import DeleteCollectionButton from "@/components/admin/DeleteCollectionButton";
import { loadCollections } from "@/lib/collections";
import { GROUPS } from "@/lib/collectionGroups";

export const metadata: Metadata = {
  title: "Categories & Collections · Admin",
  robots: { index: false, follow: false },
};

/**
 * Everything the homepage groups by, in one list.
 *
 * Grouped the way the homepage is, rather than alphabetically, so "what will
 * Shop by Occasion look like" is answerable by reading down one block. Each
 * block has its own Add button, and every row its own Edit / Delete, so nothing
 * hides behind clicking into a row.
 */
export default async function AdminCollectionsPage() {
  const all = await loadCollections();

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">
            Categories &amp; Collections
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Categories, occasions, budgets and gifting tiles. A category also becomes a tick-box
            when you add a product.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/collections/new?group=category"
            className="flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Link>
          <Link
            href="/admin/collections/new?group=collection"
            className="flex items-center gap-2 border border-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:border-gold hover:text-gold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Collection
          </Link>
        </div>
      </div>

      {/* Jump links, so Gifting or Feature is one tap away rather than a long scroll. */}
      <nav className="mt-8 flex flex-wrap gap-2">
        {GROUPS.map((group) => (
          <a
            key={group.value}
            href={`#${group.value}`}
            className="border border-line bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-soft transition-colors hover:border-gold hover:text-gold"
          >
            {group.label}
            <span className="ml-1.5 text-muted">
              {all.filter((c) => c.group === group.value).length}
            </span>
          </a>
        ))}
      </nav>

      {GROUPS.map((group) => {
        const rows = all.filter((c) => c.group === group.value);

        return (
          <section key={group.value} id={group.value} className="mt-10 scroll-mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[13px] font-semibold tracking-[0.16em] uppercase">
                {group.label}
                <span className="ml-2 font-sans text-[11px] font-normal tracking-normal normal-case text-muted">
                  {group.where}
                </span>
              </h2>

              <Link
                href={`/admin/collections/new?group=${group.value}`}
                className="flex items-center gap-1.5 border border-line bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors hover:border-gold hover:text-gold"
              >
                <Plus className="h-3.5 w-3.5" /> Add {group.label}
              </Link>
            </div>

            {rows.length ? (
              <ul className="mt-3 divide-y divide-line border-y border-line bg-white">
                {rows.map((c) => (
                  <li key={c.handle} className="flex flex-wrap items-center gap-4 px-2 py-3 sm:flex-nowrap">
                    <Link
                      href={`/admin/collections/${c.handle}`}
                      className="group flex min-w-0 flex-1 items-center gap-4"
                    >
                      <div className="w-14 shrink-0">
                        <FixedImage slot="productThumb" src={c.image} alt="" label="" sizes="56px" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] transition-colors group-hover:text-gold">
                          {c.title}
                        </p>
                        <p className="truncate text-[12px] text-muted">
                          {c.handle}
                          {c.showOnHome ? "" : " · hidden from homepage"}
                        </p>
                      </div>
                    </Link>

                    <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                      <Link
                        href={`/collections/${c.handle}`}
                        target="_blank"
                        aria-label={`View ${c.title} on store`}
                        className="flex items-center border border-line px-3 py-2 text-muted transition-colors hover:border-gold hover:text-gold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/admin/collections/${c.handle}`}
                        className="flex items-center gap-2 border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <DeleteCollectionButton handle={c.handle} title={c.title} compact />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-y border-line py-6 text-[13px] text-muted">
                Nothing here yet.{" "}
                <Link
                  href={`/admin/collections/new?group=${group.value}`}
                  className="underline underline-offset-4 hover:text-gold"
                >
                  Add the first {group.label.toLowerCase()}
                </Link>
              </p>
            )}
          </section>
        );
      })}
    </Container>
  );
}
