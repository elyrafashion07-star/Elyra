/**
 * Collections, read from Supabase.
 *
 * This replaces data/collections.ts for everything the site renders. That file
 * was compiled into the build, so a category added in the admin panel could
 * never appear — the same problem lib/catalog.ts already solved for products.
 * It survives only as the seed for scripts/seed-supabase.ts.
 *
 * Loaded once per request and filtered in memory: it is a few dozen rows, and
 * every page wants a different slice of the same set.
 */
import "server-only";
import { cache } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Collection } from "@/lib/types";

export const loadCollections = cache(async (): Promise<Collection[]> => {
  if (!isSupabaseConfigured) {
    console.error("[collections] Supabase is not configured — the storefront has no collections.");
    return [];
  }

  const { data, error } = await getSupabase()
    .from("collections")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("[collections] load failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    handle: row.handle,
    title: row.title,
    description: row.description,
    group: row.group,
    image: row.image ?? undefined,
    // `?? true` keeps the homepage populated on a database where 0007 has not
    // been run yet — the column is simply absent from the row.
    showOnHome: row.show_on_home ?? true,
    sortOrder: row.sort_order,
  }));
});

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return (await loadCollections()).find((c) => c.handle === handle);
}

export async function collectionsByGroup(group: Collection["group"]): Promise<Collection[]> {
  return (await loadCollections()).filter((c) => c.group === group);
}

/**
 * What a homepage section renders: its group, in sort order, minus anything
 * switched off in the admin panel.
 */
export async function homeCollections(group: Collection["group"]): Promise<Collection[]> {
  return (await collectionsByGroup(group)).filter((c) => c.showOnHome);
}
