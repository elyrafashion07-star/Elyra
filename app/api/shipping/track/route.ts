import { NextResponse } from "next/server";
import { ShiprocketError, isShiprocketConfigured, trackAwb } from "@/lib/shiprocket/client";

export const dynamic = "force-dynamic";

/** GET /api/shipping/track?awb=1234567890 */
export async function GET(request: Request) {
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
