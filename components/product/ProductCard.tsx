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

/** `sizes` lets a caller correct the image hint when its cards aren't grid-width. */
export default function ProductCard({ product, sizes }: { product: Product; sizes?: string }) {
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
          // First uploaded image is the card image; no images yet falls back to
          // the sized placeholder, which is what FixedImage does with no src.
          src={product.images?.[0]}
          alt={product.title}
          label={product.title}
          sizes={sizes}
          className="bg-sand transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      {/* badges */}
      {/* Capped so a long badge can never run under the wishlist button — at 300px
          the card is only ~128px wide and "BESTSELLER" used to overlap it. */}
      <div className="absolute top-2 left-2 flex max-w-[calc(100%-3.5rem)] flex-col items-start gap-1.5 sm:top-3 sm:left-3">
        {product.soldOut ? <Badge label="SOLD OUT" /> : off ? <Badge label={`SALE`} /> : null}
        {product.badge ? <Badge label={product.badge} /> : null}
      </div>

      {/* wishlist */}
      <button
        type="button"
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggleWish(product.handle)}
        className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white sm:top-3 sm:right-3 sm:h-8 sm:w-8"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${wishlisted ? "fill-sale text-sale" : "text-ink-soft"}`}
        />
      </button>

      {/* info */}
      {/* Two-up on phones means each card is only ~158px wide at 360px, so the type
          steps down a size and the price row's tracking tightens to stay on one line. */}
      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-4">
        <Rating value={product.rating} count={product.reviews} />
        <Link
          href={`/products/${product.handle}`}
          className="line-clamp-2 font-sans text-[13px] leading-snug font-medium text-ink transition-colors hover:text-gold sm:text-sm"
        >
          {product.title}
        </Link>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1 sm:gap-x-2">
          <span className="text-sm font-semibold text-ink sm:text-[15px]">
            {formatPrice(product.price)}
          </span>
          {product.compareAt ? (
            <span className="text-[11px] text-muted line-through sm:text-xs">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
          {off ? (
            <span className="text-[11px] font-semibold text-sale sm:text-xs">{off}% off</span>
          ) : null}
        </div>
        <button
          type="button"
          disabled={product.soldOut}
          onClick={() =>
            add({ handle: product.handle, title: product.title, price: product.price })
          }
          className="mt-2 w-full rounded-md border border-ink bg-ink py-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-cream transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-sand disabled:text-muted sm:py-2 sm:text-xs sm:tracking-[0.12em]"
        >
          {product.soldOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
