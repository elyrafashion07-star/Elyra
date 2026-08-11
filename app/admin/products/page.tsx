import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";
import { loadCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Products · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await loadCatalog();

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted">
            {products.length} product{products.length === 1 ? "" : "s"} ·{" "}
            {products.filter((p) => !p.images?.length).length} without photos
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          <Plus className="h-3.5 w-3.5" /> New Product
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {products.map((product) => (
          <li key={product.handle}>
            <Link
              href={`/admin/products/${product.handle}`}
              className="group flex items-center gap-4 py-3 transition-colors hover:bg-sand"
            >
              <div className="w-14 shrink-0">
                <FixedImage
                  slot="productThumb"
                  src={product.images?.[0]}
                  alt=""
                  label=""
                  sizes="56px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] transition-colors group-hover:text-gold">
                  {product.title}
                </p>
                <p className="truncate text-[12px] text-muted">
                  {product.handle}
                  {product.images?.length ? "" : " · no photos"}
                  {product.soldOut ? " · sold out" : ""}
                </p>
              </div>

              <span className="shrink-0 text-[13px] font-semibold">
                {formatPrice(product.price)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {!products.length ? (
        <p className="py-24 text-center text-sm text-muted">
          No products yet. Use “New Product” to add the first one.
        </p>
      ) : null}
    </Container>
  );
}
