/**
 * Single source of truth for every image slot on the site.
 *
 * Every <FixedImage /> pulls its width/height from here, so the layout box is
 * reserved before an image ever loads (zero CLS). When you drop in real photos,
 * export them at exactly these pixel dimensions and nothing on the page moves.
 *
 *   name                 upload size        ratio
 *   ─────────────────────────────────────────────────
 *   logo                 480 × 160          3:1  (full lockup)
 *   logoMark             640 × 387          ~5:3 (EF monogram, transparent PNG)
 *   heroDesktop         1672 × 836          2:1  (banner art is 16:9 — 105px trims off)
 *   heroBanner          1672 × 941         16:9 (phone + tablet — the art's own ratio, never cropped)
 *   productCard         1000 × 1000         1:1
 *   productMain         1200 × 1500         4:5
 *   productThumb         200 × 250          4:5
 *   categoryTile         600 × 720          5:6
 *   occasionTile         600 × 600          1:1
 *   collectionTile       800 × 800          1:1
 *   budgetTile           800 × 800          1:1
 *   giftingTile          800 × 800          1:1
 *   genderBanner        1500 × 1000         3:2  (transparent PNG, art has its own CTA)
 *   genderBackdrop      2000 ×  661         ~3:1 (silk wave behind both panels)
 *   collectionBanner    1920 × 500          ~4:1
 *   authenticityBanner  1200 × 1500         4:5
 *   cartThumb            150 × 150          1:1
 *   uspIcon               96 × 96           1:1
 *   payBadge             120 × 80           3:2
 *   videoPoster         1280 × 720          16:9
 */

export type ImageSpec = {
  width: number;
  height: number;
  /** Default `sizes` hint for next/image once real files are in place. */
  sizes?: string;
};

export const IMAGE_SIZES = {
  logo: { width: 480, height: 160, sizes: "150px" },
  logoMark: { width: 640, height: 387, sizes: "110px" },

  heroDesktop: { width: 1672, height: 836, sizes: "100vw" },
  heroBanner: { width: 1672, height: 941, sizes: "100vw" },

  // Matches ProductGrid's 2 / 3 / 4 columns (breaking at md and xl), capped by the
  // 1400px container. ProductSlider overrides this — its cards are a different width.
  productCard: {
    width: 1000,
    height: 1000,
    sizes: "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 350px",
  },
  productMain: { width: 1200, height: 1500, sizes: "(max-width: 1024px) 100vw, 600px" },
  productThumb: { width: 200, height: 250, sizes: "80px" },

  categoryTile: { width: 600, height: 720, sizes: "(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw" },
  occasionTile: { width: 600, height: 600, sizes: "(max-width: 768px) 45vw, 24vw" },
  collectionTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw" },
  budgetTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, 16vw" },
  giftingTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, 16vw" },

  genderBanner: { width: 1500, height: 1000, sizes: "(max-width: 768px) 100vw, 50vw" },
  genderBackdrop: { width: 2000, height: 661, sizes: "100vw" },
  collectionBanner: { width: 1920, height: 500, sizes: "100vw" },
  authenticityBanner: { width: 1200, height: 1500, sizes: "(max-width: 1024px) 100vw, 500px" },

  cartThumb: { width: 150, height: 150, sizes: "75px" },
  uspIcon: { width: 96, height: 96, sizes: "48px" },
  payBadge: { width: 120, height: 80, sizes: "60px" },
  videoPoster: { width: 1280, height: 720, sizes: "100vw" },
} as const satisfies Record<string, ImageSpec>;

export type ImageSlot = keyof typeof IMAGE_SIZES;
