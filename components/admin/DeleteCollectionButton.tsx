"use client";

import { Trash2 } from "lucide-react";
import { deleteCollection } from "@/app/admin/collections/actions";

/**
 * Asks before deleting. Products tagged with the collection only lose the tag —
 * none are deleted — but the tile, its photo and its page are gone for good.
 */
export default function DeleteCollectionButton({
  handle,
  title,
  compact = false,
}: {
  handle: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <form
      action={deleteCollection}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}”? Products stay, they just lose this tag. This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="handle" value={handle} />
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
