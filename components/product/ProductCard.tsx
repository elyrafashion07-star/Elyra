"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import FixedImage from "@/components/ui/FixedImage";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import { formatPrice, discountPercent } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlist((s) => s.toggle);
  const off = discountPercent(product.price, product.compareAt);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg hover:shadow-ink/5">
      {/* image */}
      <Link href={`/products/${product.handle}`} aria-label={product.title}>
        <FixedImage
          slot="productCard"
          alt={product.title}
          label={product.title}
          className="bg-sand transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      {/* badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {product.soldOut ? <Badge label="SOLD OUT" /> : off ? <Badge label={`SALE`} /> : null}
        {product.badge ? <Badge label={product.badge} /> : null}
      </div>

      {/* wishlist */}
      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggleWish(product.handle)}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${wishlisted ? "fill-sale text-sale" : "text-ink-soft"}`}
        />
      </button>

      {/* info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <Rating value={product.rating} count={product.reviews} />
        <Link
          href={`/products/${product.handle}`}
          className="line-clamp-2 font-sans text-sm font-medium text-ink transition-colors hover:text-gold"
        >
          {product.title}
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-[15px] font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.compareAt ? (
            <span className="text-xs text-muted line-through">{formatPrice(product.compareAt)}</span>
          ) : null}
          {off ? <span className="text-xs font-semibold text-sale">{off}% off</span> : null}
        </div>
        <button
          type="button"
          disabled={product.soldOut}
          onClick={() =>
            add({ handle: product.handle, title: product.title, price: product.price })
          }
          className="mt-2 w-full rounded-md border border-ink bg-ink py-2 text-xs font-semibold tracking-[0.12em] uppercase text-cream transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-sand disabled:text-muted"
        >
          {product.soldOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
