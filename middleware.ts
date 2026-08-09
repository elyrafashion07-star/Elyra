import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseEnvSet, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase session cookie on every matched request, and gates the
 * account area.
 *
 * `getUser()` must be called here — it revalidates the token with Supabase and
 * writes the refreshed cookie onto the response. Without it, sessions silently
 * expire mid-browse.
 */

/**
 * Signed-in users only.
 *
 * /admin needs more than a session, but the role lives in the database and not
 * in the token, and this runs on every request — so the role check belongs in
 * app/admin/layout.tsx, where one query per view is affordable. All this does is
 * send signed-out visitors to the login form instead of letting them through.
 */
const PROTECTED = ["/account", "/admin"];
/**
 * Pointless once you are signed in — bounce to the account page. These sit under
 * /account, so without this list PROTECTED would lock signed-out people out of
 * the very pages they need.
 *
 * /account/reset-password is deliberately *not* here: the recovery link signs
 * you in before you get there, so it has to stay reachable while signed in.
 */
const AUTH_PAGES = ["/account/login", "/account/register", "/account/forgot-password"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // This middleware runs on every route, so a missing key must not 500 the whole
  // storefront — most likely cause is env vars not set on the host (Netlify,
  // Vercel…). Let pages render; the account area still fails loudly on its own.
  if (!isSupabaseEnvSet()) {
    console.error(
      "[auth] Supabase env vars are missing — session handling is disabled. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your host's environment settings and redeploy.",
    );
    return response;
  }

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!user && isProtected && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    // Come back here after signing in.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and images — the session needs refreshing
    // on normal page loads, not on every .png.
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
