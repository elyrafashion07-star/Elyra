/**
 * Supabase env vars, read in one place with a useful error.
 *
 * supabase-js throws "Your project's URL and Key are required to create a
 * Supabase client!" when either value is undefined, which does not say *which*
 * variable is missing or where to put it. These helpers do.
 *
 * Remember: Next reads env files at server start. Adding a value to .env while
 * `next dev` is running has no effect until you restart it.
 */

function required(name: string, value: string | undefined): string {
  if (value && value.trim()) return value.trim();

  throw new Error(
    `Missing ${name}.\n` +
      `  1. Add it to .env.local (or .env) in the project root — see .env.example\n` +
      `  2. Restart the dev server; env files are only read at startup\n` +
      `  3. Values live in Supabase → Project Settings → API`,
  );
}

/** True when both public vars are present — lets callers degrade instead of throwing. */
export function isSupabaseEnvSet(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
