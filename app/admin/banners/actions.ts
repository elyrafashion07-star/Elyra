"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { imageProblem, uploadImage } from "@/lib/adminUpload";
import { heroSlides } from "@/data/hero";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

export type BannerField = "title" | "cta_href" | "desktop" | "mobile";

export type BannerFormState = {
  error?: string;
  fieldErrors?: Partial<Record<BannerField, string>>;
  values?: Record<string, string>;
};

/**
 * Banner art shares the collection-images bucket (public read, created in 0007)
 * under its own folder, so no new migration is needed to start uploading.
 */
const BUCKET = "collection-images";
const FOLDER = "hero-banners";

const FOCUS = ["object-top", "object-center", "object-bottom"];

/** Deletes one uploaded file, if it is one of ours — the seeded art lives in /public. */
async function removeUpload(url: string | null | undefined): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const at = url?.indexOf(marker) ?? -1;
  if (!url || at === -1) return;

  const path = decodeURIComponent(url.slice(at + marker.length));
  if (!path.startsWith(`${FOLDER}/`)) return;

  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) console.error("[admin] banner image cleanup failed:", error.message);
}

function revalidateBanners(): void {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

/** A picked file, the kept URL, or "" when the admin removed it. */
async function resolveImage(
  form: FormData,
  field: "desktop" | "mobile",
): Promise<{ url: string; error?: string; uploaded?: boolean }> {
  const file = form.get(field);
  const picked = file instanceof File && file.size > 0 ? file : null;
  const kept = String(form.get(`${field}_url`) ?? "").trim();

  if (!picked) return { url: kept };

  const problem = imageProblem(picked);
  if (problem) return { url: kept, error: problem };

  const uploaded = await uploadImage(BUCKET, FOLDER, picked);
  if (!uploaded) return { url: kept, error: "The photo failed to upload. Please try again." };
  return { url: uploaded, uploaded: true };
}

/**
 * Creates or updates a banner.
 *
 * `position` is the table's primary key and also the slide order, so a new
 * banner goes on the end and reordering swaps positions (see moveBanner).
 */
export async function saveBanner(_prev: BannerFormState, form: FormData): Promise<BannerFormState> {
  if (!(await isAdmin())) return { error: "You do not have permission to do that." };

  const originalRaw = String(form.get("original_position") ?? "").trim();
  const original = originalRaw === "" ? null : Number(originalRaw);

  const title = String(form.get("title") ?? "").trim();
  const eyebrow = String(form.get("eyebrow") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const ctaLabel = String(form.get("cta_label") ?? "").trim();
  const ctaHref = String(form.get("cta_href") ?? "").trim() || "/";
  const focusRaw = String(form.get("focus") ?? "").trim();
  const focus = FOCUS.includes(focusRaw) ? focusRaw : "object-center";
  const active = form.get("active") === "on";

  const values = { title, eyebrow, body, cta_label: ctaLabel, cta_href: ctaHref, focus };
  const fieldErrors: Partial<Record<BannerField, string>> = {};

  if (!title) fieldErrors.title = "Enter a heading — it is also the image's alt text.";
  // Internal paths, or a full https link. Anything else (javascript:, mailto:…)
  // has no business on a homepage button.
  if (!/^\/(?!\/)/.test(ctaHref) && !/^https:\/\//.test(ctaHref)) {
    fieldErrors.cta_href = "Use a store path like /collections/rings, or a full https:// link.";
  }

  if (Object.keys(fieldErrors).length) {
    return { error: "Could not save. Please fix the fields marked below.", fieldErrors, values };
  }

  const db = getSupabaseAdmin();

  let previous: { desktop_src: string | null; mobile_src: string | null } | null = null;
  if (original !== null) {
    const { data } = await db
      .from("hero_slides")
      .select("desktop_src, mobile_src")
      .eq("position", original)
      .maybeSingle();
    if (!data) return { error: "That banner no longer exists. Go back to the list and try again.", values };
    previous = data;
  }

  const [desktop, mobile] = await Promise.all([
    resolveImage(form, "desktop"),
    resolveImage(form, "mobile"),
  ]);

  if (desktop.error || mobile.error || !desktop.url) {
    // Don't leave a freshly uploaded file orphaned when the save is refused.
    await Promise.all([
      desktop.uploaded ? removeUpload(desktop.url) : null,
      mobile.uploaded ? removeUpload(mobile.url) : null,
    ]);
    return {
      error: "Could not save.",
      fieldErrors: {
        desktop: desktop.error ?? (desktop.url ? undefined : "Add the banner image."),
        mobile: mobile.error,
      },
      values,
    };
  }

  const fields = {
    title,
    eyebrow,
    body,
    cta_label: ctaLabel,
    cta_href: ctaHref,
    desktop_src: desktop.url,
    mobile_src: mobile.url || null,
    focus,
    mobile_focus: null,
    active,
  };

  let error;
  if (original !== null) {
    ({ error } = await db.from("hero_slides").update(fields).eq("position", original));
  } else {
    const { data: last } = await db
      .from("hero_slides")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    ({ error } = await db.from("hero_slides").insert({ position: (last?.position ?? -1) + 1, ...fields }));
  }

  if (error) {
    console.error("[admin] banner save failed:", error.message);
    return { error: `Could not save: ${error.message}`, values };
  }

  // Replaced or removed art: clear the old file out of storage.
  if (previous) {
    await Promise.all([
      previous.desktop_src !== fields.desktop_src ? removeUpload(previous.desktop_src) : null,
      previous.mobile_src !== fields.mobile_src ? removeUpload(previous.mobile_src) : null,
    ]);
  }

  revalidateBanners();
  redirect("/admin/banners");
}

export async function deleteBanner(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const position = Number(form.get("position"));
  if (!Number.isInteger(position)) return;

  const db = getSupabaseAdmin();
  const { data } = await db
    .from("hero_slides")
    .delete()
    .eq("position", position)
    .select("desktop_src, mobile_src")
    .maybeSingle();

  if (data) await Promise.all([removeUpload(data.desktop_src), removeUpload(data.mobile_src)]);

  revalidateBanners();
  redirect("/admin/banners");
}

export async function toggleBanner(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const position = Number(form.get("position"));
  if (!Number.isInteger(position)) return;

  const active = form.get("active") === "true";
  const { error } = await getSupabaseAdmin()
    .from("hero_slides")
    .update({ active: !active })
    .eq("position", position);
  if (error) console.error("[admin] banner toggle failed:", error.message);

  revalidateBanners();
}

/**
 * Swaps a banner with its neighbour. Position is the primary key, so the swap
 * parks one row on a temporary position first to avoid a clash.
 */
export async function moveBanner(form: FormData): Promise<void> {
  if (!(await isAdmin())) return;

  const position = Number(form.get("position"));
  const direction = form.get("direction") === "up" ? "up" : "down";
  if (!Number.isInteger(position)) return;

  const db = getSupabaseAdmin();
  const { data: neighbour } = await db
    .from("hero_slides")
    .select("position")
    .filter("position", direction === "up" ? "lt" : "gt", position)
    .order("position", { ascending: direction !== "up" })
    .limit(1)
    .maybeSingle();

  if (!neighbour) return;

  const PARKED = -32768;
  const steps = [
    () => db.from("hero_slides").update({ position: PARKED }).eq("position", position),
    () => db.from("hero_slides").update({ position }).eq("position", neighbour.position),
    () => db.from("hero_slides").update({ position: neighbour.position }).eq("position", PARKED),
  ];
  for (const step of steps) {
    const { error } = await step();
    if (error) {
      console.error("[admin] banner reorder failed:", error.message);
      break;
    }
  }

  revalidateBanners();
}

/** Copies the built-in banners into the table so they become editable. */
export async function importDefaultBanners(): Promise<void> {
  if (!(await isAdmin())) return;

  const db = getSupabaseAdmin();
  const { count } = await db.from("hero_slides").select("position", { count: "exact", head: true });
  if (count) return;

  const { error } = await db.from("hero_slides").insert(
    heroSlides.map((s, i) => ({
      position: i,
      eyebrow: s.eyebrow,
      title: s.title,
      body: s.text,
      cta_label: s.cta.label,
      cta_href: s.cta.href,
      desktop_src: s.desktopSrc ?? null,
      mobile_src: s.mobileSrc ?? null,
      focus: s.focus ?? null,
      mobile_focus: null,
      active: true,
    })),
  );
  if (error) console.error("[admin] banner import failed:", error.message);

  revalidateBanners();
}
