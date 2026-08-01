"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FixedImage from "@/components/ui/FixedImage";
import { heroSlides } from "@/data/hero";

/** Steps down with the banner height so the title always clears the art. */
const heading =
  "font-display text-base leading-tight xs:mt-1.5 xs:text-lg sm:mt-2 sm:text-2xl md:text-3xl lg:mt-3 lg:text-4xl xl:text-5xl";

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
              {/* Phone + tablet get the art at its own 16:9 ratio, so the full width
                  is always visible — object-contain keeps that true even if a future
                  banner ships at a different shape. Desktop keeps the wider 2:1 box. */}
              <div className="lg:hidden">
                <FixedImage
                  slot="heroBanner"
                  src={slide.mobileSrc}
                  alt={slide.title}
                  label={`Hero slide ${i + 1}`}
                  priority={i === 0}
                  imgClassName="object-contain"
                />
              </div>
              <div className="hidden lg:block">
                <FixedImage
                  slot="heroDesktop"
                  src={slide.desktopSrc}
                  alt={slide.title}
                  label={`Hero slide ${i + 1} — desktop`}
                  priority={i === 0}
                  imgClassName={`object-cover ${slide.focus ?? "object-center"}`}
                />
              </div>

              {/* Copy always sits over the art. The banner is uncropped 16:9 below lg,
                  so vertical room is tight — the copy scales down step by step and
                  sheds parts it can't fit: the body text goes below sm, and under xs
                  (400px, where the art is ~225px tall) only the heading is left. */}
              <div className="absolute inset-0 flex items-center bg-linear-to-r from-cream/85 via-cream/40 via-45% to-transparent to-70% lg:bg-none">
                <div className="mx-auto w-full max-w-350 px-5 sm:px-6 lg:px-10">
                  {/* Held to the art's empty left side so the subject on the right
                      stays clear at every width. */}
                  <div className="max-w-[58%] lg:max-w-lg">
                    <p className="hidden text-[9px] font-semibold tracking-[0.22em] uppercase text-gold xs:block sm:text-[10px] lg:text-[11px]">
                      {slide.eyebrow}
                    </p>
                    {/* Only the first slide carries the page h1 — the rest are visual headings. */}
                    {i === 0 ? (
                      <h1 className={heading}>{slide.title}</h1>
                    ) : (
                      <p className={heading}>{slide.title}</p>
                    )}
                    <p className="mt-2 hidden max-w-md text-[13px] text-ink-soft sm:block lg:mt-3 lg:text-[15px]">
                      {slide.text}
                    </p>
                    <Link
                      href={slide.cta.href}
                      className="mt-2.5 hidden bg-ink px-4 py-2 text-[9px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold xs:inline-block sm:mt-4 sm:px-5 sm:py-2.5 sm:text-[10px] lg:mt-6 lg:px-7 lg:py-3 lg:text-[11px]"
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
