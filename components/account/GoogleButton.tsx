"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * "Continue with Google" — same auth.users row and the same handle_new_user()
 * trigger as an email sign-up, just started differently. Reuses /auth/callback
 * to finish: Supabase's OAuth flow hands back the same kind of `?code=` that
 * route already exchanges for a session, so nothing server-side had to change
 * for this to work.
 */
export default function GoogleButton({ next = "/account" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    // On success the browser is already on its way to Google — nothing left to
    // do here. Only a genuine failure (misconfigured provider, network) returns.
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 border border-line bg-white py-3 text-[13px] font-medium text-ink transition-colors hover:border-gold disabled:opacity-70"
      >
        <GoogleMark />
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>
      {error ? <p className="mt-2 text-center text-[12px] text-red-700">{error}</p> : null}
    </div>
  );
}

/** Google's own "G" mark — official four-colour version, unmodified. */
function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.1 3 9.2 7.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 36.2 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.1 40.6 16 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.3 5.3C41.5 35.6 45 30.4 45 24c0-1.4-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
