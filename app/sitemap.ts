import type { MetadataRoute } from "next";
import { collections } from "@/data/collections";
import { products } from "@/data/products";
import { infoPages, policyPages } from "@/data/pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elyrafashion.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/collections",
    "/cart",
    "/wishlist",
    "/search",
    "/account/login",
    "/account/register",
    ...collections.map((c) => `/collections/${c.handle}`),
    ...products.map((p) => `/products/${p.handle}`),
    ...infoPages.map((p) => `/pages/${p.slug}`),
    ...policyPages.map((p) => `/policies/${p.slug}`),
  ];

  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/products") ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
