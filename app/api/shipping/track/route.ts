import { NextResponse } from "next/server";
import { ShiprocketError, isShiprocketConfigured, trackAwb } from "@/lib/shiprocket/client";
import { isAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/shipping/track?awb=1234567890
 *
 * Admin only. Nothing on the storefront calls it — customers see tracking on
 * their own order page, scoped by RLS — and left public it let anyone look up
 * any parcel's journey (a name and address trail) and spend the Shiprocket quota.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const awb = (new URL(request.url).searchParams.get("awb") ?? "").trim();

  if (!/^[A-Za-z0-9-]{6,30}$/.test(awb)) {
    return NextResponse.json({ error: "Enter a valid AWB number." }, { status: 400 });
  }

  if (!isShiprocketConfigured) {
    return NextResponse.json({ error: "Tracking is not available right now." }, { status: 503 });
  }

  try {
    return NextResponse.json(await trackAwb(awb));
  } catch (err) {
    const status = err instanceof ShiprocketError ? err.status : 502;
    console.error(`[shiprocket] track ${awb}: ${status}`);
    return NextResponse.json({ error: "Could not fetch tracking right now." }, { status: 502 });
  }
}
