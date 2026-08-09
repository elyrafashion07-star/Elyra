import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

/**
 * The gate for everything under /admin.
 *
 * Middleware only establishes that *someone* is signed in — it has no cheap way
 * to read a role, since nothing puts one in the JWT. The real check lives here,
 * and because it is a layout it runs for every nested route without each page
 * having to remember to ask.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  // Signed out — middleware normally catches this first; this covers the gap
  // where a session expires between the two.
  if (!profile) redirect("/account/login?next=/admin");

  // Signed in but not an admin: 404 rather than a redirect, so the admin area
  // does not advertise that it exists to someone with no business there.
  if (profile.role !== "admin") notFound();

  return <>{children}</>;
}
