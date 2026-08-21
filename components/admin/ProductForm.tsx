"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { saveProduct, type ProductFormState } from "@/app/admin/products/actions";
import { IMAGE_ACCEPT, IMAGE_SLOTS } from "@/lib/productImages";
import type { Collection, Product } from "@/lib/types";

const BADGES = ["", "NEW", "BESTSELLER", "LIMITED"] as const;

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

  const tagged = new Set(product?.collections ?? []);
  const categories = collections.filter((c) => c.group === "category");

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <input type="hidden" name="original_handle" value={product?.handle ?? ""} />

      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {state.error}
        </p>
      ) : null}

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="title" label="Title" defaultValue={value("title", product?.title)} />
          <Field
            name="handle"
            label="Handle (URL)"
            defaultValue={value("handle", product?.handle)}
            hint="Lowercase words joined by hyphens. Changing it changes the product URL."
          />
        </div>

        <Textarea
          name="description"
          label="Description"
          rows={6}
          defaultValue={value("description", product?.description)}
        />
      </Section>

      <Section title="Images" hint={`Up to ${IMAGE_SLOTS}. The first is used on product cards.`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: IMAGE_SLOTS }, (_, slot) => (
            <ImageSlot key={slot} slot={slot} existing={product?.images?.[slot]} />
          ))}
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field
            name="price"
            label="Price (₹)"
            type="number"
            step="0.01"
            defaultValue={value("price", product?.price)}
          />
          <Field
            name="compare_at"
            label="Compare at (₹)"
            type="number"
            step="0.01"
            required={false}
            defaultValue={value("compare_at", product?.compareAt)}
            hint="Struck-through price. Leave blank for none."
          />
          <Field
            name="rating"
            label="Rating"
            type="number"
            step="0.1"
            required={false}
            defaultValue={value("rating", product?.rating ?? 0)}
          />
          <Field
            name="reviews"
            label="Reviews"
            type="number"
            required={false}
            defaultValue={value("reviews", product?.reviews ?? 0)}
          />
        </div>
      </Section>

      <Section title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <Label>Category</Label>
            <select
              name="category"
              defaultValue={value("category", product?.category)}
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.handle} value={c.handle}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <Label>Badge</Label>
            <select
              name="badge"
              defaultValue={value("badge", product?.badge)}
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            >
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b || "None"}
                </option>
              ))}
            </select>
          </label>

          <Field
            name="material"
            label="Material"
            required={false}
            defaultValue={value("material", product?.material)}
          />
          <Field
            name="weight"
            label="Weight"
            required={false}
            defaultValue={value("weight", product?.weight)}
            hint="Used for the Shiprocket delivery estimate, e.g. 5 g."
          />
          <Field
            name="variant_label"
            label="Variant label"
            required={false}
            defaultValue={value("variant_label", product?.variants?.label)}
            hint="e.g. Ring Size"
          />
          <Field
            name="variant_options"
            label="Variant options"
            required={false}
            defaultValue={value("variant_options", product?.variants?.options.join(", "))}
            hint="Comma separated. Leave blank for no variants."
          />
          <Field
            name="sort_order"
            label="Sort order"
            type="number"
            required={false}
            defaultValue={value("sort_order", 0)}
            hint="Lower shows first."
          />
        </div>

        <label className="flex items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="sold_out"
            defaultChecked={product?.soldOut ?? false}
            className="h-4 w-4 accent-ink"
          />
          Sold out
        </label>
      </Section>

      <Section title="Collections" hint="Budget and gift groupings are worked out automatically.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
      </Section>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Submit label={product ? "Save changes" : "Create product"} />
        <Link href="/admin/products" className="text-[13px] text-muted underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

/**
 * One image slot.
 *
 * The current URL rides along in a hidden input so a submit that touches no
 * files keeps the existing photo; clearing that input is what deletes it.
 */
function ImageSlot({ slot, existing }: { slot: number; existing?: string }) {
  const [url, setUrl] = useState(existing ?? "");
  const [preview, setPreview] = useState<string | null>(null);

  const shown = preview ?? url;

  return (
    <div className="space-y-2">
      <input type="hidden" name={`image_url_${slot}`} value={url} />

      <div className="relative aspect-square overflow-hidden border border-line bg-sand">
        {shown ? (
          <Image src={shown} alt="" fill sizes="200px" className="object-cover" unoptimized={Boolean(preview)} />
        ) : (
          <span className="flex h-full items-center justify-center text-[11px] text-muted">
            {slot === 0 ? "Card image" : `Image ${slot + 1}`}
          </span>
        )}

        {shown ? (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setPreview(null);
            }}
            aria-label={`Remove image ${slot + 1}`}
            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-cream"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-line py-2 text-[11px] transition-colors hover:border-gold">
        <Upload className="h-3 w-3" />
        {shown ? "Replace" : "Upload"}
        <input
          type="file"
          name={`image_${slot}`}
          accept={IMAGE_ACCEPT}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            // Local preview only — the file itself is uploaded on submit.
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="hidden"
        />
      </label>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-[11px] font-semibold tracking-[0.16em] uppercase">{title}</legend>
      {hint ? <p className="text-[12px] text-muted">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

function Field({
  name,
  label,
  hint,
  required = true,
  ...rest
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        name={name}
        required={required}
        className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
        {...rest}
      />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

function Textarea({
  name,
  label,
  ...rest
}: { name: string; label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        name={name}
        className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
        {...rest}
      />
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
