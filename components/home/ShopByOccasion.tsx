import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { homeCollections } from "@/lib/collections";

export default async function ShopByOccasion() {
  const occasions = await homeCollections("occasion");

  // Nothing ticked for the homepage — drop the section rather than an empty grid.
  if (!occasions.length) return null;

  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop by Occasion"
          subtitle="Whatever you are celebrating, there is a piece of silver that fits the moment."
        />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {occasions.map((c) => (
            <TileCard
              key={c.handle}
              href={`/collections/${c.handle}`}
              title={c.title}
              slot="occasionTile"
              src={c.image}
              rounded="rounded-full"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
