"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

type Result = {
  pincode: string;
  serviceable: boolean;
  codAvailable: boolean;
  minDays: number | null;
  etd: string | null;
};

/**
 * Pin-code delivery estimate, answered by Shiprocket through
 * /api/shipping/serviceability. Weight comes from the product ("2.4 g"),
 * floored at Shiprocket's 0.5 kg minimum slab inside the route.
 */
export default function DeliveryCheck({ weight }: { weight?: string }) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weightKg = parseWeightKg(weight);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid 6-digit pin code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/shipping/serviceability?pincode=${pincode}&weight=${weightKg}`,
      );
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Could not check delivery right now.");
      else setResult(data);
    } catch {
      setError("Could not check delivery right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border border-line p-4">
      <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-ink">
        <MapPin className="h-4 w-4 text-gold" /> Check delivery
      </p>

      <form onSubmit={check} className="mt-3 flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter pin code"
          aria-label="Delivery pin code"
          className="min-w-0 flex-1 border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-ink px-5 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-cream transition-colors hover:bg-gold disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Check
        </button>
      </form>

      {error ? <p className="mt-2 text-[12px] text-red-700">{error}</p> : null}

      {result ? (
        result.serviceable ? (
          <div className="mt-3 text-[13px] text-ink-soft">
            <p>
              <span className="font-semibold text-ink">Delivers to {result.pincode}</span>
              {result.minDays ? ` in ${result.minDays} ${result.minDays === 1 ? "day" : "days"}` : ""}
              {result.etd ? ` · by ${result.etd}` : ""}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              Free shipping · {result.codAvailable ? "COD available" : "Prepaid only on this pin code"}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-ink-soft">
            Sorry, we cannot deliver to {result.pincode} yet.
          </p>
        )
      ) : null}
    </div>
  );
}

/** "2.4 g" → 0.0024 kg. Falls back to the 0.5 kg minimum slab. */
function parseWeightKg(weight?: string): number {
  if (!weight) return 0.5;
  const grams = Number.parseFloat(weight);
  if (!Number.isFinite(grams)) return 0.5;
  return /kg/i.test(weight) ? grams : grams / 1000;
}
