import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionMap, homeCollections } from "@/data/collections";

export default function ExploreCollections() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Explore Our Collections"
          subtitle="Thoughtfully styled pieces that tell a story of elegance, meaning and modern luxury."
        />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {homeCollections.map((handle) => {
            const c = collectionMap.get(handle);
            if (!c) return null;
            return (
              <TileCard
                key={handle}
                href={`/collections/${handle}`}
                title={c.title}
                slot="collectionTile"
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
