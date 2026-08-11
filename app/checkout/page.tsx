import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Middleware already sends signed-out visitors to the login form; this covers
  // a session that expired on the way here.
  const profile = await getProfile();
  if (!profile) redirect("/account/login?next=/checkout");

  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">Checkout</h1>

      <CheckoutForm
        defaultName={profile.full_name ?? ""}
        defaultEmail={profile.email ?? ""}
        defaultPhone={profile.phone ?? ""}
      />
    </Container>
  );
}
