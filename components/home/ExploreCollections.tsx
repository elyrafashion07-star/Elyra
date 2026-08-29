import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { homeCollections } from "@/lib/collections";

export default async function ExploreCollections() {
  const groups = await homeCollections("collection");
  if (!groups.length) return null;

  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Explore Our Collections"
          subtitle="Thoughtfully styled pieces that tell a story of elegance, meaning and modern luxury."
        />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {groups.map((c) => (
            <TileCard
              key={c.handle}
              href={`/collections/${c.handle}`}
              title={c.title}
              slot="collectionTile"
              src={c.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
