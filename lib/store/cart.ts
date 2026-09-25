"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  note: string;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  /** Puts the line in the cart at exactly `qty`, without opening the drawer. */
  buyNow: (line: Omit<CartLine, "qty">, qty: number) => void;
  remove: (handle: string, variant?: string) => void;
  setQty: (handle: string, qty: number, variant?: string) => void;
  setNote: (note: string) => void;
  /** Fills in photos for lines that were saved without one. Never overwrites. */
  fillImages: (images: Record<string, string>) => void;
  clear: () => void;
};

/**
 * Mirrors MAX_QTY_PER_LINE in lib/orders/pricing.ts. That file is server-only so
 * it cannot be imported here; the server is the one that actually enforces it,
 * this just stops the cart from reaching a quantity checkout would reject.
 */
export const MAX_QTY_PER_LINE = 10;

const clampQty = (qty: number) => Math.min(MAX_QTY_PER_LINE, qty);

const same = (a: CartLine, handle: string, variant?: string) =>
  a.handle === handle && (a.variant ?? "") === (variant ?? "");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      note: "",
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => same(l, line.handle, line.variant));
          const lines = existing
            ? s.lines.map((l) => (same(l, line.handle, line.variant) ? { ...l, qty: clampQty(l.qty + qty) } : l))
            : [...s.lines, { ...line, qty: clampQty(qty) }];
          return { lines, isOpen: true };
        }),
      // Sets rather than adds: pressing Buy Now twice (or after Add to Cart)
      // should check out the quantity on screen, not a running total.
      buyNow: (line, qty) =>
        set((s) => {
          const existing = s.lines.some((l) => same(l, line.handle, line.variant));
          const lines = existing
            ? s.lines.map((l) => (same(l, line.handle, line.variant) ? { ...l, qty: clampQty(qty) } : l))
            : [...s.lines, { ...line, qty: clampQty(qty) }];
          return { lines, isOpen: false };
        }),
      remove: (handle, variant) =>
        set((s) => ({ lines: s.lines.filter((l) => !same(l, handle, variant)) })),
      setQty: (handle, qty, variant) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !same(l, handle, variant))
              : s.lines.map((l) => (same(l, handle, variant) ? { ...l, qty: clampQty(qty) } : l)),
        })),
      setNote: (note) => set({ note }),
      fillImages: (images) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.image || !images[l.handle] ? l : { ...l, image: images[l.handle] })),
        })),
      clear: () => set({ lines: [], note: "" }),
    }),
    { name: "elyrafashion-cart", partialize: (s) => ({ lines: s.lines, note: s.note }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
