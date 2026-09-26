import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Container from "@/components/ui/Container";
import MenuEditor from "@/components/admin/MenuEditor";
import { loadCollections } from "@/lib/collections";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Menu · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMenuPage() {
  // Read with the service-role client rather than lib/nav: this needs the ids
  // and the flat shape, and it must not fall back to the file when the table is
  // empty — an empty table here means "you have not added anything yet".
  const { data } = await getSupabaseAdmin()
    .from("nav_items")
    .select("id, label, href, parent_id, sort_order")
    .order("sort_order");

  const rows = data ?? [];

  // Links to a collection that does not exist are hidden from the store menu
  // (see lib/nav.ts) — list them here so it is clear why an entry is missing.
  const collections = await loadCollections();
  const handles = new Set(collections.map((c) => c.handle));
  const dead = collections.length
    ? rows.filter((r) => {
        const match = r.href.match(/^\/collections\/([^/?#]+)/);
        return match && !handles.has(match[1]);
      })
    : [];

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Menu</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        The links across the top of the store, in order. An entry can hold a drop-down — add lines
        under it and they appear on hover.
      </p>

      {dead.length ? (
        <div role="alert" className="mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {dead.length} link{dead.length === 1 ? "" : "s"} point to a collection that does not exist, so{" "}
            {dead.length === 1 ? "it is" : "they are"} hidden from the store menu:
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-10">
            {dead.map((r) => (
              <li key={r.id}>
                {r.label} → <code>{r.href}</code>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Fix the link below, or{" "}
            <Link href="/admin/collections/new?group=collection" className="underline underline-offset-4">
              create the collection
            </Link>{" "}
            with that name — the entry comes back by itself.
          </p>
        </div>
      ) : null}

      <MenuEditor
        items={rows.map((r) => ({
          id: r.id,
          label: r.label,
          href: r.href,
          parentId: r.parent_id,
          sortOrder: r.sort_order,
        }))}
      />
    </Container>
  );
}
