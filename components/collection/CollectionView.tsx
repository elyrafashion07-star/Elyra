"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function CollectionView({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<Sort>("featured");
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );
  const priceCeiling = useMemo(
    () => Math.max(1000, ...products.map((p) => p.price)),
    [products],
  );

  const visible = useMemo(() => {
    let list = products;
    if (categories.length) list = list.filter((p) => categories.includes(p.category));
    if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [products, categories, maxPrice, sort]);

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const clearAll = () => {
    setCategories([]);
    setMaxPrice(null);
  };

  const activeCount = categories.length + (maxPrice !== null ? 1 : 0);

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase">Category</h3>
        <ul className="space-y-2">
          {allCategories.map((c) => (
            <li key={c}>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={() => toggleCategory(c)}
                  className="h-3.5 w-3.5 accent-[#b08d57]"
                />
                <span className="capitalize">{c.replace(/-/g, " ")}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase">Max Price</h3>
        <input
          type="range"
          min={1000}
          max={priceCeiling}
          step={100}
          value={maxPrice ?? priceCeiling}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#b08d57]"
        />
        <p className="mt-2 text-[13px] text-muted">
          Up to {formatPrice(maxPrice ?? priceCeiling)}
        </p>
      </div>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gold underline underline-offset-4"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
      {/* desktop sidebar */}
      <aside className="hidden lg:block">{filterPanel}</aside>

      <div>
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>

          <p className="hidden text-[13px] text-muted lg:block">
            {visible.length} product{visible.length === 1 ? "" : "s"}
          </p>

          <label className="flex items-center gap-2 text-[12px]">
            <span className="hidden text-muted sm:inline">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-line bg-white px-3 py-2 text-[12px] outline-none focus:border-gold"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ProductGrid products={visible} />
      </div>

      {/* mobile filter sheet */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${filtersOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!filtersOpen}
      >
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity ${filtersOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[82%] max-w-xs overflow-y-auto bg-cream p-5 transition-transform duration-300 ${
            filtersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-[0.14em] uppercase">Filters</span>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          {filterPanel}
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="mt-8 w-full bg-ink py-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-cream"
          >
            Show {visible.length} results
          </button>
        </div>
      </div>
    </div>
  );
}
