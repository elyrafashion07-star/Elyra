import { NextResponse } from "next/server";
import { completeYourLook, getProductsByHandles, trendingProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Enough for a full wishlist; past this the caller is not a real shopper. */
const MAX_HANDLES = 100;

/**
 * GET /api/products/by-handles?handles=a,b,c
 * GET /api/products/by-handles?set=upsell
 *
 * The wishlist and the cart drawer keep only handles in localStorage — this
 * turns those back into products for client components, which cannot query the
 * database themselves.
 *
 * Handles that no longer exist are simply absent from the response, which is
 * what lets a wishlist survive a product being deleted.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  // Named sets the storefront asks for by name rather than by handle.
  const set = params.get("set");
  if (set === "upsell") return NextResponse.json({ products: await completeYourLook() });
  if (set === "trending") return NextResponse.json({ products: await trendingProducts() });

  const handles = (params.get("handles") ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, MAX_HANDLES);

  if (!handles.length) return NextResponse.json({ products: [] });

  return NextResponse.json({ products: await getProductsByHandles(handles) });
}
