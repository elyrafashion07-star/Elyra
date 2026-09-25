"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { saveBanner, type BannerFormState } from "@/app/admin/banners/actions";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, RESIZE_ABOVE_BYTES } from "@/lib/productImages";
import { shrinkImage } from "@/lib/shrinkImage";
import type { HeroSlideRow } from "@/lib/supabase/types";

/** Banners are full-width, so they are allowed a larger edge than product photos. */
const BANNER_MAX_EDGE = 1920;

const FOCUS_OPTIONS = [
  { value: "object-top", label: "Top" },
  { value: "object-center", label: "Centre" },
  { value: "object-bottom", label: "Bottom" },
];

/** Add or edit one homepage hero banner. */
export default function BannerForm({ banner }: { banner?: HeroSlideRow }) {
  const [state, formAction] = useActionState<BannerFormState, FormData>(saveBanner, {});
  const error = state.fieldErrors ?? {};

  const value = (key: string, fallback: string | null | undefined) =>
    state.values?.[key] ?? fallback ?? "";

  return (
    <form action={formAction} className="mt-8 max-w-3xl space-y-6">
      <input type="hidden" name="original_position" value={banner?.position ?? ""} />

      {state.error ? (
        <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {state.error}
        </p>
      ) : null}

      <BannerPhoto
        name="desktop"
        label="Banner image"
        hint="Landscape, ideally 1672 × 941 (16:9). Keep the left side fairly plain — the heading sits there."
        existing={banner?.desktop_src}
        error={error.desktop}
      />

      <BannerPhoto
        name="mobile"
        label="Phone image (optional)"
        hint="Leave empty to use the banner image on phones too."
        existing={banner?.mobile_src}
        error={error.mobile}
      />

      <Field
        name="title"
        label="Heading"
        defaultValue={value("title", banner?.title)}
        error={error.title}
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="eyebrow"
          label="Small text above heading"
          defaultValue={value("eyebrow", banner?.eyebrow)}
          hint="e.g. New Arrivals"
        />

        <label className="block">
          <Label>Crop on desktop</Label>
          <select
            name="focus"
            defaultValue={value("focus", banner?.focus ?? "object-center")}
            className={inputClass()}
          >
            {FOCUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Keep the {o.label.toLowerCase()}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-muted">
            Desktop shows a wider strip of the image — pick which part must stay visible.
          </span>
        </label>
      </div>

      <label className="block">
        <Label>Description</Label>
        <textarea
          name="body"
          rows={2}
          defaultValue={value("body", banner?.body)}
          className={inputClass()}
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          name="cta_label"
          label="Button text"
          defaultValue={value("cta_label", banner?.cta_label)}
          hint="e.g. Shop Now"
        />
        <Field
          name="cta_href"
          label="Button link"
          defaultValue={value("cta_href", banner?.cta_href ?? "/collections/")}
          error={error.cta_href}
          hint="e.g. /collections/rings"
        />
      </div>

      <label className="flex items-center gap-3 text-[13px]">
        <input
          type="checkbox"
          name="active"
          defaultChecked={banner?.active ?? true}
          className="h-4 w-4 accent-gold"
        />
        Show on the homepage
      </label>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Submit label={banner ? "Save changes" : "Add banner"} />
        <Link href="/admin/banners" className="text-[13px] text-muted underline underline-offset-4">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function BannerPhoto({
  name,
  label,
  hint,
  existing,
  error,
}: {
  name: "desktop" | "mobile";
  label: string;
  hint: string;
  existing?: string | null;
  error?: string;
}) {
  const [url, setUrl] = useState(existing ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
        file.size > RESIZE_ABOVE_BYTES ? ((await shrinkImage(file, BANNER_MAX_EDGE)) ?? file) : file;

      if (usable.size > MAX_IMAGE_BYTES) {
        input.value = "";
        setPreview(null);
        setLocalError(
          `That image is ${(usable.size / 1024 / 1024).toFixed(1)} MB and could not be made smaller. Please pick a lighter one.`,
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
      <Label>{label}</Label>
      <input type="hidden" name={`${name}_url`} value={url} />

      <div
        className={`relative aspect-video w-full max-w-xl overflow-hidden border bg-sand ${
          message ? "border-red-300" : "border-line"
        }`}
      >
        {shown ? (
          <Image
            src={shown}
            alt=""
            fill
            sizes="576px"
            className="object-cover"
            unoptimized={Boolean(preview)}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[12px] text-muted">
            No image
          </span>
        )}

        {shown ? (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setPreview(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            aria-label="Remove image"
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 border border-line bg-white px-4 py-2.5 text-[11px] transition-colors hover:border-gold">
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {busy ? "Preparing…" : shown ? "Replace image" : "Upload image"}
          <input
            ref={fileRef}
            type="file"
            name={name}
            accept={IMAGE_ACCEPT}
            onChange={(e) => pick(e.currentTarget)}
            className="hidden"
          />
        </label>
        <span className="text-[11px] text-muted">{hint}</span>
      </div>
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
