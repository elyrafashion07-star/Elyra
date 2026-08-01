export type HeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  /** Banner art lives in /public/images/banners — 1672 × 941 (16:9). */
  desktopSrc?: string;
  mobileSrc?: string;
  /**
   * Where to anchor the crop, since the 16:9 art is squeezed into a 2:1 box on
   * desktop (105px comes off) and a 4:5 box on mobile (the left negative space
   * goes). Set per slide so no face or product gets cut.
   */
  focus?: string;
  mobileFocus?: string;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Rakhi Collection 2026",
    title: "Silver That Stays Long After the Thread",
    text: "925 sterling rakhis and rakhi bracelets he will actually keep wearing.",
    cta: { label: "Shop Rakhi 2026", href: "/collections/rakhi-2026" },
    desktopSrc: "/images/banners/b1.PNG",
    mobileSrc: "/images/banners/b1.PNG",
    focus: "object-center",
    mobileFocus: "object-right",
  },
  {
    eyebrow: "New Arrivals",
    title: "Everyday Silver, Quietly Extraordinary",
    text: "Hand-finished rings, chains and anklets — BIS hallmarked, made in small batches.",
    cta: { label: "Shop New In", href: "/collections/new-arrivals" },
    desktopSrc: "/images/banners/b2.PNG",
    mobileSrc: "/images/banners/b2.PNG",
    // Hair reaches the very top edge — keep the top, trim the flowers instead.
    focus: "object-top",
    mobileFocus: "object-right",
  },
  {
    eyebrow: "The Luxe Collection",
    title: "18k Gold Plated Over Sterling",
    text: "The warmth of gold with the honesty of 925 silver underneath.",
    cta: { label: "Explore Luxe", href: "/collections/luxe-gold-plated" },
    desktopSrc: "/images/banners/b3.PNG",
    mobileSrc: "/images/banners/b3.PNG",
    // Rings sit on the bottom edge — trim the bokeh at the top instead.
    focus: "object-bottom",
    mobileFocus: "object-right",
  },
];
