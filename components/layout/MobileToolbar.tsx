"use client";

import Link from "next/link";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/store/cart";

export default function MobileToolbar() {
  const openCart = useCart((s) => s.open);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-cream lg:hidden">
      <Item href="/" icon={<Home className="h-5 w-5" />} label="Home" />
      <Item href="/account" icon={<User className="h-5 w-5" />} label="Account" />
      <Item href="/wishlist" icon={<Heart className="h-5 w-5" />} label="Wishlist" />
      <button
        type="button"
        onClick={openCart}
        className="flex flex-col items-center gap-1 py-2 text-[10px] tracking-wide uppercase"
      >
        <ShoppingBag className="h-5 w-5" />
        Cart
      </button>
      <Item href="/search" icon={<Search className="h-5 w-5" />} label="Search" />
    </nav>
  );
}

function Item({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 py-2 text-[10px] tracking-wide uppercase">
      {icon}
      {label}
    </Link>
  );
}
