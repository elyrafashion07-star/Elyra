"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { saveCollection, type CollectionFormState } from "@/app/admin/collections/actions";
import { GROUPS, NEEDS_IMAGE } from "@/lib/collectionGroups";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, RESIZE_ABOVE_BYTES, RESIZE_MAX_EDGE } from "@/lib/productImages";
import { shrinkImage } from "@/lib/shrinkImage";
import { slugify } from "@/lib/slug";
import type { Collection } from "@/lib/types";

/**
 * Add or edit a collection — a category, an occasion, a gifting tile.
 *
 * Whatever is created here shows up in its homepage section straight away, and a
 * category also becomes a tick-box on the product form, which is the whole point
 * of it being editable.
 */
export default function CollectionForm({ collection }: { collection?: Collection }) {
  const [state, formAction] = useActionState<CollectionFormState, FormData>(saveCollection, {});

  const value = (key: string, fallback: string | number | undefined) =>
    state.values?.[key] ?? (fallback == null ? "" : String(fallback));

  const [title, setTitle] = useState(value("title", collection?.title));
  const [group, setGroup] = useState<Collection["group"]>(
    (value("group", collection?.group) || "category") as Collection["group"],
  );

  const error = state.fieldErrors ?? {};
  const chosen = GROUPS.find((g) => g.value === group);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-8">
      <input type="hidden" name="original_handle" value={collection?.handle ?? ""} />

      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-5">
        <Field
          name="title"
          label="Name"
          defaultValue={value("title", collection?.title)}
          onChange={(e) => setTitle(e.currentTarget.value)}
          error={error.title}
          hint={
            collection
              ? `Web address stays /collections/${collection.handle}`
              : title.trim()
                ? `Web address: /collections/${slugify(title) || "…"}`
                : "The web address is made from this name."
          }
        />

        <label className="block">
          <Label>Where it shows</Label>
          <select
            name="group"
            value={group}
            onChange={(e) => setGroup(e.currentTarget.value as Collection["group"])}
            className={inputClass(error.group)}
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <FieldError message={error.group} />
          {chosen ? <span className="mt-1 block text-[11px] text-muted">{chosen.where}</span> : null}
        </label>

        <Textarea
          name="description"
          label="Description"
          rows={3}
          defaultValue={value("description", collection?.description)}
          error={error.description}
        />

        {NEEDS_IMAGE.includes(group) ? (
          <PhotoField existing={collection?.image} error={error.image} />
        ) : null}

        <label className="flex items-start gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="show_on_home"
            defaultChecked={collection?.showOnHome ?? true}
            className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
          />
          <span>
            Show on the homepage
            <span className="mt-0.5 block text-[11px] text-muted">
              Untick to keep the collection page and the tick-box, but leave it off the front page.
            </span>
          </span>
        </label>

        <Field
          name="sort_order"
          label="Position"
          type="number"
          defaultValue={value("sort_order", collection?.sortOrder ?? 0)}
          hint="Lower shows first, within its own section."
        />
      </div>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Submit label={collection ? "Save changes" : "Create collection"} />
        <Link href="/admin/collections" className="text-[13px] text-muted underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

/** Tile artwork. Mirrors the product form, including the in-browser shrink. */
function PhotoField({ existing, error }: { existing?: string; error?: string }) {
  const [url, setUrl] = useState(existing ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const shown = preview ?? url;
  const message = localError ?? error;

  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    setLocalError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    setBusy(true);
    try {
      const usable =
        file.size > RESIZE_ABOVE_BYTES ? ((await shrinkImage(file, RESIZE_MAX_EDGE)) ?? file) : file;

      if (usable.size > MAX_IMAGE_BYTES) {
        input.value = "";
        setPreview(null);
        setLocalError(
          `That photo is ${(usable.size / 1024 / 1024).toFixed(1)} MB and could not be made smaller. Please pick a lighter one.`,
        );
        return;
      }

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
      <Label>Tile photo</Label>
      <input type="hidden" name="image_url" value={url} />

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
              name="image"
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}

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
