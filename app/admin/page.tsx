import type { Metadata } from "next";
import Link from "next/link";
import { Package, ShieldCheck, Users } from "lucide-react";
import Container from "@/components/ui/Container";
import { getProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  // Nothing here should ever reach a search index.
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // The layout already proved this is an admin; `cache` makes this free.
  const profile = await getProfile();

  return (
    <Container className="py-10 sm:py-14">
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-gold">
        <ShieldCheck className="h-4 w-4" /> Admin
      </p>

      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {profile?.full_name || profile?.email} · role {profile?.role}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          icon={<Package className="h-5 w-5 text-gold" />}
          title="Products"
          body="Catalogue editing still runs through npm run db:seed."
        />
        <Card
          icon={<Users className="h-5 w-5 text-gold" />}
          title="Customers"
          body="Profiles are in Supabase → Table Editor → profiles."
        />
        <Card
          icon={<ShieldCheck className="h-5 w-5 text-gold" />}
          title="Admins"
          body="Promote someone with SQL — see 0003_admin_role.sql."
        />
      </div>

      <p className="mt-10 text-[13px] text-muted">
        <Link href="/account" className="underline underline-offset-4 transition-colors hover:text-gold">
          Back to my account
        </Link>
      </p>
    </Container>
  );
}

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="h-full border border-line bg-white p-6">
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink">
        {icon} {title}
      </p>
      <p className="mt-3 text-[13px] text-ink-soft">{body}</p>
    </div>
  );
}
