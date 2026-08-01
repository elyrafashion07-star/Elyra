/**
 * Connection check: are the credentials valid, is the schema there, is it seeded?
 *
 *   npm run db:check
 *
 * Prints a per-table verdict. Nothing is written.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { noRealtime } from "../lib/supabase/no-realtime";

loadEnv({ path: ".env.local", override: true, quiet: true });

const TABLES = ["collections", "products", "product_collections", "hero_slides", "info_pages"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function mask(v?: string) {
  return v ? `${v.slice(0, 10)}…(${v.length} chars)` : "MISSING";
}

console.log("Environment");
console.log(`  NEXT_PUBLIC_SUPABASE_URL       ${url ?? "MISSING"}`);
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY  ${mask(anonKey)}`);
console.log(`  SUPABASE_SERVICE_ROLE_KEY      ${mask(serviceKey)}`);

if (!url) {
  console.error("\n✗ No project URL — cannot connect.");
  process.exit(1);
}

async function probe(label: string, key?: string) {
  console.log(`\n${label}`);
  if (!key) {
    console.log("  – key missing, skipped");
    return;
  }

  const db = createClient(url!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: noRealtime,
  });

  for (const table of TABLES) {
    const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
    if (error) {
      const missing = /does not exist|schema cache/i.test(error.message);
      console.log(`  ${table.padEnd(20)} ${missing ? "table not created" : `error: ${error.message}`}`);
    } else {
      console.log(`  ${table.padEnd(20)} ok — ${count ?? 0} rows`);
    }
  }
}

async function main() {
  await probe("Anon key (what the website will use)", anonKey);
  await probe("Service-role key (what the seed script uses)", serviceKey);
}

main().catch((err) => {
  console.error("\n✗ Connection failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
