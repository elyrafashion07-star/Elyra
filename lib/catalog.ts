/**
 * The product catalogue, read from Supabase.
 *
 * This replaces data/products.ts, which was a static file compiled into the
 * build — nothing added from the admin panel could ever appear on the site while
 * the storefront read from there.
 *
 * The whole catalogue is loaded in one go and every helper then works in memory,
 * exactly as the static version did. That is deliberate: it is a few dozen rows,
 * the filtering rules (budget buckets, gift roll-ups) are awkward to express in
 * SQL, and keeping the logic identical means the storefront behaves the same
 * after the move as before it.
 */
import "server-only";
import { cache } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { TRENDING_LIMIT } from "@/lib/trending";
import type { Product } from "@/lib/types";

/**
 * Loaded once per request. `cache` is what stops a page that calls
 * getProduct(), relatedProducts() and productsInCollection() from making three
 * round trips for the same rows.
 */
export const loadCatalog = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    console.error("[catalog] Supabase is not configured — the storefront has no products.");
    return [];
  }

  const db = getSupabase();

  const [{ data: rows, error }, { data: links }] = await Promise.all([
    db.from("products").select("*").order("sort_order"),
    db.from("product_collections").select("product_handle, collection_handle"),
  ]);

  if (error) {
    console.error("[catalog] product load failed:", error.message);
    return [];
  }

  // One pass to group the join rows, so the map below stays O(n).
  const collectionsByHandle = new Map<string, string[]>();
  for (const link of links ?? []) {
    const list = collectionsByHandle.get(link.product_handle);
    if (list) list.push(link.collection_handle);
    else collectionsByHandle.set(link.product_handle, [link.collection_handle]);
  }

  return (rows ?? []).map((row) => ({
    handle: row.handle,
    title: row.title,
    // numeric(10,2) arrives as a string from PostgREST when it is large enough;
    // Number() keeps every downstream price calculation in one type.
    price: Number(row.price),
    compareAt: row.compare_at == null ? undefined : Number(row.compare_at),
    rating: Number(row.rating),
    reviews: row.reviews,
    category: row.category ?? "",
    collections: collectionsByHandle.get(row.handle) ?? [],
    description: row.description,
    material: row.material ?? "",
    weight: row.weight ?? "",
    variants:
      row.variant_label && row.variant_options?.length
        ? { label: row.variant_label, options: row.variant_options }
        : undefined,
    badge: row.badge ?? undefined,
    soldOut: row.sold_out,
    trending: row.trending,
    images: row.images ?? [],
    gallery: row.gallery,
  }));
});

export async function getProduct(handle: string): Promise<Product | undefined> {
  return (await loadCatalog()).find((p) => p.handle === handle);
}

export async function getProductsByHandles(handles: string[]): Promise<Product[]> {
  const wanted = new Set(handles);
  return (await loadCatalog()).filter((p) => wanted.has(p.handle));
}

const BUDGET_BUCKETS: Record<string, number> = {
  "under-1599": 1599,
  "under-2599": 2599,
  "under-3599": 3599,
  "under-4599": 4599,
  "under-5599": 5599,
  "under-6599": 6599,
};

/**
 * Everything a product belongs to: explicit tags + its category + budget
 * buckets. Unchanged from the static implementation — the gift roll-ups mean a
 * product tagged "gift-for-sister" also turns up under "gift-for-her" and
 * "gifts" without anyone having to tag it three times.
 */
export function productCollections(p: Product): string[] {
  const set = new Set<string>([...p.collections, p.category, "all"]);
  for (const [handle, max] of Object.entries(BUDGET_BUCKETS)) {
    if (p.price <= max) set.add(handle);
  }
  if (set.has("gift-for-wife") || set.has("gift-for-mother") || set.has("gift-for-sister")) {
    set.add("gift-for-her");
  }
  if (set.has("gift-for-husband") || set.has("gift-for-father") || set.has("gift-for-brother")) {
    set.add("gift-for-him");
  }
  if (set.has("gift-for-her") || set.has("gift-for-him")) set.add("gifts");
  return [...set];
}

export async function productsInCollection(handle: string): Promise<Product[]> {
  const products = await loadCatalog();
  if (handle === "all") return products;
  return products.filter((p) => productCollections(p).includes(handle));
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return (await loadCatalog()).filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.collections.some((c) => c.includes(q)),
  );
}

/** Ordered as listed, not as the database returns them. */
async function pick(handles: string[]): Promise<Product[]> {
  const byHandle = new Map((await loadCatalog()).map((p) => [p.handle, p]));
  return handles.flatMap((h) => {
    const found = byHandle.get(h);
    return found ? [found] : [];
  });
}

/**
 * Homepage row — "Top 5 Trending Products".
 *
 * Was a hand-written list of handles here; it is now a tick-box on the product
 * itself, so the row is edited in the admin panel like everything else. Order
 * follows each product's sort order.
 */
export async function trendingProducts(): Promise<Product[]> {
  const products = await loadCatalog();
  const picked = products.filter((p) => p.trending).slice(0, TRENDING_LIMIT);
  // Nothing ticked yet — show something rather than an empty homepage row.
  return picked.length ? picked : products.slice(0, TRENDING_LIMIT);
}

const COMPLETE_YOUR_LOOK = [
  "eternal-bloom-rakhi",
  "infinity-bhai-rakhi",
  "flora-whisper-ring",
  "lovers-loop-bracelet",
];

/** Cart drawer upsell row. */
export async function completeYourLook(): Promise<Product[]> {
  const picked = await pick(COMPLETE_YOUR_LOOK);
  return picked.length ? picked : (await loadCatalog()).slice(0, COMPLETE_YOUR_LOOK.length);
}

export async function relatedProducts(p: Product, limit = 5): Promise<Product[]> {
  const products = await loadCatalog();
  return products
    .filter((x) => x.handle !== p.handle && x.category === p.category)
    .concat(products.filter((x) => x.handle !== p.handle && x.category !== p.category))
    .slice(0, limit);
}
