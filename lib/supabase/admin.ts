import { createClient } from "@supabase/supabase-js";
import { noRealtime } from "@/lib/supabase/no-realtime";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client — full read/write, bypasses RLS.
 *
 * Server-side only (scripts, route handlers, server actions). Importing this
 * from a client component would leak the key into the browser bundle, so the
 * key is read from a non-`NEXT_PUBLIC_` variable on purpose.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin credentials — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: noRealtime,
  });
}
