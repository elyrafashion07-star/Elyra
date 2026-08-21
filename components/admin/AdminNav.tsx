"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-10">
        {LINKS.map((link) => {
          // Exact match for /admin, prefix for the rest — otherwise Dashboard
          // would stay highlighted on every page underneath it.
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                active
                  ? "border-gold text-gold"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/"
          className="ml-auto flex shrink-0 items-center gap-2 px-4 py-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted transition-colors hover:text-gold"
        >
          <Store className="h-4 w-4" /> View store
        </Link>
      </div>
    </nav>
  );
}
