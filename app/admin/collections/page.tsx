import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";
import { loadCollections } from "@/lib/collections";
import { GROUPS } from "@/lib/collectionGroups";

export const metadata: Metadata = {
  title: "Collections · Admin",
  robots: { index: false, follow: false },
};

/**
 * Everything the homepage groups by, in one list.
 *
 * Grouped the way the homepage is, rather than alphabetically, so "what will
 * Shop by Occasion look like" is answerable by reading down one block.
 */
export default async function AdminCollectionsPage() {
  const all = await loadCollections();

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Collections</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Categories, occasions, budgets and gifting tiles. A category also becomes a tick-box
            when you add a product.
          </p>
        </div>

        <Link
          href="/admin/collections/new"
          className="flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          <Plus className="h-3.5 w-3.5" /> New Collection
        </Link>
      </div>

      {GROUPS.map((group) => {
        const rows = all.filter((c) => c.group === group.value);

        return (
          <section key={group.value} className="mt-10">
            <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">
              {group.label}
              <span className="ml-2 font-sans text-[11px] font-normal tracking-normal normal-case text-muted">
                {group.where}
              </span>
            </h2>

            {rows.length ? (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {rows.map((c) => (
                  <li key={c.handle}>
                    <Link
                      href={`/admin/collections/${c.handle}`}
                      className="group flex items-center gap-4 py-3 transition-colors hover:bg-sand"
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
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 border-y border-line py-6 text-[13px] text-muted">
                Nothing here yet.
              </p>
            )}
          </section>
        );
      })}
    </Container>
  );
}
