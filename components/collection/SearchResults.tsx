"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { popularSearches } from "@/data/site";
import { useProductSearch } from "@/lib/hooks/products";

export default function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [value, setValue] = useState(q);

  // No debounce needed: q only changes on submit, not per keystroke.
  const { products: results, loading } = useProductSearch(q, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 flex max-w-xl items-center border-b border-ink pb-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search rings, anklets, rakhi…"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Search">
          <Search className="h-5 w-5" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted">Popular:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
            className="rounded-full border border-line px-3 py-1 transition-colors hover:border-gold hover:text-gold"
          >
            {term}
          </button>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-muted">
        {!q
          ? "Type something to search."
          : loading
            ? "Searching…"
            : `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”`}
      </p>

      <div className="mt-6">{q ? <ProductGrid products={results} /> : null}</div>
    </>
  );
}
