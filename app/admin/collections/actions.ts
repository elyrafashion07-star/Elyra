"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { imageProblem, removeFolder, uploadImage } from "@/lib/adminUpload";
import { GROUPS, NEEDS_IMAGE } from "@/lib/collectionGroups";
import { slugify } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";
import type { Collection } from "@/lib/types";

export type CollectionField = "title" | "group" | "description" | "image";

export type CollectionFormState = {
  error?: string;
  fieldErrors?: Partial<Record<CollectionField, string>>;
  values?: Record<string, string>;
};

const BUCKET = "collection-images";

/** Server actions are public endpoints — the role is re-checked on every write. */
async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}

/** Returns `base`, or the first `base-2`, `base-3`… no collection holds yet. */
async function freeHandle(base: string): Promise<string> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("collections").select("handle").like("handle", `${base}%`);
  const taken = new Set((data ?? []).map((row) => row.handle));
  if (!taken.has(base)) return base;

  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Creates or updates a collection.
 *
 * The web address comes from the name, exactly as it does for a product, and an
 * existing collection keeps the one it was given — products are tagged by that
 * handle, so changing it would untag every one of them.
 */
export async function saveCollection(
  _prev: CollectionFormState,
  form: FormData,
): Promise<CollectionFormState> {
  if (!(await requireAdmin())) return { error: "You do not have permission to do that." };

  const original = String(form.get("original_handle") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const group = String(form.get("group") ?? "").trim() as Collection["group"];
  const sortRaw = String(form.get("sort_order") ?? "").trim();

  const values = { title, description, group, sort_order: sortRaw };
  const fieldErrors: Partial<Record<CollectionField, string>> = {};

  if (!title) fieldErrors.title = "Enter a name.";
  else if (!original && !slugify(title)) {
    fieldErrors.title =
      "The name needs at least one English letter or number — the web address is built from it.";
  }

  if (!GROUPS.some((g) => g.value === group)) fieldErrors.group = "Choose where this belongs.";

  const file = form.get("image");
  const picked = file instanceof File && file.size > 0 ? file : null;
  const existing = String(form.get("image_url") ?? "").trim();

  const problem = picked ? imageProblem(picked) : null;
  if (problem) fieldErrors.image = problem;

  // A tile with no picture renders a grey placeholder, which looks worse than
  // not being on the homepage at all.
  const onHome = form.get("show_on_home") === "on";
  if (!problem && onHome && NEEDS_IMAGE.includes(group) && !picked && !existing) {
    fieldErrors.image = "Add a photo, or untick “Show on the homepage” — the tile needs artwork.";
  }

  if (Object.keys(fieldErrors).length) {
    return { error: "Could not save. Please fix the fields marked below.", fieldErrors, values };
  }

  const handle = original || (await freeHandle(slugify(title)));

  let image = existing;
  if (picked) {
    const uploaded = await uploadImage(BUCKET, handle, picked);
    if (!uploaded) {
      return {
        error: "Could not save.",
        fieldErrors: { image: "The photo failed to upload. Please try again." },
        values,
      };
    }
    image = uploaded;
  }

  const sortOrder = Number(sortRaw);
  const fields = {
    title,
    description,
    group,
    image: image || null,
    show_on_home: onHome,
    sort_order: sortRaw && Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const db = getSupabaseAdmin();
  const { error } = original
    ? await db.from("collections").update(fields).eq("handle", original)
    : await db.from("collections").insert({ handle, ...fields });

  if (error) {
    console.error("[admin] collection save failed:", error.message);
    return { error: `Could not save: ${error.message}`, values };
  }

  revalidateStorefront(handle);
  redirect("/admin/collections");
}

/**
 * Deletes a collection.
 *
 * product_collections cascades, so tagged products simply lose the tag, and the
 * products.category column is `on delete set null` — nothing is orphaned.
 */
export async function deleteCollection(form: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const handle = String(form.get("handle") ?? "").trim();
  if (!handle) return;

  await removeFolder(BUCKET, handle);

  const { error } = await getSupabaseAdmin().from("collections").delete().eq("handle", handle);
  if (error) console.error("[admin] collection delete failed:", error.message);

  revalidateStorefront(handle);
  redirect("/admin/collections");
}

/** The homepage, the menu and every collection page are statically rendered. */
function revalidateStorefront(handle: string): void {
  revalidatePath(`/collections/${handle}`);
  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
}
