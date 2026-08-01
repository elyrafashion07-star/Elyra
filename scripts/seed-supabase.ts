/**
 * Transfers everything in /data into Supabase.
 *
 *   npm run db:seed -- --dry-run   # build the rows, print counts, touch nothing
 *   npm run db:seed                # upsert into Supabase
 *
 * Idempotent: every table is upserted on its primary key, so re-running syncs
 * changes rather than duplicating. Reads credentials from .env.local.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { noRealtime } from "../lib/supabase/no-realtime";
import { collections } from "../data/collections";
import { products } from "../data/products";
import { heroSlides } from "../data/hero";
import { infoPages, policyPages } from "../data/pages";
import type { Database } from "../lib/supabase/types";

loadEnv({ path: ".env.local", override: true, quiet: true });

const dryRun = process.argv.includes("--dry-run");

// ── build rows ─────────────────────────────────────────────────────────────

const collectionRows = collections.map((c, i) => ({
  handle: c.handle,
  title: c.title,
  description: c.description,
  group: c.group,
  image: c.image ?? null,
  sort_order: i,
}));

const knownCollection = new Set(collectionRows.map((c) => c.handle));

const productRows = products.map((p, i) => ({
  handle: p.handle,
  title: p.title,
  price: p.price,
  compare_at: p.compareAt ?? null,
  rating: p.rating,
  reviews: p.reviews,
  // category is a FK — only send it if that collection actually exists.
  category: knownCollection.has(p.category) ? p.category : null,
  description: p.description,
  material: p.material,
  weight: p.weight,
  variant_label: p.variants?.label ?? null,
  variant_options: p.variants?.options ?? null,
  badge: p.badge ?? null,
  sold_out: p.soldOut ?? false,
  gallery: p.gallery,
  sort_order: i,
}));

// Join rows, skipping any collection handle that has no row of its own.
const missingLinks: string[] = [];
const productCollectionRows = products.flatMap((p) =>
  p.collections.flatMap((handle) => {
    if (!knownCollection.has(handle)) {
      missingLinks.push(`${p.handle} → ${handle}`);
      return [];
    }
    return [{ product_handle: p.handle, collection_handle: handle }];
  }),
);

const heroRows = heroSlides.map((s, i) => ({
  position: i,
  eyebrow: s.eyebrow,
  title: s.title,
  body: s.text,
  cta_label: s.cta.label,
  cta_href: s.cta.href,
  desktop_src: s.desktopSrc ?? null,
  mobile_src: s.mobileSrc ?? null,
  focus: s.focus ?? null,
  mobile_focus: s.mobileFocus ?? null,
  active: true,
}));

const pageRows = [
  ...infoPages.map((p) => ({ ...p, kind: "page" as const })),
  ...policyPages.map((p) => ({ ...p, kind: "policy" as const })),
].map((p) => ({
  slug: p.slug,
  title: p.title,
  intro: p.intro,
  sections: p.sections,
  kind: p.kind,
}));

// ── report ─────────────────────────────────────────────────────────────────

console.log("Rows built from /data:");
console.table({
  collections: { rows: collectionRows.length },
  products: { rows: productRows.length },
  product_collections: { rows: productCollectionRows.length },
  hero_slides: { rows: heroRows.length },
  info_pages: { rows: pageRows.length },
});

const orphanCategories = productRows.filter((p) => p.category === null).map((p) => p.handle);
if (orphanCategories.length) {
  console.warn(`⚠ ${orphanCategories.length} product(s) have a category with no collection row:`);
  console.warn("  " + orphanCategories.join(", "));
}
if (missingLinks.length) {
  console.warn(`⚠ ${missingLinks.length} product→collection link(s) point at unknown collections:`);
  console.warn("  " + missingLinks.join(", "));
}

if (dryRun) {
  console.log("\n--dry-run: nothing was written.");
  process.exit(0);
}

// ── write ──────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\n✗ Missing credentials. Add these to .env.local, then re-run:\n" +
      "    NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=<service role key>\n",
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: noRealtime,
});

async function upsert(table: string, rows: object[], onConflict: string) {
  if (!rows.length) return;
  // Chunked so a large catalogue never hits the request size limit.
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await db.from(table as never).upsert(chunk as never, { onConflict });
    if (error) {
      console.error(`✗ ${table}: ${error.message}`);
      if (error.details) console.error(`  ${error.details}`);
      if (error.hint) console.error(`  hint: ${error.hint}`);
      process.exit(1);
    }
  }
  console.log(`✓ ${table.padEnd(20)} ${rows.length} rows`);
}

async function main() {
  console.log(`\nWriting to ${url}\n`);

  // Order matters: products reference collections, links reference both.
  await upsert("collections", collectionRows, "handle");
  await upsert("products", productRows, "handle");
  await upsert("product_collections", productCollectionRows, "product_handle,collection_handle");
  await upsert("hero_slides", heroRows, "position");
  await upsert("info_pages", pageRows, "slug");

  const counts = await Promise.all(
    ["collections", "products", "product_collections", "hero_slides", "info_pages"].map(
      async (t) => {
        const { count } = await db.from(t as never).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      },
    ),
  );

  console.log("\nRow counts now in Supabase:");
  for (const [table, count] of counts) console.log(`  ${table.padEnd(20)} ${count}`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
