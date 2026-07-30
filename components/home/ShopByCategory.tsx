import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionMap, homeCategories } from "@/data/collections";

export default function ShopByCategory() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop by Category"
          subtitle="Discover timeless elegance — shop the Rakkhi collections by category and find the right piece for every moment."
        />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {homeCategories.map((handle) => {
            const c = collectionMap.get(handle);
            if (!c) return null;
            return (
              <TileCard
                key={handle}
                href={`/collections/${handle}`}
                title={c.title}
                slot="categoryTile"
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
