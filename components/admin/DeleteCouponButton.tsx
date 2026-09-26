"use client";

import { Trash2 } from "lucide-react";
import { deleteCoupon } from "@/app/admin/coupons/actions";

/** Asks before deleting. Past orders keep the code and their discount. */
export default function DeleteCouponButton({ code, compact = false }: { code: string; compact?: boolean }) {
  return (
    <form
      action={deleteCoupon}
      onSubmit={(e) => {
        if (!confirm(`Delete coupon “${code}”? Past orders are not affected. This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="code" value={code} />
      <button
        type="submit"
        aria-label={`Delete ${code}`}
        className={`flex items-center gap-2 border border-line text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-red-300 hover:text-red-700 ${
          compact ? "px-3 py-2" : "px-5 py-2.5"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </form>
  );
}
