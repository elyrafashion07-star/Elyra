export type HeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  /** Banner art lives in /public/images/banners — 1672 × 941 (16:9). */
  desktopSrc?: string;
  mobileSrc?: string;
  /**
   * Desktop-only. The 16:9 art is squeezed into a ~2.9:1 box there (361px comes
   * off), so anchor the crop per slide and no face or product gets cut. Phone
   * and tablet show the art at its own 16:9 ratio, so nothing is cropped.
   */
  focus?: string;
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Bestseller",
    title: "The Pieces Everyone Reorders",
    text: "Fan-favourite artificial jewellery, restocked because you keep asking for it.",
    cta: { label: "Shop Bestsellers", href: "/collections/bestseller" },
    desktopSrc: "/images/banners/b1.PNG",
    mobileSrc: "/images/banners/b1.PNG",
    focus: "object-center",
  },
  {
    eyebrow: "New Arrivals",
    title: "Everyday Style, Quietly Extraordinary",
    text: "Rings, chains and anklets in artificial fashion jewellery — finished by hand and quality checked.",
    cta: { label: "Shop New In", href: "/collections/new-arrivals" },
    desktopSrc: "/images/banners/b2.PNG",
    mobileSrc: "/images/banners/b2.PNG",
    // Hair reaches the very top edge — keep the top, trim the flowers instead.
    focus: "object-top",
  },
  {
    eyebrow: "The Luxe Collection",
    title: "Luxe Look, Fashion Price",
    text: "Artificial jewellery with a rich, golden-toned finish.",
    cta: { label: "Explore Luxe", href: "/collections/luxe-collection" },
    desktopSrc: "/images/banners/b3.PNG",
    mobileSrc: "/images/banners/b3.PNG",
    // Rings sit on the bottom edge — trim the bokeh at the top instead.
    focus: "object-bottom",
  },
];
