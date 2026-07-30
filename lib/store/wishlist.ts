"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  handles: string[];
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      handles: [],
      toggle: (handle) =>
        set((s) => ({
          handles: s.handles.includes(handle)
            ? s.handles.filter((h) => h !== handle)
            : [...s.handles, handle],
        })),
      has: (handle) => get().handles.includes(handle),
      clear: () => set({ handles: [] }),
    }),
    { name: "rakkhi-wishlist" },
  ),
);
