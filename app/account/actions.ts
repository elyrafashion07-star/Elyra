"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  notice?: string;
  /** Call-to-action rendered inside the error box, e.g. "Sign in instead". */
  errorLink?: { label: string; href: string };
  /**
   * What the user typed, echoed back on failure.
   *
   * React 19 resets an uncontrolled `<form action>` once the action settles, so
   * without this every field empties on a rejected submit — and because the
   * inputs are `required`, the retry is then blocked by native validation
   * before it ever reaches the server. AuthForm feeds these into `defaultValue`,
   * which is what a form reset restores to. Passwords are never echoed.
   */
  values?: Record<string, string>;
};

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

/**
 * Where a recovery link has to land. /auth/reset redeems the token and sends
 * people on to the form itself — see the note there for why this URL carries no
 * query string of its own.
 */
const RESET_CALLBACK = "/auth/reset";

/**
 * Supabase's messages are written for whoever is reading the server logs, not
 * for a shopper staring at a form. These are the ones that actually surface in
 * normal use; anything unmapped falls through unchanged rather than being
 * flattened into a useless "something went wrong".
 */
function friendlyError(message: string): string {
  if (/rate limit/i.test(message)) {
    return "We've sent too many emails in the last hour. Please try again a little later.";
  }
  if (/error sending/i.test(message)) {
    return "We couldn't send that email just now — please try again in a few minutes.";
  }
  if (/is invalid$/i.test(message)) {
    return "That email address doesn't look right. Please check it and try again.";
  }
  return message;
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
  const values = { email };

  if (!email || !password) return { error: "Enter your email and password.", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase says "Invalid login credentials" for both wrong password and
    // unknown email — on purpose, so it cannot be used to enumerate accounts.
    if (error.message === "Email not confirmed") {
      return { error: "Please confirm your email first — check your inbox for the link.", values };
    }
    return { error: error.message, values };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { name: fullName, email, phone };

  if (!email || !password) return { error: "Enter your email and password.", values };
  if (password.length < 8) return { error: "Password must be at least 8 characters.", values };

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

  const alreadyRegistered = {
    error: "An account with this email already exists.",
    errorLink: { label: "Sign in instead", href: "/account/login" },
    values,
  };

  // Supabase only says this outright when "Confirm email" is off; with it on you
  // get the decoy below instead.
  if (error) {
    if (/already registered/i.test(error.message)) return alreadyRegistered;
    return { error: friendlyError(error.message), values };
  }

  // A duplicate address does not raise an error — Supabase hands back a decoy
  // user with an empty `identities` array so the form cannot be used to work out
  // who has an account. Saying so plainly trades that protection for a much
  // clearer signup, which is the call this storefront makes.
  //
  // Only *confirmed* duplicates look like this. Signing up again with an address
  // that never confirmed still returns its identity, and that is a legitimate
  // "resend me the link" — so it has to fall through to the notice below.
  if (data.user && data.user.identities?.length === 0) return alreadyRegistered;

  // With "Confirm email" on (Supabase default) there is no session yet.
  if (!data.session) {
    return { notice: `Almost there — we sent a confirmation link to ${email}. Click it to finish signing up.` };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

/**
 * Step 1 of a password reset: email the user a recovery link.
 *
 * `redirectTo` is a bare path on purpose. It used to be /auth/callback with the
 * destination hung off a `?next=`, and Supabase quietly refused to redirect to
 * it — a query string keeps the URL from matching the Redirect URLs allowlist,
 * and the fallback is the Site URL, so people landed on the homepage signed in
 * and never saw the form. /auth/reset needs nothing on the query string because
 * it already knows where it is sending them.
 *
 * That exact URL still has to be listed under Authentication → URL
 * Configuration → Redirect URLs, or Supabase refuses to redirect to it:
 *
 *   https://<site>/auth/reset
 *
 * /auth/reset handles both the stock template and a customised one that passes
 * `{{ .TokenHash }}`; the custom one is worth setting up, since it also works
 * when the email is opened on a different device:
 *
 *   {{ .SiteURL }}/auth/reset?token_hash={{ .TokenHash }}&type=recovery
 */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const values = { email };

  if (!email) return { error: "Enter your email address.", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}${RESET_CALLBACK}`,
  });

  // Rate limits and a dead SMTP setup are worth surfacing; a missing account is
  // not — Supabase deliberately succeeds there so the form cannot be used to
  // find out who has an account.
  if (error) return { error: friendlyError(error.message), values };

  return {
    notice: `If ${email} has an account, a reset link is on its way. The link works once and expires in an hour.`,
  };
}

/**
 * Step 2: set the new password.
 *
 * Reaching the form at all means the recovery link already exchanged itself for
 * a session, so `updateUser` has something to act on. Doubling back to getUser()
 * here catches the case where that session expired while the form sat open —
 * without it, updateUser fails with a much less helpful message.
 */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Both passwords must match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "That reset link has expired. Request a fresh one and try again." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  // Supabase rejects reusing the current password when that policy is on.
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/account?updated=password");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
