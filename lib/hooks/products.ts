"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

/**
 * Product lookups for client components.
 *
 * The catalogue moved from a compiled-in file to Supabase, and a client
 * component cannot query the database — so these go through /api/products/*.
 * Everything they return is already public on the product pages.
 */

type State = { products: Product[]; loading: boolean };

const EMPTY: Product[] = [];

async function fetchProducts(url: string, signal: AbortSignal): Promise<Product[]> {
  const res = await fetch(url, { signal });
  if (!res.ok) return EMPTY;
  const data = (await res.json()) as { products?: Product[] };
  return data.products ?? EMPTY;
}

/**
 * Search, debounced.
 *
 * Without the delay this fires a request per keystroke; 250ms is long enough to
 * collapse a burst of typing and short enough that results still feel live.
 */
export function useProductSearch(query: string, debounceMs = 250): State {
  const [state, setState] = useState<State>({ products: EMPTY, loading: false });
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setState({ products: EMPTY, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const controller = new AbortController();

    const timer = setTimeout(() => {
      void fetchProducts(`/api/products/search?q=${encodeURIComponent(trimmed)}`, controller.signal)
        .then((products) => setState({ products, loading: false }))
        // Abort is the expected path when the query changes mid-flight.
        .catch(() => {});
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, debounceMs]);

  return state;
}

/**
 * Turns stored handles — a wishlist, a cart — back into products.
 *
 * The result keeps the order of `handles` rather than the catalogue's, so a
 * wishlist stays in the order things were saved. Handles that no longer exist
 * simply drop out, which is what lets a saved list survive a deleted product.
 */
export function useProductsByHandles(handles: string[]): State {
  const [state, setState] = useState<State>({ products: EMPTY, loading: true });

  // A fresh array every render would restart the effect forever; the joined
  // string is what actually changed.
  const key = handles.join(",");

  useEffect(() => {
    if (!key) {
      setState({ products: EMPTY, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const controller = new AbortController();

    void fetchProducts(`/api/products/by-handles?handles=${encodeURIComponent(key)}`, controller.signal)
      .then((products) => {
        const byHandle = new Map(products.map((p) => [p.handle, p]));
        const ordered = key.split(",").flatMap((h) => {
          const found = byHandle.get(h);
          return found ? [found] : [];
        });
        setState({ products: ordered, loading: false });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [key]);

  return state;
}

/** One of the fixed rows the catalogue defines by name rather than by handle. */
function useNamedSet(set: "upsell" | "trending"): State {
  const [state, setState] = useState<State>({ products: EMPTY, loading: true });

  useEffect(() => {
    const controller = new AbortController();

    void fetchProducts(`/api/products/by-handles?set=${set}`, controller.signal)
      .then((products) => setState({ products, loading: false }))
      .catch(() => {});

    return () => controller.abort();
  }, [set]);

  return state;
}

/** The "complete your look" row in the cart drawer. */
export function useUpsellProducts(): State {
  return useNamedSet("upsell");
}

/** Shown in the search overlay before anything is typed. */
export function useTrendingProducts(): State {
  return useNamedSet("trending");
}
