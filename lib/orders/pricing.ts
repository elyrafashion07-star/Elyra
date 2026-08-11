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

/** A cart line above this is far more likely to be a mistake than a sale. */
const MAX_QTY_PER_LINE = 10;
const MAX_LINES = 50;

export type PricingResult = { ok: true; cart: PricedCart } | { ok: false; error: string };

export async function priceCart(lines: CartLineInput[]): Promise<PricingResult> {
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
    .select("handle, title, price, sold_out")
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

    const unit = toPaise(Number(product.price));
    items.push({
      product_handle: product.handle,
      title: product.title,
      variant: line.variant || null,
      unit_price_paise: unit,
      qty: line.qty,
      line_total_paise: unit * line.qty,
    });
  }

  const subtotalPaise = items.reduce((sum, i) => sum + i.line_total_paise, 0);

  // No coupon engine yet, so nothing can discount an order — the "5% off first
  // order" banner is not wired to anything. Kept explicit so the arithmetic
  // still matches the orders_total_check constraint in 0004_orders.sql.
  const discountPaise = 0;

  return {
    ok: true,
    cart: {
      items,
      subtotalPaise,
      shippingPaise: SHIPPING_PAISE,
      discountPaise,
      totalPaise: subtotalPaise + SHIPPING_PAISE - discountPaise,
    },
  };
}
