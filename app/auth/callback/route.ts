import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase's *stock* confirmation email lands.
 *
 * The default template sends people to /auth/v1/verify on the Supabase domain,
 * which verifies the token and then bounces to whatever `redirect_to` says with
 * `?code=` attached. That code has to be swapped for a session cookie here —
 * nothing else in the app does it, so without this route a confirmed user comes
 * back to the site still signed out.
 *
 * The sibling /auth/confirm route handles the other flow, where a *customised*
 * email template passes `token_hash` straight to the app. That one only becomes
 * editable once custom SMTP is set up, and it is the better option because it
 * also works when the email is opened on a different device (see below).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // A dead or already-used link never carries a code — Supabase puts the reason
  // on the query string instead (error_code=otp_expired, access_denied, …).
  const errorCode = searchParams.get("error_code") ?? searchParams.get("error");
  if (errorCode) {
    console.error("[auth] callback rejected:", errorCode, searchParams.get("error_description"));
    return NextResponse.redirect(`${origin}/account/login?error=${encodeURIComponent(errorCode)}`);
  }

  const next = searchParams.get("next");
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

  const code = searchParams.get("code");
  if (!code) {
    // No ?code= does not mean the link is dead. Supabase only issues a code when
    // the flow it is completing was started with a PKCE challenge; otherwise it
    // falls back to the implicit flow and hangs the tokens off the URL *fragment*
    // (#access_token=…). Fragments are never sent to a server, so this handler
    // cannot see them — /auth/finish runs in the browser and picks them up.
    // Browsers carry the fragment across a redirect whose Location has none.
    const url = new URL(`${origin}/auth/finish`);
    url.searchParams.set("next", target);
    return NextResponse.redirect(url);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Most likely cause after a genuinely expired link: the email was opened in
    // a different browser or device from the one that signed up. The PKCE code
    // verifier is a cookie, so it simply is not there to complete the exchange.
    console.error("[auth] code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/account/login?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}${target}`);
}
