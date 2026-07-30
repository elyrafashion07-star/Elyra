"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FixedImage from "@/components/ui/FixedImage";
import { heroSlides } from "@/data/hero";

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="relative" aria-label="Featured collections">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {heroSlides.map((slide, i) => (
            <div key={slide.title} className="relative min-w-0 flex-[0_0_100%]">
              {/* Desktop 1920×800 · Mobile 800×1000 — both boxes are pre-sized. */}
              <div className="hidden sm:block">
                <FixedImage
                  slot="heroDesktop"
                  src={slide.desktopSrc}
                  alt={slide.title}
                  label={`Hero slide ${i + 1} — desktop`}
                  priority={i === 0}
                />
              </div>
              <div className="sm:hidden">
                <FixedImage
                  slot="heroMobile"
                  src={slide.mobileSrc}
                  alt={slide.title}
                  label={`Hero slide ${i + 1} — mobile`}
                  priority={i === 0}
                />
              </div>

              {/* copy overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10">
                  <div className="max-w-lg bg-cream/80 p-6 backdrop-blur-sm sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">
                      {slide.eyebrow}
                    </p>
                    {/* Only the first slide carries the page h1 — the rest are visual headings. */}
                    {i === 0 ? (
                      <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
                        {slide.title}
                      </h1>
                    ) : (
                      <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
                        {slide.title}
                      </p>
                    )}
                    <p className="mt-3 max-w-md text-sm text-ink-soft sm:text-[15px]">{slide.text}</p>
                    <Link
                      href={slide.cta.href}
                      className="mt-6 inline-block bg-ink px-7 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
                    >
                      {slide.cta.label}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/80 transition-colors hover:bg-cream sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/80 transition-colors hover:bg-cream sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              selected === i ? "w-6 bg-ink" : "w-1.5 bg-ink/35"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
