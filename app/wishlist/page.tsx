"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProductGrid from "@/components/product/ProductGrid";
import { productMap } from "@/data/products";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const handles = useWishlist((s) => s.handles);
  const clear = useWishlist((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = mounted
    ? handles.map((h) => productMap.get(h)).filter((p): p is Product => Boolean(p))
    : [];

  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: "Wishlist" }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Wishlist</h1>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-[12px] font-semibold tracking-[0.1em] uppercase text-muted underline underline-offset-4 hover:text-sale"
          >
            Clear wishlist
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <p className="text-sm text-muted">
              {mounted ? "Nothing saved yet — tap the heart on any product." : "Loading…"}
            </p>
            <Link
              href="/collections/all"
              className="bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </Container>
  );
}
