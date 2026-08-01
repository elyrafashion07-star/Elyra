"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
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
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        {/* Three columns on desktop — logo left, nav centred, actions right. Wider than
            the site container on purpose, so the logo and icons hug the page edges. */}
        <div className="mx-auto flex max-w-500 items-center gap-4 px-4 py-2.5 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-5 lg:px-8 lg:py-4 xl:px-12 2xl:gap-8 2xl:px-20 2xl:py-5">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Logo className="mr-auto" />

          {/* desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex xl:gap-9 2xl:gap-14">
            {mainNav.map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="block py-4 text-[12.5px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase text-ink transition-colors hover:text-gold xl:text-[14px] 2xl:text-[15px]"
                >
                  {item.label}
                </Link>

                {item.children ? (
                  <div className="invisible absolute top-full left-1/2 z-50 min-w-[220px] -translate-x-1/2 translate-y-1 border border-line bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
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
          <div className="flex items-center gap-4 lg:ml-auto lg:gap-5 2xl:gap-6">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search strokeWidth={1.5} className="h-5.5 w-5.5 transition-colors hover:text-gold 2xl:h-6 2xl:w-6" />
            </button>
            <Link href="/account" aria-label="Account" className="hidden sm:block">
              <User strokeWidth={1.5} className="h-5.5 w-5.5 transition-colors hover:text-gold 2xl:h-6 2xl:w-6" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden sm:block">
              <Heart strokeWidth={1.5} className="h-5.5 w-5.5 transition-colors hover:text-gold 2xl:h-6 2xl:w-6" />
              {wishCount > 0 ? <Count value={wishCount} /> : null}
            </Link>
            <button type="button" onClick={openCart} aria-label={`Open cart, ${count} items`} className="relative">
              <ShoppingBag strokeWidth={1.5} className="h-5.5 w-5.5 transition-colors hover:text-gold 2xl:h-6 2xl:w-6" />
              <Count value={count} />
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
    <span className="absolute -top-2 -right-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
      {value}
    </span>
  );
}
