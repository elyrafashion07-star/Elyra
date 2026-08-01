import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CollectionView from "@/components/collection/CollectionView";
import { collections, getCollection } from "@/data/collections";
import { productsInCollection } from "@/data/products";

export function generateStaticParams() {
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = getCollection(handle);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.title, description: collection.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = getCollection(handle);
  if (!collection) notFound();

  const items = productsInCollection(handle);

  // No banner here — banners live on the homepage only.
  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs trail={[{ label: "Collections", href: "/collections" }, { label: collection.title }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">{collection.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{collection.description}</p>

      <div className="mt-10">
        <CollectionView products={items} />
      </div>
    </Container>
  );
}
