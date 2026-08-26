"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/productImages";
import { PRODUCT_WEIGHT } from "@/lib/parcel";
import { slugify } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

/** Which input a message belongs under. */
export type ProductField = "title" | "description" | "price" | "image";

export type ProductFormState = {
  /** Shown once at the top of the form. */
  error?: string;
  /** Shown under the input it names, so the wrong field is obvious. */
  fieldErrors?: Partial<Record<ProductField, string>>;
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

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

/**
 * Uploads one file and returns its public URL.
 *
 * Names are `<handle>/<uuid>.<ext>` rather than `<handle>/<slot>.<ext>`: reusing
 * a path would leave the CDN serving the previous photo from cache long after it
 * was replaced.
 */
async function uploadImage(handle: string, file: File): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return null;
  if (file.size > MAX_IMAGE_BYTES) return null;

  const db = getSupabaseAdmin();
  const path = `${handle}/${randomUUID()}.${extensionFor(file.type)}`;

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[admin] image upload failed:", error.message);
    return null;
  }

  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
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
 * Creates or updates a product from what the form asks for: name, description,
 * price, one photo, and the collections it belongs to.
 *
 * Everything else is filled in here — the URL from the name, the weight from
 * lib/parcel.ts, and the rest from the column defaults — so there is nothing to
 * get wrong while adding a product.
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

  const values = { title, description, price: priceRaw };

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

  // A picked file replaces the photo; the existing URL rides along in a hidden
  // input so a save that touches no file keeps it.
  const file = form.get("image_0");
  const picked = file instanceof File && file.size > 0 ? file : null;
  const existing = String(form.get("image_url_0") ?? "").trim();

  if (picked && !ALLOWED_IMAGE_TYPES.includes(picked.type)) {
    fieldErrors.image = "That file is not a usable image — pick a JPG, PNG, WebP or AVIF.";
  } else if (picked && picked.size > MAX_IMAGE_BYTES) {
    const mb = (picked.size / 1024 / 1024).toFixed(1);
    fieldErrors.image = `That photo is ${mb} MB. The limit is 5 MB — use a smaller one.`;
  } else if (!picked && !existing) {
    fieldErrors.image = "Add one product photo.";
  }

  if (Object.keys(fieldErrors).length) {
    return { error: "Could not save. Please fix the fields marked below.", fieldErrors, values };
  }

  const handle = original || (await freeHandle(slugify(title)));

  let image = existing;
  if (picked) {
    const uploaded = await uploadImage(handle, picked);
    if (!uploaded) {
      return {
        error: "Could not save.",
        fieldErrors: { image: "The photo failed to upload. Please try again." },
        values,
      };
    }
    image = uploaded;
  }

  const db = getSupabaseAdmin();

  const fields = {
    title,
    description,
    price,
    images: [image],
    // Kept in step with the real images so nothing renders empty slots.
    gallery: 1,
  };

  // An edit is an update, not an upsert. The form no longer carries category,
  // material, badge or variants, and an upsert would blank every column it does
  // not send — wiping details this form cannot even show. For the same reason
  // the handle is left alone on an edit: the URL is already published, and it
  // should not move because someone fixed a typo in the name.
  const { error } = original
    ? await db.from("products").update(fields).eq("handle", original)
    : await db.from("products").insert({ handle, weight: PRODUCT_WEIGHT, ...fields });

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

  // Storage is not cascaded by the database — list and remove the folder too, or
  // the files sit there paying for themselves forever.
  const { data: files } = await db.storage.from(BUCKET).list(handle);
  if (files?.length) {
    await db.storage.from(BUCKET).remove(files.map((f) => `${handle}/${f.name}`));
  }

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
