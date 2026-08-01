"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string };

/**
 * Absolute origin for links that come back from an email.
 *
 * Prefer NEXT_PUBLIC_SITE_URL — behind Netlify's proxy the request host is not
 * always the public one, and a wrong origin here means a confirmation link that
 * points at the wrong site.
 */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Only allow same-origin paths as a post-login redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase says "Invalid login credentials" for both wrong password and
    // unknown email — on purpose, so it cannot be used to enumerate accounts.
    if (error.message === "Email not confirmed") {
      return { error: "Please confirm your email first — check your inbox for the link." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Picked up by the handle_new_user() trigger and written into profiles.
      data: { full_name: fullName, phone },
      // Without this the confirmation link falls back to Supabase's Site URL,
      // which drops people on the homepage with an unused ?code= and no session.
      // This exact URL must also be listed under Authentication → URL
      // Configuration → Redirect URLs, or Supabase refuses to redirect to it.
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  // With "Confirm email" on (Supabase default) there is no session yet.
  if (!data.session) {
    return { notice: `Almost there — we sent a confirmation link to ${email}. Click it to finish signing up.` };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
