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
  /** Whether the homepage section for this group renders it — see 0007. */
  show_on_home: boolean;
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
  /**
   * Public Storage URLs, in display order — the first is the card image.
   * See 0005_product_images.sql.
   */
  images: string[];
  /** Legacy placeholder count; prefer images.length. */
  gallery: number;
  /** In the homepage Trending row — see lib/trending.ts. */
  trending: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** A header menu entry; `parent_id` set makes it a dropdown child. */
export type NavItemRow = {
  id: string;
  label: string;
  href: string;
  parent_id: string | null;
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

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "shipped"
  | "delivered"
  | "refunded";

/**
 * See supabase/migrations/0004_orders.sql.
 *
 * Every `_paise` field is an integer count of paise, not rupees — that is the
 * unit Razorpay charges and signs in. Use lib/format.ts to render them.
 */
export type OrderRow = {
  id: string;
  order_no: string;
  user_id: string;
  status: OrderStatus;
  subtotal_paise: number;
  shipping_paise: number;
  discount_paise: number;
  total_paise: number;
  currency: string;
  ship_name: string;
  ship_phone: string;
  ship_email: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  /** Set the moment a Shiprocket push is claimed — see lib/orders/fulfil.ts. */
  shipment_requested_at: string | null;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  awb: string | null;
  courier: string | null;
  note: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

/** Snapshot of one line at the moment of purchase — never joined back to products. */
export type OrderItemRow = {
  id: string;
  order_id: string;
  product_handle: string;
  title: string;
  variant: string | null;
  unit_price_paise: number;
  qty: number;
  line_total_paise: number;
};

/** One courier checkpoint — see supabase/migrations/0006_tracking_events.sql. */
export type OrderTrackingEventRow = {
  id: string;
  order_id: string;
  status: string;
  location: string | null;
  note: string | null;
  happened_at: string;
  created_at: string;
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
      collections: Table<
        CollectionRow,
        Pick<CollectionRow, "handle" | "title" | "group"> &
          Partial<Omit<CollectionRow, "handle" | "title" | "group" | "created_at" | "updated_at">>
      >;
      nav_items: Table<
        NavItemRow,
        Pick<NavItemRow, "label" | "href"> &
          Partial<Omit<NavItemRow, "label" | "href" | "created_at" | "updated_at">>
      >;
      // Only handle, title and price have to be given: every other column is
      // either nullable or carries a default — see 0001_init.sql — which is what
      // lets the admin form ask for four fields and no more.
      products: Table<
        ProductRow,
        Pick<ProductRow, "handle" | "title" | "price"> &
          Partial<Omit<ProductRow, "handle" | "title" | "price" | "created_at" | "updated_at">>
      >;
      product_collections: Table<ProductCollectionRow>;
      hero_slides: Table<HeroSlideRow, Omit<HeroSlideRow, "updated_at">>;
      info_pages: Table<InfoPageRow, Omit<InfoPageRow, "updated_at">>;
      profiles: Table<ProfileRow, Omit<ProfileRow, "created_at" | "updated_at">>;
      // order_no, id and the timestamps all come from column defaults.
      orders: Table<
        OrderRow,
        Omit<OrderRow, "id" | "order_no" | "created_at" | "updated_at">
      >;
      order_items: Table<OrderItemRow, Omit<OrderItemRow, "id">>;
      order_tracking_events: Table<
        OrderTrackingEventRow,
        Omit<OrderTrackingEventRow, "id" | "created_at">
      >;
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
