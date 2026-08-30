import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductDetail from "@/components/product/ProductDetail";
import ProductSlider from "@/components/product/ProductSlider";
import { getCollection } from "@/lib/collections";
import { getProduct, loadCatalog, relatedProducts } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await loadCatalog()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product not found" };
  return { title: product.title, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const category = await getCollection(product.category);
  const related = await relatedProducts(product);

  // Product schema so search engines pick up price and rating.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    material: product.material,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    // Only when real reviews back it: an AggregateRating with reviewCount 0 is
    // invalid structured data, and search engines treat inventing one as
    // something worse than leaving it out.
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews,
          },
        }
      : {}),
  };

  return (
    <Container className="py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        trail={[
          { label: category?.title ?? "Shop", href: `/collections/${product.category}` },
          { label: product.title },
        ]}
      />

      <div className="mt-6">
        <ProductDetail product={product} />
      </div>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="You May Also Like" />
        <div className="mt-6 sm:mt-9">
          <ProductSlider products={related} />
        </div>
      </section>
    </Container>
  );
}
