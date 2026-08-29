"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { deleteMenuItem, saveMenuItem, type MenuFormState } from "@/app/admin/menu/actions";

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
};

/**
 * The header menu, edited in place.
 *
 * Every row is its own form posting to the same action, so a change to one line
 * never touches another — safer than one big form when the menu is the thing
 * every page depends on.
 */
export default function MenuEditor({ items }: { items: MenuItem[] }) {
  const top = items.filter((i) => !i.parentId);
  const childrenOf = (id: string) => items.filter((i) => i.parentId === id);

  return (
    <div className="mt-8 max-w-3xl space-y-4">
      {top.map((item) => (
        <Entry key={item.id} item={item} links={childrenOf(item.id)} />
      ))}

      {!top.length ? (
        <p className="border-y border-line py-6 text-[13px] text-muted">
          The menu is empty, so the store is showing its built-in links. Add the first entry below.
        </p>
      ) : null}

      <div className="border border-line bg-sand p-4">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase">Add a menu entry</p>
        <ItemForm parentId={null} nextSort={top.length} resetOnSave />
      </div>
    </div>
  );
}

function Entry({ item, links }: { item: MenuItem; links: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-line">
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2.5 shrink-0 text-muted transition-colors hover:text-ink"
          aria-label={open ? "Hide drop-down" : "Show drop-down"}
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <ItemForm item={item} parentId={null} nextSort={item.sortOrder} />
          <p className="mt-1 text-[11px] text-muted">
            {links.length
              ? `${links.length} link${links.length === 1 ? "" : "s"} in its drop-down`
              : "No drop-down"}
          </p>
        </div>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-line bg-sand/60 p-4 pl-11">
          {links.map((link) => (
            <ItemForm key={link.id} item={link} parentId={item.id} nextSort={link.sortOrder} />
          ))}

          <div className="pt-1">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
              Add to this drop-down
            </p>
            <ItemForm parentId={item.id} nextSort={links.length} resetOnSave />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One line: label, link, position — plus Delete on a row that already exists.
 *
 * `resetOnSave` is what makes the "add" rows usable more than once; React keeps
 * the inputs' values otherwise, and you would be editing the entry you just made.
 */
function ItemForm({
  item,
  parentId,
  nextSort,
  resetOnSave = false,
}: {
  item?: MenuItem;
  parentId: string | null;
  nextSort: number;
  resetOnSave?: boolean;
}) {
  const [state, formAction] = useActionState<MenuFormState, FormData>(saveMenuItem, {});
  const [round, setRound] = useState(0);

  return (
    <div>
      <form
        key={round}
        action={async (data) => {
          await formAction(data);
          if (resetOnSave) setRound((n) => n + 1);
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <input type="hidden" name="id" value={item?.id ?? ""} />
        <input type="hidden" name="parent_id" value={parentId ?? ""} />

        <label className="min-w-0 flex-[2_1_10rem]">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">
            Text
          </span>
          <input
            name="label"
            defaultValue={item?.label ?? ""}
            placeholder="Rakhi Collection 2026"
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="min-w-0 flex-[3_1_12rem]">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">
            Link
          </span>
          <input
            name="href"
            defaultValue={item?.href ?? ""}
            placeholder="/collections/rakhi-2026"
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="w-20 shrink-0">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.14em] uppercase text-muted">
            Order
          </span>
          <input
            name="sort_order"
            type="number"
            defaultValue={nextSort}
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </label>

        <SaveButton isNew={!item} />
      </form>

      {state.error ? (
        <p role="alert" className="mt-1 text-[12px] text-red-700">
          {state.error}
        </p>
      ) : null}

      {item ? (
        <form action={deleteMenuItem} className="mt-1">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="flex items-center gap-1.5 text-[11px] text-muted underline underline-offset-4 transition-colors hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex shrink-0 items-center gap-1.5 border border-ink bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-cream transition-colors hover:bg-gold hover:border-gold disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isNew ? (
        <Plus className="h-3 w-3" />
      ) : null}
      {isNew ? "Add" : "Save"}
    </button>
  );
}
