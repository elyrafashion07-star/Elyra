import { NextResponse } from "next/server";
import { ShiprocketError, checkServiceability, isShiprocketConfigured } from "@/lib/shiprocket/client";

export const dynamic = "force-dynamic";

const PINCODE = /^[1-9][0-9]{5}$/;

/**
 * GET /api/shipping/serviceability?pincode=400001&weight=0.5&cod=1
 *
 * The browser only ever sees the result — Shiprocket credentials stay on the server.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const pincode = (params.get("pincode") ?? "").trim();

  if (!PINCODE.test(pincode)) {
    return NextResponse.json({ error: "Enter a valid 6-digit pin code." }, { status: 400 });
  }

  if (!isShiprocketConfigured) {
    return NextResponse.json(
      { error: "Delivery check is not available right now." },
      { status: 503 },
    );
  }

  const weight = Number.parseFloat(params.get("weight") ?? "");

  try {
    const result = await checkServiceability({
      deliveryPincode: pincode,
      weightKg: Number.isFinite(weight) && weight > 0 ? weight : 0.5,
      cod: params.get("cod") === "1",
    });
    return NextResponse.json({ pincode, ...result });
  } catch (err) {
    if (err instanceof ShiprocketError) {
      // Don't leak upstream auth problems to the customer.
      const clientFacing = err.status === 422 || err.status === 404;
      console.error(`[shiprocket] serviceability ${pincode}: ${err.status} ${err.message}`);
      return NextResponse.json(
        { error: clientFacing ? err.message : "Could not check delivery right now." },
        { status: clientFacing ? 422 : 502 },
      );
    }
    console.error("[shiprocket] serviceability failed", err);
    return NextResponse.json({ error: "Could not check delivery right now." }, { status: 502 });
  }
}
