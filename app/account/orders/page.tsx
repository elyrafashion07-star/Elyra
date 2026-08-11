import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { formatPaise } from "@/lib/format";
import { createClient, getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/account/login?next=/account/orders");

  // RLS scopes this to the signed-in customer — no user_id filter needed, and
  // adding one would only hide a policy mistake rather than prevent it.
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("order_no, status, total_paise, created_at")
    .order("created_at", { ascending: false });

  return (
    <Container className="py-10 sm:py-14">
      <Breadcrumbs trail={[{ label: "My Account", href: "/account" }, { label: "Orders" }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">My Orders</h1>

      {!orders?.length ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <p className="text-sm text-muted">You have not placed an order yet.</p>
          <Link
            href="/collections/all"
            className="bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.order_no}>
              <Link
                href={`/account/orders/${order.order_no}`}
                className="flex flex-wrap items-center justify-between gap-3 py-5 transition-colors hover:text-gold"
              >
                <span>
                  <span className="text-[13px] font-semibold">{order.order_no}</span>
                  <span className="ml-3 text-[13px] text-muted">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
                <span className="flex items-center gap-4 text-[13px]">
                  <span className="text-muted capitalize">{order.status}</span>
                  <span className="font-semibold">{formatPaise(order.total_paise)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
