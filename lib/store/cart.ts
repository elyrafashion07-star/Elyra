"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  note: string;
  coupon: string;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (handle: string, variant?: string) => void;
  setQty: (handle: string, qty: number, variant?: string) => void;
  setNote: (note: string) => void;
  setCoupon: (coupon: string) => void;
  clear: () => void;
};

const same = (a: CartLine, handle: string, variant?: string) =>
  a.handle === handle && (a.variant ?? "") === (variant ?? "");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      note: "",
      coupon: "",
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => same(l, line.handle, line.variant));
          const lines = existing
            ? s.lines.map((l) => (same(l, line.handle, line.variant) ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { ...line, qty }];
          return { lines, isOpen: true };
        }),
      remove: (handle, variant) =>
        set((s) => ({ lines: s.lines.filter((l) => !same(l, handle, variant)) })),
      setQty: (handle, qty, variant) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !same(l, handle, variant))
              : s.lines.map((l) => (same(l, handle, variant) ? { ...l, qty } : l)),
        })),
      setNote: (note) => set({ note }),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ lines: [], note: "", coupon: "" }),
    }),
    { name: "rakkhi-cart", partialize: (s) => ({ lines: s.lines, note: s.note, coupon: s.coupon }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
