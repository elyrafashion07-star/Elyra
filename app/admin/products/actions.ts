"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { imageProblem, removeFolder, uploadImage } from "@/lib/adminUpload";
import { IMAGE_SLOTS } from "@/lib/productImages";
import { newRating } from "@/lib/rating";
import { slugify } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

/** Which input a message belongs under. */
export type ProductField = "title" | "description" | "price" | "compare_at" | "image";

export type ProductFormState = {
  /** Shown once at the top of the form. */
  error?: string;
  /** Shown under the input it names, so the wrong field is obvious. */
  fieldErrors?: Partial<Record<ProductField, string>>;
  /** Which photo the `image` message belongs to. */
  imageSlot?: number;
  /** Echoed back so a rejected submit does not empty the form. */
  values?: Record<string, string>;
};

const BUCKET = "product-images";

/**
 * Every action here re-checks the role server-side.
 *
 * app/admin/layout.tsx already gates the pages, but a server action is a public
 * HTTP endpoint — it can be invoked directly, without ever rendering the layout
 * that guards it. The layout protects the *view*; this protects the *write*.
 */
async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}

/**
 * Returns `base`, or the first `base-2`, `base-3`… no product holds yet.
 *
 * Handles are generated from titles, so two products both called "Silver Ring"
 * would otherwise land on the same row and the second would quietly overwrite
 * the first.
 */
async function freeHandle(base: string): Promise<string> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("products").select("handle").like("handle", `${base}%`);

  const taken = new Set((data ?? []).map((row) => row.handle));
  if (!taken.has(base)) return base;

  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Creates or updates a product.
 *
 * Two things are never typed in: the URL, which comes from the name, and the
 * rating, which a new product is given between 4 and 5. Everything else is on
 * the form.
 *
 * The photo is uploaded only once the rest of the form is known good: uploading
 * first would leave an orphaned file in the bucket every time a field was
 * rejected.
 */
