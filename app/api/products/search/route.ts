import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/search?q=ring
 *
 * The search overlay and the search results page are client components, so they
 * cannot reach the database directly — this is how they get there. Everything
 * it returns is already public on the product pages.
 */
export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();

  if (!query) return NextResponse.json({ products: [] });

  const products = await searchProducts(query);
  return NextResponse.json({ products });
}
