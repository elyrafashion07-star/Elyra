import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where a password-recovery email lands.
 *
 * Deliberately a bare path carrying no query string of its own. Supabase only
 * redirects to targets that match its Redirect URLs allowlist, and a query
 * parameter on the end is enough for that match to fail — when it does, Supabase
 * silently falls back to the Site URL instead of reporting anything. That is what
 * dropped people on the homepage: the recovery tokens still rode along in the URL
 * fragment, the browser client picked them up and signed them in, and the form
 * they were sent to change their password never appeared.
 *
 * Because the destination is fixed here, nothing has to survive the round trip.
 */
const RESET_PATH = "/account/reset-password";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // A dead or already-used link carries no token — the reason arrives on the
  // query string instead (error_code=otp_expired, access_denied, …).
  const errorCode = searchParams.get("error_code") ?? searchParams.get("error");
  if (errorCode) {
    console.error("[auth] recovery rejected:", errorCode, searchParams.get("error_description"));
    return NextResponse.redirect(`${origin}/account/login?error=${encodeURIComponent(errorCode)}`);
  }

  const supabase = await createClient();

  // A customised recovery template hands the token straight to the app. This is
  // the safest of the three paths: the token is redeemed server-side and the
  // session only ever exists as an httpOnly cookie, so no page script can read
  // it — and it works when the email is opened on a different device.
  const tokenHash = searchParams.get("token_hash");
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (error) {
      console.error("[auth] recovery verifyOtp failed:", error.message);
      return NextResponse.redirect(`${origin}/account/login?error=link_expired`);
    }
    return NextResponse.redirect(`${origin}${RESET_PATH}`);
  }

  // Stock template: Supabase verified the token on its own domain and sent back
  // a PKCE code to swap for a session.
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Usually means the email was opened in a different browser from the one
      // that asked for the reset — the PKCE verifier cookie is not there.
      console.error("[auth] recovery code exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/account/login?error=link_expired`);
    }
    return NextResponse.redirect(`${origin}${RESET_PATH}`);
  }

  // Neither present means the tokens are in the URL fragment, which never
  // reaches a server. /auth/finish reads them in the browser and comes back.
  const url = new URL(`${origin}/auth/finish`);
  url.searchParams.set("next", RESET_PATH);
  return NextResponse.redirect(url);
}
