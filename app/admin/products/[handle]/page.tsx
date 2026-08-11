import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductForm from "@/components/admin/ProductForm";
import { deleteProduct } from "@/app/admin/products/actions";
import { collections } from "@/data/collections";
import { getProduct } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Edit Product · Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/products" className="text-[12px] text-muted underline underline-offset-4">
        ← Products
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Edit Product</h1>
          <Link
            href={`/products/${product.handle}`}
            className="mt-2 inline-block text-[12px] text-muted underline underline-offset-4 hover:text-gold"
          >
            View on store →
          </Link>
        </div>

        {/* Past orders keep their own snapshot of title and price, so deleting a
            product never rewrites what someone was charged. */}
        <form action={deleteProduct}>
          <input type="hidden" name="handle" value={product.handle} />
          <button
            type="submit"
            className="flex items-center gap-2 border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-red-300 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>

      <ProductForm product={product} collections={collections} />
    </Container>
  );
}
