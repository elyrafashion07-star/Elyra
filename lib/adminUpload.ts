/**
 * Image uploads for the admin panel.
 *
 * Its own module so the product and collection actions share one implementation
 * — a `"use server"` file may only export async functions, so neither of them
 * can own a helper the other imports.
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/productImages";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

/** The message to show for a file the form should refuse, or null if it is fine. */
export function imageProblem(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "That file is not a usable image — pick a JPG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `That photo is ${mb} MB, which is too big to upload. Please pick a lighter one.`;
  }
  return null;
}

/**
 * Uploads one file and returns its public URL, or null if the upload failed.
 *
 * Names are `<folder>/<uuid>.<ext>` rather than `<folder>/<slot>.<ext>`: reusing
 * a path would leave the CDN serving the previous picture from cache long after
 * it was replaced.
 */
export async function uploadImage(
  bucket: string,
  folder: string,
  file: File,
): Promise<string | null> {
  const db = getSupabaseAdmin();
  const path = `${folder}/${randomUUID()}.${extensionFor(file.type)}`;

  const { error } = await db.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error(`[admin] upload to ${bucket} failed:`, error.message);
    return null;
  }

  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Removes everything an entry had stored under its own folder. */
export async function removeFolder(bucket: string, folder: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { data: files } = await db.storage.from(bucket).list(folder);
  if (files?.length) {
    await db.storage.from(bucket).remove(files.map((f) => `${folder}/${f.name}`));
  }
}
