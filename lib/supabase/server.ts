import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Auth-aware client for server components, server actions and route handlers.
 *
 * `cookies()` is async in Next 15, so this is too. Server components cannot
 * write cookies — the setAll no-op there is expected; middleware.ts is what
 * actually refreshes the session cookie.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a server component — safe to ignore, middleware refreshes.
        }
      },
    },
  });
}

/** The signed-in user, or null. Never throws. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The signed-in user's profile row, or null when signed out.
 *
 * `cache` dedupes this across one render — the /admin layout and the page under
 * it both need the role, and without it that would be two round trips per view.
 *
 * The role is read from the database rather than the JWT because nothing writes
 * it into the token. RLS ("read own profile") is what scopes this to the caller,
 * so the plain anon-key client is enough; no service-role key is involved.
 */
export const getProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return data;
});

/** True only for a signed-in user whose profile row says admin. */
export async function isAdmin() {
  return (await getProfile())?.role === "admin";
}
