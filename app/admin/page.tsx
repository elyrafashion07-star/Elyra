import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ImageOff, Package, ShoppingBag, Wallet } from "lucide-react";
import Container from "@/components/ui/Container";
import { loadCatalog } from "@/lib/catalog";
import { formatPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  // Nothing here should ever reach a search index.
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // The layout already proved this is an admin; `cache` makes this free.
  const profile = await getProfile();
  const db = getSupabaseAdmin();

  const [{ data: orders }, products] = await Promise.all([
    // Service-role, so this counts every customer's orders and not just the
    // admin's own — "read own orders" would otherwise scope it.
    db.from("orders").select("status, total_paise, shiprocket_order_id"),
    loadCatalog(),
  ]);

  const all = orders ?? [];
  // Revenue is money actually taken: pending orders were never paid for, and
  // refunded ones were given back.
  const earning = all.filter((o) => ["paid", "shipped", "delivered"].includes(o.status));
  const revenue = earning.reduce((sum, o) => sum + o.total_paise, 0);
  const unshipped = all.filter((o) => o.status === "paid" && !o.shiprocket_order_id).length;
  const noPhotos = products.filter((p) => !p.images?.length).length;

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in as {profile?.full_name || profile?.email}
      </p>

      {unshipped ? (
        <Link
          href="/admin/orders"
          className="mt-6 flex items-start gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 transition-colors hover:border-amber-400"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {unshipped} paid order{unshipped === 1 ? "" : "s"} never reached Shiprocket — open Orders
          to retry.
        </Link>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Wallet className="h-4 w-4" />} label="Revenue" value={formatPaise(revenue)} />
        <Stat
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Paid orders"
          value={String(earning.length)}
        />
        <Stat
          icon={<Package className="h-4 w-4" />}
          label="Products"
          value={String(products.length)}
        />
        <Stat
          icon={<ImageOff className="h-4 w-4" />}
          label="Without photos"
          value={String(noPhotos)}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/products" className="group block">
          <Card
            icon={<Package className="h-5 w-5 text-gold" />}
            title="Products"
            body="Add, edit and photograph the catalogue."
          />
        </Link>
        <Link href="/admin/orders" className="group block">
          <Card
            icon={<ShoppingBag className="h-5 w-5 text-gold" />}
            title="Orders"
            body="Payments, shipments and courier tracking."
          />
        </Link>
      </div>
    </Container>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
        {icon} {label}
      </p>
      <p className="mt-2 text-2xl">{value}</p>
    </div>
  );
}

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="h-full border border-line bg-white p-6 transition-colors group-hover:border-gold">
      <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink">
        {icon} {title}
      </p>
      <p className="mt-3 text-[13px] text-ink-soft">{body}</p>
    </div>
  );
}
