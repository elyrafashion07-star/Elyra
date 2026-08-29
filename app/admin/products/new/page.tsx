import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductForm from "@/components/admin/ProductForm";
import { loadCollections } from "@/lib/collections";

export const metadata: Metadata = {
  title: "New Product · Admin",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const collections = await loadCollections();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/products" className="text-[12px] text-muted underline underline-offset-4">
        ← Products
      </Link>
      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">New Product</h1>

      <ProductForm collections={collections} />
    </Container>
  );
}
