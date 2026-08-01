import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends people from the confirmation / magic-link / recovery email.
 *
 * Set this as the redirect target in Supabase → Authentication → URL Configuration:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/account/login?error=invalid_link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    console.error("[auth] confirm failed:", error.message);
    return NextResponse.redirect(`${origin}/account/login?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}${target}`);
}
