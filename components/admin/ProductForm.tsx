"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { saveProduct, type ProductFormState } from "@/app/admin/products/actions";
import {
  IMAGE_ACCEPT,
  IMAGE_SLOTS,
  MAX_IMAGE_BYTES,
  RESIZE_ABOVE_BYTES,
  RESIZE_MAX_EDGE,
} from "@/lib/productImages";
import { shrinkImage } from "@/lib/shrinkImage";
import { PARCEL, PRODUCT_WEIGHT } from "@/lib/parcel";
import { slugify } from "@/lib/slug";
import { TRENDING_LIMIT } from "@/lib/trending";
import type { Collection, Product } from "@/lib/types";

const BADGES = ["", "NEW", "BESTSELLER", "LIMITED"] as const;

/**
 * Add or edit a product.
 *
 * Two things are never typed in here: the web address, which follows the name,
 * and the rating, which a new product is given between 4 and 5. The parcel size
 * is fixed for every piece. Everything else is a field.
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
  const categories = collections.filter((c) => c.group === "category");

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

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="price"
            label="Price (₹)"
            inputMode="decimal"
            defaultValue={value("price", product?.price)}
            error={error.price}
            hint="Rupees only, e.g. 2499"
          />
          <Field
            name="compare_at"
            label="Compare at (₹)"
            inputMode="decimal"
            defaultValue={value("compare_at", product?.compareAt)}
            error={error.compare_at}
            hint="The struck-through price. Blank for none."
          />
        </div>

        <div>
          <Label>Photos</Label>
          <p className="-mt-0.5 mb-2 text-[11px] text-muted">
            Up to {IMAGE_SLOTS}. The first one is what product cards show.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: IMAGE_SLOTS }, (_, slot) => (
              <PhotoField
                key={slot}
                slot={slot}
                existing={product?.images?.[slot]}
                error={state.imageSlot === slot ? error.image : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <fieldset className="space-y-5 border-t border-line pt-6">
        <legend className="text-[11px] font-semibold tracking-[0.16em] uppercase">Details</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <Label>Category</Label>
            <select
              name="category"
              defaultValue={value("category", product?.category)}
              className={inputClass()}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.handle} value={c.handle}>
                  {c.title}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-muted">
              Shows in the Details table and drives “related products”.
            </span>
          </label>

          <label className="block">
            <Label>Badge</Label>
            <select
              name="badge"
              defaultValue={value("badge", product?.badge)}
              className={inputClass()}
            >
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || "None"}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-muted">
              The corner label on the product card.
            </span>
          </label>

          <Field
            name="material"
            label="Material"
            defaultValue={value("material", product?.material)}
            hint="e.g. 925 Sterling Silver, Matte finish"
          />
          <Field
            name="weight"
            label="Weight"
            defaultValue={value("weight", product?.weight ?? PRODUCT_WEIGHT)}
            hint="e.g. 2.9 g. Used for the delivery estimate too."
          />

          <Field
            name="variant_label"
            label="Variant label"
            defaultValue={value("variant_label", product?.variants?.label)}
            hint="e.g. Ring Size"
          />
          <Field
            name="variant_options"
            label="Variant options"
            defaultValue={value("variant_options", product?.variants?.options.join(", "))}
            hint="Comma separated: 12, 14, 16. Blank for no picker."
          />

          <Field
            name="sort_order"
            label="Position"
            type="number"
            defaultValue={value("sort_order", product?.sortOrder ?? 0)}
            hint="Lower shows first, in listings and the Trending row."
          />
        </div>

        <label className="flex items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="sold_out"
            defaultChecked={product?.soldOut ?? false}
            className="h-4 w-4 shrink-0 accent-ink"
          />
          Sold out
        </label>
      </fieldset>

      {/* One tick-box, not an ordered list: the homepage row takes the first
          TRENDING_LIMIT in sort order, so nobody has to keep a numbered list in
          their head. */}
      <label className="flex items-start gap-2.5 border-t border-line pt-6 text-[13px]">
        <input
          type="checkbox"
          name="trending"
          defaultChecked={product?.trending ?? false}
          className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
        />
        <span>
          Show in <strong className="font-semibold">Top {TRENDING_LIMIT} Trending Products</strong>{" "}
          on the homepage
          <span className="mt-0.5 block text-[11px] text-muted">
            The row holds {TRENDING_LIMIT}; beyond that the extras wait their turn.
          </span>
        </span>
      </label>

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
        Parcel size ({PARCEL.lengthCm}×{PARCEL.breadthCm}×{PARCEL.heightCm} cm) is the same for
        every piece, so it is not asked for here.
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
function PhotoField({
  slot,
  existing,
  error,
}: {
  slot: number;
  existing?: string;
  error?: string;
}) {
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
      const usable = file.size > RESIZE_ABOVE_BYTES ? ((await shrinkImage(file, RESIZE_MAX_EDGE)) ?? file) : file;

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
    <div className="space-y-2">
      <input type="hidden" name={`image_url_${slot}`} value={url} />

      <div
        className={`relative aspect-square overflow-hidden border bg-sand ${
          message ? "border-red-300" : "border-line"
        }`}
      >
        {shown ? (
          <Image
            src={shown}
            alt=""
            fill
            sizes="200px"
            className="object-cover"
            unoptimized={Boolean(preview)}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-muted">
            {slot === 0 ? "Card photo" : `Photo ${slot + 1}`}
          </span>
        )}

        {shown ? (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setPreview(null);
            }}
            aria-label={`Remove photo ${slot + 1}`}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-cream"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-line py-2 text-[11px] transition-colors hover:border-gold">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
        {busy ? "Preparing…" : shown ? "Replace" : "Upload"}
        <input
          type="file"
          name={`image_${slot}`}
          accept={IMAGE_ACCEPT}
          onChange={(e) => pick(e.currentTarget)}
          className="hidden"
        />
      </label>

      <FieldError message={message} />
    </div>
  );
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
