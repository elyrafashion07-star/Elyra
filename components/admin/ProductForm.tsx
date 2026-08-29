"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { saveProduct, type ProductFormState } from "@/app/admin/products/actions";
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  RESIZE_ABOVE_BYTES,
  RESIZE_MAX_EDGE,
} from "@/lib/productImages";
import { PARCEL, PRODUCT_WEIGHT } from "@/lib/parcel";
import { slugify } from "@/lib/slug";
import type { Collection, Product } from "@/lib/types";

/**
 * Add or edit a product.
 *
 * Four fields to fill in, on purpose: name, description, price, one photo. The
 * web address, the weight and the box size are worked out for you, and anything
 * else a product row can hold keeps whatever it already had.
 *
 * The collection tick-boxes are the exception — nothing can guess where a piece
 * belongs, and an untagged product only shows up under "All".
 */
export default function ProductForm({
  product,
  collections,
}: {
  /** Absent when creating. */
  product?: Product;
  collections: Collection[];
}) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(saveProduct, {});

  const value = (key: string, fallback: string | number | undefined) =>
    state.values?.[key] ?? (fallback == null ? "" : String(fallback));

  // Only so the URL can be previewed as it is typed — the server derives the
  // real one from the name it receives.
  const [title, setTitle] = useState(value("title", product?.title));

  const error = state.fieldErrors ?? {};
  const tagged = new Set(product?.collections ?? []);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-8">
      <input type="hidden" name="original_handle" value={product?.handle ?? ""} />

      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-5">
        <Field
          name="title"
          label="Product name"
          defaultValue={value("title", product?.title)}
          onChange={(e) => setTitle(e.currentTarget.value)}
          error={error.title}
          hint={
            product
              ? `Web address stays /products/${product.handle}`
              : title.trim()
                ? `Web address: /products/${slugify(title) || "…"}`
                : "The web address is made from this name."
          }
        />

        <Textarea
          name="description"
          label="Description"
          rows={6}
          defaultValue={value("description", product?.description)}
          error={error.description}
        />

        <Field
          name="price"
          label="Price (₹)"
          inputMode="decimal"
          defaultValue={value("price", product?.price)}
          error={error.price}
          hint="Rupees only, e.g. 2499"
        />

        <PhotoField existing={product?.images?.[0]} error={error.image} />
      </div>

      {/* Budget groups are worked out from the price, so they are not offered. */}
      <fieldset className="space-y-3 border-t border-line pt-6">
        <legend className="text-[11px] font-semibold tracking-[0.16em] uppercase">
          Collections
        </legend>
        <p className="text-[12px] text-muted">
          Where this piece shows up on the store. Budget and gift groupings are worked out
          automatically.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {collections
            .filter((c) => c.group !== "budget")
            .map((c) => (
              <label key={c.handle} className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  name="collections"
                  value={c.handle}
                  defaultChecked={tagged.has(c.handle)}
                  className="h-4 w-4 shrink-0 accent-ink"
                />
                <span className="truncate">{c.title}</span>
              </label>
            ))}
        </div>
      </fieldset>

      <p className="border-t border-line pt-5 text-[12px] text-muted">
        Weight ({PRODUCT_WEIGHT}) and parcel size ({PARCEL.lengthCm}×{PARCEL.breadthCm}×
        {PARCEL.heightCm} cm) are set for you — the same for every piece.
      </p>

      <div className="flex items-center gap-4">
        <Submit label={product ? "Save changes" : "Create product"} />
        <Link href="/admin/products" className="text-[13px] text-muted underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

/**
 * The one product photo.
 *
 * The current URL rides along in a hidden input so a submit that touches no file
 * keeps the existing picture; clearing that input is what removes it.
 */
function PhotoField({ existing, error }: { existing?: string; error?: string }) {
  const [url, setUrl] = useState(existing ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const shown = preview ?? url;
  const message = localError ?? error;

  /**
   * Shrinks the picked photo before the form is ever submitted.
   *
   * A phone camera JPEG is several megabytes, and a server action rejects a
   * request body over a few MB outright — the save died with a server error
   * rather than anything this form could report. Resizing here means the upload
   * is a few hundred KB whatever the camera produced.
   */
  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    setLocalError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    setBusy(true);
    try {
      const usable = file.size > RESIZE_ABOVE_BYTES ? ((await shrink(file)) ?? file) : file;

      if (usable.size > MAX_IMAGE_BYTES) {
        input.value = "";
        setPreview(null);
        setLocalError(
          `That photo is ${(usable.size / 1024 / 1024).toFixed(1)} MB and could not be made smaller. Please pick a lighter one.`,
        );
        return;
      }

      // Put the smaller file back on the input — this is what gets submitted.
      if (usable !== file) {
        const box = new DataTransfer();
        box.items.add(usable);
        input.files = box.files;
      }

      setPreview(URL.createObjectURL(usable));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Label>Photo</Label>
      <input type="hidden" name="image_url_0" value={url} />

      <div className="flex items-start gap-4">
        <div
          className={`relative h-32 w-32 shrink-0 overflow-hidden border bg-sand ${
            message ? "border-red-300" : "border-line"
          }`}
        >
          {shown ? (
            <Image
              src={shown}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={Boolean(preview)}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[11px] text-muted">
              No photo
            </span>
          )}

          {shown ? (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setPreview(null);
              }}
              aria-label="Remove photo"
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-cream"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 border border-line px-4 py-2.5 text-[11px] transition-colors hover:border-gold">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {busy ? "Preparing…" : shown ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              name="image_0"
              accept={IMAGE_ACCEPT}
              onChange={(e) => pick(e.currentTarget)}
              className="hidden"
            />
          </label>
          <p className="text-[11px] text-muted">
            JPG, PNG, WebP or AVIF. Big photos are shrunk automatically.
          </p>
          <FieldError message={message} />
        </div>
      </div>
    </div>
  );
}

/**
 * Redraws an image at most RESIZE_MAX_EDGE across and re-encodes it as JPEG.
 *
 * Returns null if the browser cannot decode the file (an iPhone HEIC outside
 * Safari, say) — the caller then falls back to the original, and the size check
 * catches it.
 */
async function shrink(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, RESIZE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) return null;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

/** The message under an input that was rejected. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span role="alert" className="mt-1 block text-[12px] text-red-700">
      {message}
    </span>
  );
}

function inputClass(error?: string): string {
  return `w-full border bg-white px-4 py-3 text-sm outline-none ${
    error ? "border-red-300 focus:border-red-400" : "border-line focus:border-gold"
  }`;
}

function Field({
  name,
  label,
  hint,
  error,
  ...rest
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input name={name} aria-invalid={Boolean(error)} className={inputClass(error)} {...rest} />
      <FieldError message={error} />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

function Textarea({
  name,
  label,
  error,
  ...rest
}: { name: string; label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea name={name} aria-invalid={Boolean(error)} className={inputClass(error)} {...rest} />
      <FieldError message={error} />
    </label>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 bg-ink px-8 py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {pending ? "Saving…" : label}
    </button>
  );
}
