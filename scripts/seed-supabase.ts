/**
 * Transfers everything in /data into Supabase.
 *
 *   npm run db:seed -- --dry-run   # build the rows, print counts, touch nothing
 *   npm run db:seed                # upsert into Supabase
 *
 * Idempotent: every table is upserted on its primary key, so re-running syncs
 * changes rather than duplicating. Reads credentials from .env.local.
 *
 * Products are NOT seeded from here any more. They live in Supabase and are
 * edited in the admin panel, so there is no file to copy them from — and
 * re-running this used to overwrite whatever the admin panel had changed.
 * data/products.ts was deleted for the same reason.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { noRealtime } from "../lib/supabase/no-realtime";
import { collections } from "../data/collections";
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
  // Phone + tablet show the banner uncropped now, so there is no crop to anchor.
  mobile_focus: null,
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
  hero_slides: { rows: heroRows.length },
  info_pages: { rows: pageRows.length },
});

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

  await upsert("collections", collectionRows, "handle");
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
