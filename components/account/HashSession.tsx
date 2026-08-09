"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseEnvSet } from "@/lib/supabase/env";

/**
 * Completes an implicit-flow sign-in from the URL fragment.
 *
 * Supabase's stock confirmation email sends people through its own
 * /auth/v1/verify endpoint, which returns the session as
 * `#access_token=…&refresh_token=…`. A fragment never leaves the browser, so no
 * server route can read it — which is why confirming an email used to land
 * people on the login page still signed out. Handing the tokens to the browser
 * client writes them to the same cookie the server reads, so the redirect that
 * follows arrives authenticated.
 *
 * Unlike the PKCE `?code=` path this needs no verifier cookie, so it also works
 * when the email is opened on a different device from the one that signed up.
 */
export default function HashSession({ next }: { next: string }) {
  useEffect(() => {
    const bounce = (error: string) =>
      window.location.replace(`/account/login?error=${encodeURIComponent(error)}`);

    const params = new URLSearchParams(window.location.hash.slice(1));

    const failure = params.get("error_code") ?? params.get("error");
    if (failure) return bounce(failure);

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token || !isSupabaseEnvSet()) return bounce("invalid_link");

    void createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          console.error("[auth] setSession failed:", error.message);
          return bounce("link_expired");
        }
        // A full navigation, not router.push — the server has to re-read the
        // cookie that was just written, and the fragment has to fall off.
        window.location.replace(next);
      });
  }, [next]);

  return (
    <p className="flex items-center justify-center gap-2 text-[13px] text-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> Signing you in…
    </p>
  );
}

