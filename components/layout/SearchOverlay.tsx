"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import FixedImage from "@/components/ui/FixedImage";
import { popularSearches } from "@/data/site";
import { useProductSearch, useTrendingProducts } from "@/lib/hooks/products";
import { formatPrice } from "@/lib/format";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { products: found } = useProductSearch(query);
  const { products: trending } = useTrendingProducts();

  const results = query.trim() ? found.slice(0, 6) : [];
  const suggestions = query.trim() ? results : trending.slice(0, 4);

  // Without this the page scrolls behind the overlay on touch devices.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div onClick={onClose} aria-hidden className="absolute inset-0 bg-ink/40" />
      <div
        className={`relative max-h-[90dvh] overflow-y-auto bg-cream transition-transform duration-300 ${
          open ? "translate-y-0" : "-translate-y-6"
        }`}
      >
        <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl">What are you looking for?</h2>
            <button type="button" onClick={onClose} aria-label="Close search">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={submit} className="flex items-center border-b border-ink pb-2">
            <input
              autoFocus={open}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rings, anklets, rakhi…"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted"
            />
            <button type="submit" aria-label="Submit search">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="rounded-full border border-line px-3 py-1 transition-colors hover:border-gold hover:text-gold"
              >
                {term}
              </button>
            ))}
          </div>

          <h3 className="mt-8 mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
            {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular products"}
          </h3>

          {query.trim() && results.length === 0 ? (
            <p className="py-6 text-sm text-muted">Nothing matched “{query}”. Try a category name.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.map((p) => (
                <Link
                  key={p.handle}
                  href={`/products/${p.handle}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white p-2 transition-colors hover:border-gold"
                >
                  <div className="w-[70px] shrink-0">
                    <FixedImage slot="cartThumb" alt={p.title} label="" className="rounded" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
