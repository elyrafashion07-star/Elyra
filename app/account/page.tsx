import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, LogOut, Package, User } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SignOutForm from "@/components/account/SignOutForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route; this is the belt-and-braces check.
  if (!user) redirect("/account/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name || user.user_metadata?.full_name || null;

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs trail={[{ label: "My Account" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">My Account</h1>
          <p className="mt-2 text-sm text-muted">
            {name ? `Signed in as ${name} · ` : "Signed in as "}
            {user.email}
          </p>
        </div>

        <SignOutForm>
          <button
            type="submit"
            className="flex items-center gap-2 border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-gold hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </SignOutForm>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card
          icon={<User className="h-5 w-5 text-gold" />}
          title="Profile"
          lines={[name ?? "Name not set", user.email ?? "", profile?.phone ?? "Phone not set"]}
        />
        <Card
          icon={<Package className="h-5 w-5 text-gold" />}
          title="Orders"
          lines={["No orders yet.", "Order history appears here once checkout is live."]}
        />
        <Link href="/wishlist" className="group block">
          <Card
            icon={<Heart className="h-5 w-5 text-gold" />}
            title="Wishlist"
            lines={["View your saved pieces."]}
            hover
          />
        </Link>
      </div>
    </Container>
  );
}

function Card({
  icon,
  title,
  lines,
  hover,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  hover?: boolean;
}) {
  return (
    <div
      className={`h-full border border-line bg-white p-6 ${hover ? "transition-colors group-hover:border-gold" : ""}`}
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink">
        {icon} {title}
      </p>
      <div className="mt-3 space-y-1 text-[13px] text-ink-soft">
        {lines.filter(Boolean).map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}
