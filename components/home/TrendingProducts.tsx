import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductSlider from "@/components/product/ProductSlider";
import { trendingProducts } from "@/data/products";

export default function TrendingProducts() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Top 15 Trending Products"
          subtitle="Elyrafashion brings you trend-setting sterling silver jewellery designed to enhance confidence, style and sophistication."
        />
        <div className="mt-9">
          <ProductSlider products={trendingProducts} />
        </div>
        <div className="mt-9 text-center">
          <Link
            href="/collections/bestseller"
            className="inline-block border border-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors hover:bg-ink hover:text-cream"
          >
            View All Bestsellers
          </Link>
        </div>
      </Container>
    </section>
  );
}
