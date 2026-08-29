export type Product = {
  handle: string;
  title: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  category: string;
  collections: string[];
  description: string;
  material: string;
  weight: string;
  variants?: { label: string; options: string[] };
  badge?: "NEW" | "BESTSELLER" | "LIMITED";
  soldOut?: boolean;
  /** Shown in the homepage Trending row — see lib/trending.ts. */
  trending?: boolean;
  /**
   * Public Storage URLs in display order; the first is the card image.
   * Empty until someone uploads photos in the admin panel.
   */
  images?: string[];
  /** Legacy placeholder count — used only when `images` is empty. */
  gallery: number;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  group: "category" | "occasion" | "collection" | "budget" | "gender" | "gifting" | "feature";
  /** Tile artwork — a Storage URL, or a path in /public/images. */
  image?: string;
  /** Whether the matching homepage section renders it. */
  showOnHome?: boolean;
  sortOrder?: number;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export type CartLine = {
  handle: string;
  title: string;
  price: number;
  variant?: string;
  qty: number;
};
