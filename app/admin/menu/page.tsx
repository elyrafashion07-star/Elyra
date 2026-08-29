import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import MenuEditor from "@/components/admin/MenuEditor";
import { loadCollections } from "@/lib/collections";
import { GROUPS } from "@/lib/collectionGroups";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { infoPages, policyPages } from "@/data/pages";

export const metadata: Metadata = {
  title: "Menu · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMenuPage() {
  // Read with the service-role client rather than lib/nav: this needs the ids
  // and the flat shape, and it must not fall back to the file when the table is
  // empty — an empty table here means "you have not added anything yet".
  const [collections, { data }] = await Promise.all([
    loadCollections(),
    getSupabaseAdmin()
      .from("nav_items")
      .select("id, label, href, parent_id, sort_order")
      .order("sort_order"),
  ]);

  const rows = data ?? [];

  // Every address the store actually answers on, so a menu link is picked
  // rather than typed — a typo here is a dead link in the header of every page.
  const linkGroups = [
    {
      label: "Shop",
      options: [
        { label: "Home", href: "/" },
        { label: "All collections", href: "/collections" },
      ],
    },
    ...GROUPS.map((g) => ({
      label: g.label,
      options: collections
        .filter((c) => c.group === g.value)
        .map((c) => ({ label: c.title, href: `/collections/${c.handle}` })),
    })).filter((g) => g.options.length),
    {
      label: "Pages",
      options: infoPages.map((p) => ({ label: p.title, href: `/pages/${p.slug}` })),
    },
    {
      label: "Policies",
      options: policyPages.map((p) => ({ label: p.title, href: `/policies/${p.slug}` })),
    },
  ];

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Menu</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        The links across the top of the store, in order. An entry can hold a drop-down — add lines
        under it and they appear on hover.
      </p>

      <MenuEditor
        linkGroups={linkGroups}
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
