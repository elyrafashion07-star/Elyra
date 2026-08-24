"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ALLOWED_IMAGE_TYPES, IMAGE_SLOTS, MAX_IMAGE_BYTES } from "@/lib/productImages";
import { HANDLE_PATTERN, slugify } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

export type ProductFormState = {
  error?: string;
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

function number(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Returns `base`, or the first `base-2`, `base-3`… that no other product holds.
 *
 * Handles are generated from titles, so two products called "Silver Ring" would
 * otherwise land on the same row and the second save would quietly overwrite the
 * first — upsert has no way to tell a rename from a collision. `original` is the
 * handle being edited, which does not count as taken against itself.
 */
async function freeHandle(base: string, original: string): Promise<string> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("products").select("handle").like("handle", `${base}%`);

  const taken = new Set(
    (data ?? []).map((row) => row.handle).filter((h) => h !== original),
  );
  if (!taken.has(base)) return base;

  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Creates or updates a product, uploading any newly picked images along the way.
 *
 * Images and fields are saved in the same submit on purpose: uploading first and
 * saving second would leave orphaned files in the bucket whenever validation
 * rejected the form.
 */
export async function saveProduct(
  _prev: ProductFormState,
  form: FormData,
): Promise<ProductFormState> {
  if (!(await requireAdmin())) return { error: "You do not have permission to do that." };

  const original = String(form.get("original_handle") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const price = number(form, "price");

  // Left blank, the URL is written from the title — the form does the same as
  // you type, so this covers a submit that never reached the handle field.
  const typed = String(form.get("handle") ?? "")
    .trim()
    .toLowerCase();
  const base = typed || slugify(title);

  const values: Record<string, string> = {
    handle: base,
    title,
    price: String(form.get("price") ?? ""),
    compare_at: String(form.get("compare_at") ?? ""),
    category: String(form.get("category") ?? ""),
    description: String(form.get("description") ?? ""),
    material: String(form.get("material") ?? ""),
    weight: String(form.get("weight") ?? ""),
    variant_label: String(form.get("variant_label") ?? ""),
    variant_options: String(form.get("variant_options") ?? ""),
    badge: String(form.get("badge") ?? ""),
    sort_order: String(form.get("sort_order") ?? ""),
  };

  if (!title) return { error: "Enter a title.", values };
  if (!HANDLE_PATTERN.test(base)) {
    return {
      error: typed
        ? "Handle must be lowercase words joined by hyphens, e.g. twin-strings-silver-ring."
        : "Could not build a URL from that title — type a handle like twin-strings-silver-ring.",
      values,
    };
  }
  if (price === null || price < 0) return { error: "Enter a valid price in rupees.", values };

  const compareAt = number(form, "compare_at");
  if (compareAt !== null && compareAt < price) {
    return { error: "Compare-at price must be higher than the price, or left blank.", values };
  }

  // Settled last, so images upload under the handle the row is actually saved
  // with and nothing is left in a folder no product points at.
  const handle = await freeHandle(base, original);

  // Existing URLs ride along in hidden inputs; a picked file replaces the slot.
  const images: string[] = [];
  for (let slot = 0; slot < IMAGE_SLOTS; slot += 1) {
    const file = form.get(`image_${slot}`);
    const existing = String(form.get(`image_url_${slot}`) ?? "").trim();

    if (file instanceof File && file.size > 0) {
      const url = await uploadImage(handle, file);
      if (!url) {
        return {
          error: `Image ${slot + 1} was rejected — use a JPG, PNG, WebP or AVIF under 5 MB.`,
          values,
        };
      }
      images.push(url);
    } else if (existing) {
      images.push(existing);
    }
  }

  const variantOptions = values.variant_options
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const db = getSupabaseAdmin();

  const { error } = await db.from("products").upsert(
    {
      handle,
      title,
      price,
      compare_at: compareAt,
      rating: number(form, "rating") ?? 0,
      reviews: number(form, "reviews") ?? 0,
      category: values.category || null,
      description: values.description,
      material: values.material || null,
      weight: values.weight || null,
      variant_label: variantOptions.length ? values.variant_label || null : null,
      variant_options: variantOptions.length ? variantOptions : null,
      badge: (values.badge || null) as "NEW" | "BESTSELLER" | "LIMITED" | null,
      sold_out: form.get("sold_out") === "on",
      images,
      // Kept in step with the real images so nothing renders empty slots.
      gallery: Math.max(images.length, 1),
      sort_order: number(form, "sort_order") ?? 0,
    },
    { onConflict: "handle" },
  );

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

  // Renaming the handle leaves the old row behind, so clear it out.
  if (original && original !== handle) {
    await db.from("products").delete().eq("handle", original);
    revalidatePath(`/products/${original}`);
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
