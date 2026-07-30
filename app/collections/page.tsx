import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SectionHeading from "@/components/ui/SectionHeading";
import TileCard from "@/components/ui/TileCard";
import { collectionsByGroup } from "@/data/collections";
import type { Collection } from "@/lib/types";

export const metadata: Metadata = {
  title: "All Collections",
  description: "Browse every Rakkhi collection — by category, occasion, budget and gifting.",
};

const groups: { group: Collection["group"]; title: string; cols: string }[] = [
  { group: "category", title: "Shop by Category", cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" },
  { group: "collection", title: "Explore Our Collections", cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" },
  { group: "occasion", title: "Shop by Occasion", cols: "grid-cols-2 lg:grid-cols-4" },
  { group: "budget", title: "Shop by Budget", cols: "grid-cols-3 lg:grid-cols-6" },
  { group: "gifting", title: "The Gifting Edit", cols: "grid-cols-3 lg:grid-cols-6" },
];

export default function CollectionsIndexPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: "Collections" }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">All Collections</h1>

      {groups.map((g) => (
        <section key={g.group} className="mt-14">
          <SectionHeading title={g.title} align="left" />
          <div className={`mt-7 grid gap-4 sm:gap-5 ${g.cols}`}>
            {collectionsByGroup(g.group).map((c) => (
              <TileCard
                key={c.handle}
                href={`/collections/${c.handle}`}
                title={c.title}
                slot={g.group === "category" ? "categoryTile" : "collectionTile"}
              />
            ))}
          </div>
        </section>
      ))}
    </Container>
  );
}
