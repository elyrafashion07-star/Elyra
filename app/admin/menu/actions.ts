"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/supabase/server";

export type MenuFormState = { error?: string };

/** Server actions are public endpoints — the role is re-checked on every write. */
async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}

function clean(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/**
 * Adds or edits one menu entry.
 *
 * `parent_id` decides everything: empty makes a top-level entry, set makes it a
 * line inside that entry's dropdown. The database refuses a third level.
 */
export async function saveMenuItem(
  _prev: MenuFormState,
  form: FormData,
): Promise<MenuFormState> {
  if (!(await requireAdmin())) return { error: "You do not have permission to do that." };

  const id = clean(form, "id");
  const label = clean(form, "label");
  const href = clean(form, "href");
  const parentId = clean(form, "parent_id");
  const sortRaw = clean(form, "sort_order");

  if (!label) return { error: "Enter the text that shows in the menu." };
  if (!href) return { error: "Enter the link, e.g. /collections/rakhi-2026." };
  if (!href.startsWith("/") && !href.startsWith("http")) {
    return { error: "The link must start with / — for example /collections/rakhi-2026." };
  }

  const sortOrder = Number(sortRaw);
  const fields = {
    label,
    href,
    parent_id: parentId || null,
    sort_order: sortRaw && Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  const db = getSupabaseAdmin();
  const { error } = id
    ? await db.from("nav_items").update(fields).eq("id", id)
    : await db.from("nav_items").insert(fields);

  if (error) {
    console.error("[admin] menu save failed:", error.message);
    return { error: `Could not save: ${error.message}` };
  }

  revalidateMenu();
  return {};
}

/** Deleting a top-level entry takes its dropdown with it — the FK cascades. */
export async function deleteMenuItem(form: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const { error } = await getSupabaseAdmin().from("nav_items").delete().eq("id", id);
  if (error) console.error("[admin] menu delete failed:", error.message);

  revalidateMenu();
}

/** The header is in the root layout, so every page holds a copy of the menu. */
function revalidateMenu(): void {
  revalidatePath("/admin/menu");
  revalidatePath("/", "layout");
}
