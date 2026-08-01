import { createClient } from "@supabase/supabase-js";
import { noRealtime } from "@/lib/supabase/no-realtime";
import type { Database } from "@/lib/supabase/types";

/**
 * Read-only Supabase client, safe for the browser and for server components.
 *
 * Uses the anon key, so it can only do what the "public read" RLS policies in
 * supabase/migrations/0001_init.sql allow. Never put the service-role key here.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabase() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
    realtime: noRealtime,
  });
}
