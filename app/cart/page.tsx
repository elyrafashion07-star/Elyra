"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FixedImage from "@/components/ui/FixedImage";
import { formatPrice } from "@/lib/format";
import { cartSubtotal, useCart } from "@/lib/store/cart";

export default function CartPage() {
  const { lines, setQty, remove, note, setNote } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = mounted ? cartSubtotal(lines) : 0;
  const empty = !mounted || lines.length === 0;

  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: "Cart" }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">Your Cart</h1>

      {empty ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <p className="text-sm text-muted">Your cart is empty right now.</p>
          <Link
            href="/collections/all"
            className="bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* lines */}
          <div>
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((line) => (
                <li key={`${line.handle}-${line.variant ?? ""}`} className="flex gap-4 py-5">
                  <Link href={`/products/${line.handle}`} className="w-[90px] shrink-0 sm:w-[110px]">
                    <FixedImage
                      slot="productCard"
                      alt={line.title}
                      label=""
                      className="rounded border border-line"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${line.handle}`} className="text-[15px] font-medium hover:text-gold">
                      {line.title}
                    </Link>
                    {line.variant ? <p className="text-xs text-muted">{line.variant}</p> : null}
                    <p className="mt-1 text-sm font-semibold">{formatPrice(line.price)}</p>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center border border-line bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(line.handle, line.qty - 1, line.variant)}
                          className="px-2.5 py-2"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-8 text-center text-xs">{line.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(line.handle, line.qty + 1, line.variant)}
                          className="px-2.5 py-2"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.handle, line.variant)}
                        className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-sale"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold">{formatPrice(line.price * line.qty)}</p>
                </li>
              ))}
            </ul>

            <label className="mt-6 block text-xs">
              <span className="mb-1.5 block font-semibold tracking-[0.12em] uppercase">
                Order notes
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Gift wrap, delivery instructions, anything we should know…"
                className="w-full resize-none border border-line bg-white p-3 text-[13px] outline-none focus:border-gold"
              />
            </label>
          </div>

          {/* summary */}
          <aside className="h-fit border border-line bg-white p-6 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold tracking-[0.14em] uppercase">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-medium text-gold">Free</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-muted">Taxes calculated at checkout.</p>

            {/* Signed-out shoppers get bounced to the login form by middleware
                and land back here afterwards, so no check is needed up front. */}
            <Link
              href="/checkout"
              className="mt-6 block w-full bg-ink py-3.5 text-center text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/collections/all"
              className="mt-3 block text-center text-[12px] text-muted underline underline-offset-4 hover:text-gold"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
