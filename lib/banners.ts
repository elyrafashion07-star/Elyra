/**
 * Homepage hero banners, read from Supabase.
 *
 * The hero_slides table has existed since 0001 and is seeded from data/hero.ts,
 * but until the admin panel could edit it the slider read that file directly.
 * Now the table is the source of truth; data/hero.ts is only the fallback for a
 * database that has no rows yet (and the seed).
 */
import "server-only";
import { cache } from "react";
import { heroSlides as fallbackSlides, type HeroSlide } from "@/data/hero";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { HeroSlideRow } from "@/lib/supabase/types";

export type Banner = HeroSlide & { position: number; active: boolean };

export function toBanner(row: HeroSlideRow): Banner {
  return {
    position: row.position,
    active: row.active,
    eyebrow: row.eyebrow,
    title: row.title,
    text: row.body,
    cta: { label: row.cta_label, href: row.cta_href },
    desktopSrc: row.desktop_src ?? undefined,
    // The phone art is optional — most banners use the one picture for both.
    mobileSrc: row.mobile_src ?? row.desktop_src ?? undefined,
    focus: row.focus ?? undefined,
  };
}

/**
 * What the homepage slider shows: active banners in order.
 *
 * Falls back to the built-in slides only when the table is empty or unreadable,
 * never when the admin has simply switched every banner off.
 */
export const loadHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  if (!isSupabaseConfigured) return fallbackSlides;

  const { data, error } = await getSupabase().from("hero_slides").select("*").order("position");

  if (error) {
    console.error("[banners] load failed:", error.message);
    return fallbackSlides;
  }
  if (!data?.length) return fallbackSlides;

  return data.filter((row) => row.active).map(toBanner);
});
