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
  /** Number of gallery slots on the PDP. Images are placeholders for now. */
  gallery: number;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  group: "category" | "occasion" | "collection" | "budget" | "gender" | "gifting" | "feature";
  /** Tile artwork in /public/images — omit to render the sized placeholder. */
  image?: string;
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
