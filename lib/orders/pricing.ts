/**
 * Turns whatever the browser claims is in the cart into an amount we are willing
 * to charge.
 *
 * The cart lives in localStorage, so every field in it is attacker-controlled —
 * including `price`. Nothing here reads a price from the client: handles and
 * quantities come in, and the money comes out of the products table. That is the
 * whole point of the module, and why it is the only thing allowed to compute a
 * total.
 */
import "server-only";
import { toPaise } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { OrderItemRow } from "@/lib/supabase/types";

/** What the browser is allowed to tell us. Note the absence of a price. */
export type CartLineInput = {
  handle: string;
  variant?: string | null;
  qty: number;
};

export type PricedLine = Omit<OrderItemRow, "id" | "order_id">;

export type PricedCart = {
  items: PricedLine[];
  /** Set when the first-order discount was applied. */
  discountPercent: number;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
};

/**
 * Free shipping on every order — the announcement bar and the shipping policy
 * both promise it, so this is a constant rather than a Shiprocket rate lookup.
 * If that ever changes, this is the one place to change it.
 */
export const SHIPPING_PAISE = 0;

/**
 * The announcement bar promises "5% flat off on first order". Kept here so the
 * banner and the maths cannot drift apart: change one, change the other.
 */
export const FIRST_ORDER_DISCOUNT_PERCENT = 5;

/** A cart line above this is far more likely to be a mistake than a sale. */
const MAX_QTY_PER_LINE = 10;
const MAX_LINES = 50;

export type PricingResult = { ok: true; cart: PricedCart } | { ok: false; error: string };

/**
 * A customer's first order is one where nothing of theirs has ever been paid for.
 * `paid_at` rather than status, so a refunded or cancelled purchase still counts
 * as having ordered, while abandoned and failed attempts do not use the offer up.
 */
async function isFirstOrder(userId: string): Promise<boolean> {
  const { count, error } = await getSupabaseAdmin()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("paid_at", "is", null);

  // If we cannot tell, do not hand out a discount we cannot justify.
  if (error) {
    console.error("[checkout] first-order lookup failed:", error.message);
    return false;
  }
  return (count ?? 0) === 0;
}

export async function priceCart(
  lines: CartLineInput[],
  { userId }: { userId?: string } = {},
): Promise<PricingResult> {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (lines.length > MAX_LINES) {
    return { ok: false, error: "That is too many items for one order." };
  }

  for (const line of lines) {
    if (!line?.handle || typeof line.handle !== "string") {
      return { ok: false, error: "Something in your cart looks wrong. Please refresh and try again." };
    }
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: `Quantities must be between 1 and ${MAX_QTY_PER_LINE}.` };
    }
  }

  // Service-role: products are world-readable anyway, but this runs alongside the
  // order insert and keeping one client avoids a second connection.
  const db = getSupabaseAdmin();
  const handles = [...new Set(lines.map((l) => l.handle))];

  const { data: products, error } = await db
    .from("products")
    .select("handle, title, price, sold_out, variant_options")
    .in("handle", handles);

  if (error) {
    console.error("[checkout] price lookup failed:", error.message);
    return { ok: false, error: "We could not price your cart just now. Please try again." };
  }

  const byHandle = new Map((products ?? []).map((p) => [p.handle, p]));

  const items: PricedLine[] = [];

  for (const line of lines) {
    const product = byHandle.get(line.handle);

    // A handle that is not in the table is either a stale cart or a forged one.
    // Either way there is no price to charge.
    if (!product) {
      return { ok: false, error: "One of the pieces in your cart is no longer available." };
    }
    if (product.sold_out) {
      return { ok: false, error: `${product.title} has sold out. Please remove it to continue.` };
    }

    // The variant is free text from the browser. Accept only what the product
    // actually offers, so an order never reaches the warehouse with a size that
    // does not exist (or none, when one is needed).
    const options = product.variant_options ?? [];
    const variant = line.variant || null;
    if (options.length ? !variant || !options.includes(variant) : variant) {
      return {
        ok: false,
        error: `Please remove ${product.title} from your cart and add it again with an option selected.`,
      };
    }

    const unit = toPaise(Number(product.price));
    items.push({
      product_handle: product.handle,
      title: product.title,
      variant,
      unit_price_paise: unit,
      qty: line.qty,
      line_total_paise: unit * line.qty,
    });
  }

  const subtotalPaise = items.reduce((sum, i) => sum + i.line_total_paise, 0);

  const eligible = userId ? await isFirstOrder(userId) : false;
  const discountPercent = eligible ? FIRST_ORDER_DISCOUNT_PERCENT : 0;
  // Integer paise, rounded — the orders_total_check constraint in 0004_orders.sql
  // is exact arithmetic on these integers.
  const discountPaise = Math.round((subtotalPaise * discountPercent) / 100);

  return {
    ok: true,
    cart: {
      items,
      discountPercent,
      subtotalPaise,
      shippingPaise: SHIPPING_PAISE,
      discountPaise,
      totalPaise: subtotalPaise + SHIPPING_PAISE - discountPaise,
    },
  };
}
