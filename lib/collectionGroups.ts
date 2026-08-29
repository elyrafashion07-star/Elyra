/**
 * What the collection groups mean, in the words the admin panel uses.
 *
 * Its own module because a `"use server"` file may only export async functions,
 * and both the action and the form need these.
 */
import type { Collection } from "@/lib/types";

export const GROUPS: { value: Collection["group"]; label: string; where: string }[] = [
  { value: "category", label: "Category", where: "Shop by Category · tick-box when adding a product" },
  { value: "occasion", label: "Occasion", where: "Shop by Occasion" },
  { value: "gifting", label: "Gifting", where: "The Gifting Edit" },
  { value: "collection", label: "Collection", where: "Explore Our Collections" },
  { value: "budget", label: "Budget", where: "Shop by Budget — filled from the price, nothing to tag" },
  { value: "gender", label: "Gender", where: "For Her / For Him" },
  { value: "feature", label: "Feature", where: "New Arrivals, Bestseller and the like" },
];

/** Groups whose homepage section draws a picture; the rest style themselves. */
export const NEEDS_IMAGE: Collection["group"][] = [
  "category",
  "occasion",
  "gifting",
  "collection",
];

export function groupLabel(group: Collection["group"]): string {
  return GROUPS.find((g) => g.value === group)?.label ?? group;
}
