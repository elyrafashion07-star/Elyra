"use client";

import { Trash2 } from "lucide-react";
import { deleteBanner } from "@/app/admin/banners/actions";

/** Asks first — the banner and its uploaded images are removed for good. */
export default function DeleteBannerButton({
  position,
  title,
  compact = false,
}: {
  position: number;
  title: string;
  compact?: boolean;
}) {
  return (
    <form
      action={deleteBanner}
      onSubmit={(e) => {
        if (!confirm(`Delete the banner “${title}”? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="position" value={position} />
      <button
        type="submit"
        aria-label={`Delete ${title}`}
        className={`flex items-center gap-2 border border-line text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-red-300 hover:text-red-700 ${
          compact ? "px-3 py-2" : "px-5 py-2.5"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </form>
  );
}
