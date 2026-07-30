import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionMap, homeBudgets } from "@/data/collections";

export default function ShopByBudget() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading title="Shop by Budget" subtitle="Explore the collection sorted by price." />
        <div className="mt-9 grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
          {homeBudgets.map((handle) => {
            const c = collectionMap.get(handle);
            if (!c) return null;
            return (
              <TileCard
                key={handle}
                href={`/collections/${handle}`}
                title={c.title}
                slot="budgetTile"
                rounded="rounded-full"
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
