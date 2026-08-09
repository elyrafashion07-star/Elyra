"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, RefreshCw, ShieldCheck, Trash2, Truck, X } from "lucide-react";
import FixedImage from "@/components/ui/FixedImage";
import { completeYourLook } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { cartSubtotal, useCart } from "@/lib/store/cart";

export default function CartDrawer() {
  const { lines, isOpen, close, setQty, remove, note, setNote, coupon, setCoupon, add } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const count = mounted ? lines.reduce((n, l) => n + l.qty, 0) : 0;
  const subtotal = mounted ? cartSubtotal(lines) : 0;

  return (
    <>
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col bg-cream transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">Your Cart ({count})</h2>
          <button type="button" onClick={close} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {count === 0 ? (
            <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <p className="text-sm text-muted">You don&apos;t have any items in your cart.</p>
              <button
                type="button"
                onClick={close}
                className="border border-ink px-6 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-colors hover:bg-ink hover:text-cream"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={`${line.handle}-${line.variant ?? ""}`} className="flex gap-3 p-4">
                  <Link href={`/products/${line.handle}`} onClick={close} className="
                   shrink-0">
                    <FixedImage slot="cartThumb" alt={line.title} label="" className="rounded border border-line" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.handle}`}
                      onClick={close}
                      className="block text-sm font-medium hover:text-gold"
                    >
                      {line.title}
                    </Link>
                    {line.variant ? <p className="text-xs text-muted">{line.variant}</p> : null}
                    <p className="mt-1 text-sm font-semibold">{formatPrice(line.price)}</p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(line.handle, line.qty - 1, line.variant)}
                          className="px-2 py-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(line.handle, line.qty + 1, line.variant)}
                          className="px-2 py-1"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => remove(line.handle, line.variant)}
                        className="text-muted transition-colors hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* upsell rail */}
          <div className="border-t border-line px-4 py-5">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.14em] uppercase">Complete Your Look</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {completeYourLook.map((p) => (
                <div key={p.handle} className="w-[128px] shrink-0">
                  <FixedImage
                    slot="productCard"
                    alt={p.title}
                    label={p.title}
                    className="rounded border border-line"
                  />
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-tight">{p.title}</p>
                  <p className="text-[11px] font-semibold">{formatPrice(p.price)}</p>
                  <button
                    type="button"
                    onClick={() => add({ handle: p.handle, title: p.title, price: p.price })}
                    className="mt-1 w-full border border-ink py-1 text-[10px] font-semibold tracking-[0.1em] uppercase transition-colors hover:bg-ink hover:text-cream"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* note + coupon */}
          <div className="space-y-3 border-t border-line px-4 py-5 text-xs">
            <label className="block">
              <span className="mb-1 block font-semibold tracking-[0.1em] uppercase">
                Special instructions for seller
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full resize-none border border-line bg-white p-2 outline-none focus:border-gold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold tracking-[0.1em] uppercase">Add a coupon</span>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code applies at checkout"
                className="w-full border border-line bg-white p-2 outline-none focus:border-gold"
              />
            </label>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-line bg-cream px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold tracking-[0.12em] uppercase">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Taxes and shipping calculated at checkout.</p>

          <div className="my-3 grid grid-cols-3 gap-2 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> Free Ship
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> 7-Day Returns
            </span>
          </div>

          <Link
            href="/cart"
            onClick={close}
            className="block w-full bg-ink py-3 text-center text-xs font-semibold tracking-[0.16em] uppercase text-cream transition-colors hover:bg-gold"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/cart"
            onClick={close}
            className="mt-2 block w-full border border-ink py-2.5 text-center text-xs font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View Cart
          </Link>
        </div>
      </aside>
    </>
  );
}
