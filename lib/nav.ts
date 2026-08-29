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
import type { NavItem } from "@/lib/types";

export const loadNav = cache(async (): Promise<NavItem[]> => {
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
});
