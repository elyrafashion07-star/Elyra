"use client";

import { useState } from "react";
import { Heart, Minus, Plus, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import DeliveryCheck from "@/components/product/DeliveryCheck";
import FixedImage from "@/components/ui/FixedImage";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";

const TABS = ["Description", "Details", "Shipping & Returns"] as const;

export default function ProductDetail({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [variant, setVariant] = useState(product.variants?.options[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");

  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlist((s) => s.toggle);

  const off = discountPercent(product.price, product.compareAt);
  const slots = Array.from({ length: product.gallery }, (_, i) => i);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* ── gallery ─────────────────────────────────────── */}
        {/* min-w-0: grid children default to min-width:auto, so without it the
            horizontally-scrolling thumb strip widens the whole page. */}
        <div className="flex min-w-0 flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible no-scrollbar">
            {slots.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`w-16 shrink-0 border transition-colors sm:w-full ${
                  active === i ? "border-gold" : "border-line"
                }`}
              >
                {/* 200 × 250 */}
                <FixedImage slot="productThumb" alt={`${product.title} ${i + 1}`} label="" />
              </button>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            {/* 1200 × 1500 */}
            <FixedImage
              slot="productMain"
              alt={product.title}
              label={`${product.title} — image ${active + 1}`}
              priority
              className="rounded-xl border border-line"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.soldOut ? <Badge label="SOLD OUT" /> : off ? <Badge label="SALE" /> : null}
              {product.badge ? <Badge label={product.badge} /> : null}
            </div>
          </div>
        </div>

        {/* ── info ────────────────────────────────────────── */}
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight sm:text-3xl lg:text-4xl">{product.title}</h1>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviews} />
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-5">
            <span className="text-xl font-semibold sm:text-2xl">{formatPrice(product.price)}</span>
            {product.compareAt ? (
              <span className="text-sm text-muted line-through sm:text-base">{formatPrice(product.compareAt)}</span>
            ) : null}
            {off ? <span className="text-sm font-semibold text-sale">{off}% off</span> : null}
          </div>
          <p className="mt-1 text-[12px] text-muted">Inclusive of all taxes. Free shipping across India.</p>

          {product.variants ? (
            <div className="mt-6 sm:mt-7">
              <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
                {product.variants.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setVariant(opt)}
                    className={`min-w-12 border px-4 py-2 text-[13px] transition-colors ${
                      variant === opt
                        ? "border-ink bg-ink text-cream"
                        : "border-line bg-white hover:border-gold"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Below sm the 190px button can't share a line with the stepper and the
              heart — it used to push the heart onto a row of its own. `order-last
              w-full` gives the button its own full-width row instead, with the heart
              pinned to the right of the stepper. From sm it's one row again. */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
            <div className="flex items-center border border-line bg-white">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3.5 py-3.5 sm:px-3 sm:py-3">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-9 text-center text-sm">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty(qty + 1)} className="px-3.5 py-3.5 sm:px-3 sm:py-3">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={product.soldOut}
              onClick={() =>
                add({ handle: product.handle, title: product.title, price: product.price, variant }, qty)
              }
              className="order-last w-full bg-ink px-8 py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:bg-muted sm:order-0 sm:w-auto sm:min-w-47.5 sm:flex-1"
            >
              {product.soldOut ? "Sold Out" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={() => toggleWish(product.handle)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="ml-auto flex h-12.5 w-12.5 shrink-0 items-center justify-center border border-line bg-white transition-colors hover:border-gold sm:ml-0"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-sale text-sale" : ""}`} />
            </button>
          </div>

          <DeliveryCheck weight={product.weight} />

          {/* These lines wrap to two or three rows on a narrow phone, so the icons
              need shrink-0 and top alignment rather than being centred and squashed. */}
          <ul className="mt-6 space-y-2 text-[13px] text-ink-soft">
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Free shipping · dispatched in 24–48 hours
            </li>
            <li className="flex items-start gap-2">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Easy 7-day returns and free size exchange
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> BIS hallmarked · certificate of authenticity included
            </li>
          </ul>

          {/* tabs */}
          <div className="mt-8 border-t border-line sm:mt-10">
            {/* All three labels together run ~250px, so the gap and type shrink on
                phones rather than letting the row spill off-screen. */}
            <div className="flex gap-4 border-b border-line sm:gap-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 py-3 text-[10px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase transition-colors sm:text-[11px] sm:tracking-[0.12em] ${
                    tab === t ? "border-gold text-ink" : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="py-5 text-[14px] leading-relaxed text-ink-soft">
              {tab === "Description" ? <p>{product.description}</p> : null}

              {tab === "Details" ? (
                <dl className="grid grid-cols-[92px_1fr] gap-y-2 text-[13px] sm:grid-cols-[130px_1fr]">
                  <dt className="text-muted">Material</dt>
                  <dd>{product.material}</dd>
                  <dt className="text-muted">Weight</dt>
                  <dd>{product.weight}</dd>
                  <dt className="text-muted">Category</dt>
                  <dd className="capitalize">{product.category.replace(/-/g, " ")}</dd>
                  <dt className="text-muted">SKU</dt>
                  <dd className="uppercase">{product.handle.slice(0, 12)}</dd>
                </dl>
              ) : null}

              {tab === "Shipping & Returns" ? (
                <div className="space-y-3">
                  <p>
                    Free shipping on every order across India. Metros arrive in 2–4 working days, the
                    rest of India in 4–7. Pay securely by UPI, card, net banking or wallet.
                  </p>
                  <p>
                    Returns accepted within 7 days of delivery on unworn pieces in original packaging.
                    Size exchanges on rings and chains are free, once per order.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