export async function saveProduct(
  _prev: ProductFormState,
  form: FormData,
): Promise<ProductFormState> {
  if (!(await requireAdmin())) return { error: "You do not have permission to do that." };

  /** Set when editing; the handle of the row being changed. */
  const original = String(form.get("original_handle") ?? "").trim();

  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const compareRaw = String(form.get("compare_at") ?? "").trim();

  const text = (key: string) => String(form.get(key) ?? "").trim();
  const category = text("category");
  const badge = text("badge");
  const material = text("material");
  const weight = text("weight");
  const variantLabel = text("variant_label");
  const variantOptionsRaw = text("variant_options");
  const sortRaw = text("sort_order");

  const values = {
    title,
    description,
    price: priceRaw,
    compare_at: compareRaw,
    category,
    badge,
    material,
    weight,
    variant_label: variantLabel,
    variant_options: variantOptionsRaw,
    sort_order: sortRaw,
  };

  // Every field is checked before anything is returned, so one submit reports
  // all of its problems instead of one per attempt.
  const fieldErrors: Partial<Record<ProductField, string>> = {};

  if (!title) fieldErrors.title = "Enter the product name.";
  else if (!original && !slugify(title)) {
    fieldErrors.title =
      "The name needs at least one English letter or number — the web address is built from it.";
  }

  if (!description) {
    fieldErrors.description = "Write a short description — this is what the product page shows.";
  }

  const price = Number(priceRaw);
  if (!priceRaw) fieldErrors.price = "Enter the price in rupees.";
  else if (!Number.isFinite(price)) {
    fieldErrors.price = `“${priceRaw}” is not a number. Enter rupees only, like 2499.`;
  } else if (price <= 0) fieldErrors.price = "Price must be more than ₹0.";

  const compareAt = compareRaw ? Number(compareRaw) : null;
  if (compareRaw && !Number.isFinite(compareAt)) {
    fieldErrors.compare_at = `“${compareRaw}” is not a number. Enter rupees only, or leave it blank.`;
  } else if (compareAt !== null && Number.isFinite(price) && compareAt <= price) {
    fieldErrors.compare_at = "The struck-through price has to be higher than the price itself.";
  }

  // A picked file replaces that slot's photo; the existing URL rides along in a
  // hidden input, so a save that touches no file keeps what is already there.
  const slots = Array.from({ length: IMAGE_SLOTS }, (_, slot) => {
    const file = form.get(`image_${slot}`);
    return {
      slot,
      picked: file instanceof File && file.size > 0 ? file : null,
      existing: String(form.get(`image_url_${slot}`) ?? "").trim(),
    };
  });

  let imageSlot: number | undefined;
  for (const { slot, picked } of slots) {
    const problem = picked ? imageProblem(picked) : null;
    if (problem) {
      fieldErrors.image = problem;
      imageSlot = slot;
      break;
    }
  }

  if (!fieldErrors.image && !slots.some((s) => s.picked || s.existing)) {
    fieldErrors.image = "Add at least one photo.";
    imageSlot = 0;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      error: "Could not save. Please fix the fields marked below.",
      fieldErrors,
      imageSlot,
      values,
    };
  }

  const handle = original || (await freeHandle(slugify(title)));

  // Gaps are closed on the way in: leaving slot 2 empty and slot 3 filled must
  // not push an undefined into the array the storefront maps over.
  const images: string[] = [];
  for (const { slot, picked, existing } of slots) {
    if (picked) {
      const uploaded = await uploadImage(BUCKET, handle, picked);
      if (!uploaded) {
        return {
          error: "Could not save.",
          fieldErrors: { image: "The photo failed to upload. Please try again." },
          imageSlot: slot,
          values,
        };
      }
      images.push(uploaded);
    } else if (existing) {
      images.push(existing);
    }
  }

  const db = getSupabaseAdmin();

  // Blank means "no variants", not "a variant with no options" — a label on its
  // own would render an empty picker on the product page.
  const variantOptions = variantOptionsRaw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const sortOrder = Number(sortRaw);

  const fields = {
    title,
    description,
    price,
    compare_at: compareAt,
    category: category || null,
    badge: (badge || null) as "NEW" | "BESTSELLER" | "LIMITED" | null,
    material: material || null,
    weight: weight || null,
    variant_label: variantOptions.length ? variantLabel || null : null,
    variant_options: variantOptions.length ? variantOptions : null,
    sold_out: form.get("sold_out") === "on",
    sort_order: sortRaw && Number.isFinite(sortOrder) ? sortOrder : 0,
    trending: form.get("trending") === "on",
    images,
    // Kept in step with the real images so nothing renders empty slots.
    gallery: Math.max(images.length, 1),
  };

  // An edit is an update, not an upsert: the handle is left alone, because the
  // URL is already published and should not move because someone fixed a typo
  // in the name. Rating is set once, at insert — see lib/rating.ts.
  const { error } = original
    ? await db.from("products").update(fields).eq("handle", original)
    : await db.from("products").insert({ handle, rating: newRating(), ...fields });

  if (error) {
    console.error("[admin] product save failed:", error.message);
    return { error: `Could not save: ${error.message}`, values };
  }

  // Collection tags are a full replace — unticking a box has to remove the row.
  const tags = form.getAll("collections").map(String).filter(Boolean);
  await db.from("product_collections").delete().eq("product_handle", handle);
  if (tags.length) {
    await db
      .from("product_collections")
      .insert(tags.map((collection_handle) => ({ product_handle: handle, collection_handle })));
  }

  revalidateStorefront(handle);
  redirect("/admin/products");
}

export async function deleteProduct(form: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const handle = String(form.get("handle") ?? "").trim();
  if (!handle) return;

  const db = getSupabaseAdmin();

  // Storage is not cascaded by the database — remove the folder too, or the
  // files sit there paying for themselves forever.
  await removeFolder(BUCKET, handle);

  // order_items snapshot their own copy of title and price, so past orders are
  // unaffected by this — see 0004_orders.sql.
  const { error } = await db.from("products").delete().eq("handle", handle);
  if (error) console.error("[admin] product delete failed:", error.message);

  revalidateStorefront(handle);
  redirect("/admin/products");
}

/**
 * The storefront statically renders product and collection pages, so a save is
 * invisible until those are rebuilt. Collection pages are membership-derived and
 * there is no cheap way to know which ones changed, so the whole layout is
 * revalidated.
 */
function revalidateStorefront(handle: string): void {
  revalidatePath(`/products/${handle}`);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}
