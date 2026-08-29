import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { homeCollections } from "@/lib/collections";

export default async function GiftingEdit() {
  const gifts = await homeCollections("gifting");
  if (!gifts.length) return null;

  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading title="The Gifting Edit" subtitle="Luxury that fits the occasion — and the person." />
        <div className="mt-9 grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
          {gifts.map((c) => (
            <TileCard
              key={c.handle}
              href={`/collections/${c.handle}`}
              title={c.title}
              slot="giftingTile"
              src={c.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
