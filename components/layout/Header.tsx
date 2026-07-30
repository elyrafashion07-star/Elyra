"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Logo from "@/components/layout/Logo";
import MobileNav from "@/components/layout/MobileNav";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { mainNav } from "@/data/navigation";
import { cartCount, useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const wishHandles = useWishlist((s) => s.handles);

  // Counts come from localStorage, so only render them after hydration.
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(lines) : 0;
  const wishCount = mounted ? wishHandles.length : 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Logo className="mr-auto lg:mr-0" />

          {/* desktop nav */}
          <nav className="mx-auto hidden items-center lg:flex">
            {mainNav.map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3.5 py-3 text-[12px] font-medium tracking-[0.1em] uppercase text-ink-soft transition-colors hover:text-gold xl:px-4"
                >
                  {item.label}
                  {item.children ? <ChevronDown className="h-3 w-3" /> : null}
                </Link>

                {item.children ? (
                  <div className="invisible absolute top-full left-0 z-50 min-w-[220px] translate-y-1 border border-line bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-5 py-2 text-[13px] text-ink-soft transition-colors hover:bg-sand hover:text-gold"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-5 w-5 transition-colors hover:text-gold" />
            </button>
            <Link href="/account/login" aria-label="Account" className="hidden sm:block">
              <User className="h-5 w-5 transition-colors hover:text-gold" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
              <Heart className="h-5 w-5 transition-colors hover:text-gold" />
              {wishCount > 0 ? <Count value={wishCount} /> : null}
            </Link>
            <button type="button" onClick={openCart} aria-label="Open cart" className="relative">
              <ShoppingBag className="h-5 w-5 transition-colors hover:text-gold" />
              {count > 0 ? <Count value={count} /> : null}
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
      {value}
    </span>
  );
}
