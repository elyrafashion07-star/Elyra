import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionMap, homeGifting } from "@/data/collections";

export default function GiftingEdit() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <SectionHeading title="The Gifting Edit" subtitle="Luxury that fits the occasion — and the person." />
        <div className="mt-9 grid grid-cols-3 gap-3 sm:gap-5 lg:grid-cols-6">
          {homeGifting.map((handle) => {
            const c = collectionMap.get(handle);
            if (!c) return null;
            return (
              <TileCard
                key={handle}
                href={`/collections/${handle}`}
                title={c.title}
                slot="giftingTile"
                src={c.image}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
