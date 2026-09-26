/**
 * The header menu, read from Supabase.
 *
 * One flat table of rows that point at their parent (see 0007), assembled here
 * into the two-level shape the header and mobile drawer render. data/navigation
 * keeps the footer lists, which are fixed links to pages rather than shop
 * navigation, and is the seed for this table.
 */
import "server-only";
import { cache } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { mainNav } from "@/data/navigation";
import { loadCollections } from "@/lib/collections";
import type { NavItem } from "@/lib/types";

/** Where a top-level entry points when its own collection does not exist. */
const FALLBACK_HREF = "/collections";

/**
 * Removes menu links to collections that do not exist, which would otherwise
 * be a 404 — a menu row typed in the admin panel is never checked against the
 * collections table, and a collection can be deleted after its menu row was
 * made. A dead child is dropped; a dead parent keeps its dropdown but links to
 * the collections index, and is dropped only if nothing under it survives.
 *
 * Once the missing collection is created, the link comes back by itself.
 */
async function withoutDeadLinks(items: NavItem[]): Promise<NavItem[]> {
  const collections = await loadCollections();
  // Empty means the load failed, not that the shop has no collections — keep
  // the menu as it is rather than wiping it.
  if (!collections.length) return items;

  const handles = new Set(collections.map((c) => c.handle));
  const alive = (href: string) => {
    const match = href.match(/^\/collections\/([^/?#]+)/);
    if (!match) return true;
    try {
      return handles.has(decodeURIComponent(match[1]));
    } catch {
      return false; // a malformed %-escape cannot be a real handle
    }
  };

  return items.flatMap((item) => {
    const children = item.children?.filter((child) => alive(child.href));
    const ownLink = alive(item.href);

    if (!ownLink && !children?.length) return [];

    const href = ownLink ? item.href : FALLBACK_HREF;
    return children?.length ? [{ label: item.label, href, children }] : [{ label: item.label, href }];
  });
}

export const loadNav = cache(async (): Promise<NavItem[]> => withoutDeadLinks(await loadRawNav()));

async function loadRawNav(): Promise<NavItem[]> {
  if (!isSupabaseConfigured) return mainNav;

  const { data, error } = await getSupabase()
    .from("nav_items")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("[nav] load failed:", error.message);
    return mainNav;
  }

  const rows = data ?? [];
  // An empty table means the migration has not been run yet; the header should
  // not silently become blank because of it.
  if (!rows.length) return mainNav;

  const children = new Map<string, NavItem[]>();
  for (const row of rows) {
    if (!row.parent_id) continue;
    const list = children.get(row.parent_id);
    const item = { label: row.label, href: row.href };
    if (list) list.push(item);
    else children.set(row.parent_id, [item]);
  }

  return rows
    .filter((row) => !row.parent_id)
    .map((row) => {
      const kids = children.get(row.id);
      return kids?.length
        ? { label: row.label, href: row.href, children: kids }
        : { label: row.label, href: row.href };
    });
}
