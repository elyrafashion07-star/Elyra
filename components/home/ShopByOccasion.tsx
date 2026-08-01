import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionMap, homeOccasions } from "@/data/collections";

export default function ShopByOccasion() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop by Occasion"
          subtitle="Whatever you are celebrating, there is a piece of silver that fits the moment."
        />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {homeOccasions.map((handle) => {
            const c = collectionMap.get(handle);
            if (!c) return null;
            return (
              <TileCard
                key={handle}
                href={`/collections/${handle}`}
                title={c.title}
                slot="occasionTile"
                src={c.image}
                rounded="rounded-full"
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
