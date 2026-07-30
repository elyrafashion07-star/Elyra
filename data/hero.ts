export type HeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  /** Drop real files here later: 1920×800 desktop, 800×1000 mobile. */
  desktopSrc?: string;
  mobileSrc?: string;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Rakhi Collection 2026",
    title: "Silver That Stays Long After the Thread",
    text: "925 sterling rakhis and rakhi bracelets he will actually keep wearing.",
    cta: { label: "Shop Rakhi 2026", href: "/collections/rakhi-2026" },
  },
  {
    eyebrow: "New Arrivals",
    title: "Everyday Silver, Quietly Extraordinary",
    text: "Hand-finished rings, chains and anklets — BIS hallmarked, made in small batches.",
    cta: { label: "Shop New In", href: "/collections/new-arrivals" },
  },
  {
    eyebrow: "The Luxe Collection",
    title: "18k Gold Plated Over Sterling",
    text: "The warmth of gold with the honesty of 925 silver underneath.",
    cta: { label: "Explore Luxe", href: "/collections/luxe-gold-plated" },
  },
];
