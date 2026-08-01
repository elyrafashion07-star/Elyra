"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { collectionMap, homeCategories } from "@/data/collections";

type Tile = { handle: string; title: string; image?: string };

const tiles: Tile[] = homeCategories.flatMap((handle) => {
  const c = collectionMap.get(handle);
  return c ? [{ handle, title: c.title, image: c.image }] : [];
});

export default function ShopByCategory() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop by Category"
          subtitle="Discover timeless elegance — shop the Elyrafashion collections by category and find the right piece for every moment."
        />
      </Container>

      {/* Full-bleed on purpose: the outer cards should run off both screen edges. */}
      <div className="relative mt-9">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex items-center">
            {tiles.map((tile, i) => {
              // Ring distance from the centred slide, so both loop directions shrink evenly.
              const raw = Math.abs(i - selected);
              const dist = Math.min(raw, tiles.length - raw);
              const centre = dist === 0;

              return (
                <div
                  key={tile.handle}
                  className="min-w-0 flex-[0_0_62%] px-1.5 sm:flex-[0_0_40%] sm:px-2 lg:flex-[0_0_27%]"
                >
                  <Link
                    href={`/collections/${tile.handle}`}
                    aria-current={centre ? "true" : undefined}
                    className={`group block origin-center transition-all duration-500 ease-out ${
                      centre
                        ? "scale-100"
                        : dist === 1
                          ? "scale-[0.75] opacity-95"
                          : "scale-[0.62] opacity-70"
                    }`}
                  >
                    <div
                      className={`overflow-hidden rounded-2xl bg-white transition-shadow duration-500 ${
                        centre ? "shadow-2xl shadow-ink/15" : "shadow-lg shadow-ink/10"
                      }`}
                    >
                      <FixedImage
                        slot="categoryTile"
                        src={tile.image}
                        alt={tile.title}
                        label={tile.title}
                      />
                      <h3
                        className={`px-3 text-center font-sans transition-all duration-500 ${
                          centre
                            ? "py-6 text-[17px] font-semibold text-ink"
                            : "py-5 text-[15px] font-medium text-ink-soft"
                        } group-hover:text-gold`}
                      >
                        {tile.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous category"
          className="absolute top-1/2 left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg shadow-ink/15 transition-colors hover:text-gold sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next category"
          className="absolute top-1/2 right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg shadow-ink/15 transition-colors hover:text-gold sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
