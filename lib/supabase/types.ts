/**
 * Hand-written row types, mirroring supabase/migrations/0001_init.sql.
 *
 * Once the schema is live you can replace this file with generated types:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 */

export type CollectionRow = {
  handle: string;
  title: string;
  description: string;
  group: "category" | "occasion" | "collection" | "budget" | "gender" | "gifting" | "feature";
  image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  handle: string;
  title: string;
  price: number;
  compare_at: number | null;
  rating: number;
  reviews: number;
  category: string | null;
  description: string;
  material: string | null;
  weight: string | null;
  variant_label: string | null;
  variant_options: string[] | null;
  badge: "NEW" | "BESTSELLER" | "LIMITED" | null;
  sold_out: boolean;
  gallery: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductCollectionRow = {
  product_handle: string;
  collection_handle: string;
};

export type HeroSlideRow = {
  position: number;
  eyebrow: string;
  title: string;
  body: string;
  cta_label: string;
  cta_href: string;
  desktop_src: string | null;
  mobile_src: string | null;
  focus: string | null;
  mobile_focus: string | null;
  active: boolean;
  updated_at: string;
};

/** One row per auth.users record — see supabase/migrations/0002_auth_profiles.sql */
export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  /**
   * Gates /admin — see 0003_admin_role.sql. Users cannot write this column
   * (the UPDATE grant deliberately excludes it), so only SQL or a service-role
   * client can change it.
   */
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
};

export type InfoPageRow = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  kind: "page" | "policy";
  updated_at: string;
};

type Table<Row, Insert = Row> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      collections: Table<CollectionRow, Omit<CollectionRow, "created_at" | "updated_at">>;
      products: Table<ProductRow, Omit<ProductRow, "created_at" | "updated_at">>;
      product_collections: Table<ProductCollectionRow>;
      hero_slides: Table<HeroSlideRow, Omit<HeroSlideRow, "updated_at">>;
      info_pages: Table<InfoPageRow, Omit<InfoPageRow, "updated_at">>;
      profiles: Table<ProfileRow, Omit<ProfileRow, "created_at" | "updated_at">>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
