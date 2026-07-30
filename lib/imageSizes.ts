/**
 * Single source of truth for every image slot on the site.
 *
 * Every <FixedImage /> pulls its width/height from here, so the layout box is
 * reserved before an image ever loads (zero CLS). When you drop in real photos,
 * export them at exactly these pixel dimensions and nothing on the page moves.
 *
 *   name                 upload size        ratio
 *   ─────────────────────────────────────────────────
 *   logo                 480 × 160          3:1
 *   heroDesktop         1920 × 800          12:5
 *   heroMobile           800 × 1000         4:5
 *   productCard         1000 × 1000         1:1
 *   productMain         1200 × 1500         4:5
 *   productThumb         200 × 250          4:5
 *   categoryTile         600 × 720          5:6
 *   occasionTile         600 × 600          1:1
 *   collectionTile       800 × 800          1:1
 *   budgetTile           800 × 800          1:1
 *   giftingTile          800 × 800          1:1
 *   genderBanner        1000 × 1200         5:6
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

  heroDesktop: { width: 1920, height: 800, sizes: "100vw" },
  heroMobile: { width: 800, height: 1000, sizes: "100vw" },

  productCard: { width: 1000, height: 1000, sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" },
  productMain: { width: 1200, height: 1500, sizes: "(max-width: 1024px) 100vw, 600px" },
  productThumb: { width: 200, height: 250, sizes: "80px" },

  categoryTile: { width: 600, height: 720, sizes: "(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 15vw" },
  occasionTile: { width: 600, height: 600, sizes: "(max-width: 768px) 45vw, 24vw" },
  collectionTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw" },
  budgetTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, 16vw" },
  giftingTile: { width: 800, height: 800, sizes: "(max-width: 640px) 45vw, 16vw" },

  genderBanner: { width: 1000, height: 1200, sizes: "(max-width: 768px) 100vw, 50vw" },
  collectionBanner: { width: 1920, height: 500, sizes: "100vw" },
  authenticityBanner: { width: 1200, height: 1500, sizes: "(max-width: 1024px) 100vw, 500px" },

  cartThumb: { width: 150, height: 150, sizes: "75px" },
  uspIcon: { width: 96, height: 96, sizes: "48px" },
  payBadge: { width: 120, height: 80, sizes: "60px" },
  videoPoster: { width: 1280, height: 720, sizes: "100vw" },
} as const satisfies Record<string, ImageSpec>;

export type ImageSlot = keyof typeof IMAGE_SIZES;
