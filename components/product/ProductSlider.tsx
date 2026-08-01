"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

/** Mirrors the flex-basis steps below — the grid's default hint is too small here. */
const CARD_SIZES =
  "(max-width: 639px) 70vw, (max-width: 767px) 45vw, (max-width: 1023px) 31vw, (max-width: 1279px) 24vw, 280px";

export default function ProductSlider({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 sm:gap-5">
          {products.map((p) => (
            <div
              key={p.handle}
              className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_31%] lg:flex-[0_0_23.5%] xl:flex-[0_0_19%]"
            >
              <ProductCard product={p} sizes={CARD_SIZES} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous products"
        className="absolute top-1/2 -left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white shadow-md transition-colors hover:bg-sand lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next products"
        className="absolute top-1/2 -right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white shadow-md transition-colors hover:bg-sand lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
