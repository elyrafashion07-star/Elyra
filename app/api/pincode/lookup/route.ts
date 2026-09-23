import { NextResponse } from "next/server";
import { allow, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const PINCODE = /^[1-9][0-9]{5}$/;

/**
 * India Post's own pincode data set uses old state names and "&" instead of
 * "and" ("Andaman & Nicobar", "Daman & Diu" as its own state, "Jammu &
 * Kashmir"…), so a value straight from it will not match any option in the
 * checkout form's State dropdown. Mapped here to the current INDIAN_STATES
 * spelling — anything not listed just gets its "&" swapped for "and" and is
 * matched case-insensitively, which covers the rest.
 */
const STATE_ALIASES: Record<string, string> = {
  "andaman & nicobar": "Andaman and Nicobar Islands",
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  "dadra & nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
  "jammu & kashmir": "Jammu and Kashmir",
  "nct of delhi": "Delhi",
  orissa: "Odisha",
  pondicherry: "Puducherry",
  uttaranchal: "Uttarakhand",
};

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/** Matches a raw state string from the API to one of our dropdown's exact values. */
function normaliseState(raw: string): string | null {
  const cleaned = raw.trim();
  const aliased = STATE_ALIASES[cleaned.toLowerCase()];
  if (aliased) return aliased;

  const swapped = cleaned.replace(/&/g, "and").replace(/\s+/g, " ");
  const match = INDIAN_STATES.find((s) => s.toLowerCase() === swapped.toLowerCase());
  return match ?? null;
}

type PostOffice = { Name?: string; District?: string; State?: string };
type LookupResponse = { Status?: string; PostOffice?: PostOffice[] | null }[];

/**
 * GET /api/pincode/lookup?pincode=110001
 *
 * Backs the checkout form's pin code field: confirms the pin code actually
 * exists before an order can be placed against it, and hands back a city and
 * state to fill in automatically. Proxied server-side because India Post's API
 * does not send CORS headers, so the browser cannot call it directly.
 */
export async function GET(request: Request) {
  if (!allow(`pincode-lookup:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  const pincode = (new URL(request.url).searchParams.get("pincode") ?? "").trim();
  if (!PINCODE.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit pin code." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!res.ok) {
      // Upstream hiccup, not a verdict on the pincode — let checkout carry on
      // rather than block a sale over a third party being briefly down.
      return NextResponse.json({ valid: null });
    }

    const body = (await res.json()) as LookupResponse;
    const first = body?.[0];
    const office = first?.PostOffice?.[0];

    if (first?.Status !== "Success" || !office) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      city: office.District ?? null,
      state: office.State ? normaliseState(office.State) : null,
    });
  } catch (err) {
    console.error("[pincode] lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ valid: null });
  }
}
