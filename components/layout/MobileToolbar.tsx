"use client";

import Link from "next/link";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/store/cart";

export default function MobileToolbar() {
  const openCart = useCart((s) => s.open);

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-line bg-cream xl:hidden"
    >
      <Item href="/" icon={<Home className="h-5 w-5" />} label="Home" />
      <Item href="/account" icon={<User className="h-5 w-5" />} label="Account" />
      <Item href="/wishlist" icon={<Heart className="h-5 w-5" />} label="Wishlist" />
      <button type="button" onClick={openCart} className={cell}>
        <ShoppingBag className="h-5 w-5 shrink-0" />
        <Label>Cart</Label>
      </button>
      <Item href="/search" icon={<Search className="h-5 w-5" />} label="Search" />
    </nav>
  );
}

// `min-w-0` lets the label truncate instead of widening the column — at 320px
// each cell is only 64px wide.
const cell = "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] tracking-wide uppercase";

function Item({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className={cell}>
      <span className="shrink-0">{icon}</span>
      <Label>{label}</Label>
    </Link>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="max-w-full truncate leading-none">{children}</span>;
}
