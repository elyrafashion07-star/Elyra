/**
 * Shiprocket API client — server-side only.
 *
 * Credentials never reach the browser: every call goes through a route handler
 * under /api/shipping. Auth is email + password of the *API user* you create in
 * Shiprocket (Settings → API → Configure), not your dashboard login.
 *
 * Tokens are valid for 10 days; we cache in memory and re-authenticate on 401.
 */
import "server-only";
import { PARCEL } from "@/lib/parcel";

const BASE = "https://apiv2.shiprocket.in/v1/external";

/** Shiprocket tokens last 10 days — refresh a day early. */
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

let cachedToken: { token: string; expiresAt: number } | null = null;
let inFlightLogin: Promise<string> | null = null;

export const isShiprocketConfigured = Boolean(
  process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD,
);

export class ShiprocketError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ShiprocketError";
  }
}

async function login(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new ShiprocketError(
      "Shiprocket is not configured — set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD",
      500,
    );
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as { token?: string; message?: string };

  if (!res.ok || !body.token) {
    throw new ShiprocketError(
      body.message ?? `Shiprocket login failed (${res.status})`,
      res.status || 502,
    );
  }

  cachedToken = { token: body.token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return body.token;
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  // Collapse concurrent logins so a burst of requests triggers one auth call.
  inFlightLogin ??= login().finally(() => {
    inFlightLogin = null;
  });
  return inFlightLogin;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (res.status === 401 && retry) {
    cachedToken = null;
    return request<T>(path, init, false);
  }

  const body = (await res.json().catch(() => ({}))) as T & { message?: string };

  if (!res.ok) {
    throw new ShiprocketError(body?.message ?? `Shiprocket request failed (${res.status})`, res.status);
  }

  return body as T;
}

// ── serviceability ─────────────────────────────────────────────────────────

type CourierCompany = {
  courier_name: string;
  rate: number;
  cod: number | string;
  etd: string;
  estimated_delivery_days: string;
  is_surface: boolean;
};

export type ServiceabilityResult = {
  serviceable: boolean;
  codAvailable: boolean;
  /** Fastest promised delivery in days, across available couriers. */
  minDays: number | null;
  /** Human date string from the fastest courier, e.g. "Aug 4, 2026". */
  etd: string | null;
  cheapestRate: number | null;
  courierCount: number;
};

/**
 * Which couriers can reach a pincode, how fast, and whether COD is on.
 * `weightKg` is the billable package weight — Shiprocket's minimum slab is 0.5 kg.
 */
export async function checkServiceability({
  deliveryPincode,
  weightKg = 0.5,
  cod = false,
}: {
  deliveryPincode: string;
  weightKg?: number;
  cod?: boolean;
}): Promise<ServiceabilityResult> {
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickup) {
    throw new ShiprocketError("Set SHIPROCKET_PICKUP_PINCODE to your pickup location's pin code", 500);
  }

  const qs = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: deliveryPincode,
    weight: String(Math.max(0.5, weightKg)),
    cod: cod ? "1" : "0",
  });

  const body = await request<{ data?: { available_courier_companies?: CourierCompany[] } }>(
    `/courier/serviceability/?${qs}`,
  );

  const couriers = body.data?.available_courier_companies ?? [];
  if (!couriers.length) {
    return {
      serviceable: false,
      codAvailable: false,
      minDays: null,
      etd: null,
      cheapestRate: null,
      courierCount: 0,
    };
  }

  const days = couriers
    .map((c) => Number.parseInt(c.estimated_delivery_days, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const fastest = couriers.reduce((best, c) => {
    const a = Number.parseInt(c.estimated_delivery_days, 10) || Number.MAX_SAFE_INTEGER;
    const b = Number.parseInt(best.estimated_delivery_days, 10) || Number.MAX_SAFE_INTEGER;
    return a < b ? c : best;
  });

  return {
    serviceable: true,
    codAvailable: couriers.some((c) => Number(c.cod) === 1),
    minDays: days.length ? Math.min(...days) : null,
    etd: fastest.etd || null,
    cheapestRate: Math.min(...couriers.map((c) => Number(c.rate)).filter(Number.isFinite)),
    courierCount: couriers.length,
  };
}

// ── tracking ───────────────────────────────────────────────────────────────

export type TrackingResult = {
  awb: string;
  status: string | null;
  courier: string | null;
  deliveredAt: string | null;
  checkpoints: { date: string; activity: string; location: string }[];
};

export async function trackAwb(awb: string): Promise<TrackingResult> {
  const body = await request<Record<string, unknown>>(`/courier/track/awb/${encodeURIComponent(awb)}`);

  // Shiprocket returns either { tracking_data: {...} } or [{ tracking_data: {...} }].
  const first = Array.isArray(body) ? body[0] : body;
  const data = (first as { tracking_data?: Record<string, unknown> })?.tracking_data ?? {};
  const shipment = (data.shipment_track as Record<string, unknown>[] | undefined)?.[0] ?? {};
  const activities = (data.shipment_track_activities as Record<string, string>[] | undefined) ?? [];

  return {
    awb,
    status: (shipment.current_status as string) ?? null,
    courier: (shipment.courier_name as string) ?? null,
    deliveredAt: (shipment.delivered_date as string) ?? null,
    checkpoints: activities.map((a) => ({
      date: a.date ?? "",
      activity: a.activity ?? "",
      location: a.location ?? "",
    })),
  };
}

// ── orders ─────────────────────────────────────────────────────────────────

export type ShiprocketOrderInfo = {
  /** Shiprocket's own order status, e.g. "NEW", "READY TO SHIP", "CANCELED". */
  status: string | null;
  awb: string | null;
  courier: string | null;
};

function text(value: unknown): string | null {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Reads an order back from Shiprocket by the numeric id we stored when creating
 * it. This is the pull side of the webhook: it works even when no callback ever
 * arrived (Shiprocket does not always send one for an order cancelled before a
 * courier was assigned).
 *
 * The response shape varies — `shipments` is an object in some responses and a
 * list in others, and the AWB can sit in either place — so every field is read
 * defensively and comes back null rather than throwing.
 */
export async function getOrder(shiprocketOrderId: string): Promise<ShiprocketOrderInfo> {
  const body = await request<{ data?: Record<string, unknown> }>(
    `/orders/show/${encodeURIComponent(shiprocketOrderId)}`,
  );

  const data = body.data ?? {};
  const shipments = data.shipments;
  const shipment = ((Array.isArray(shipments) ? shipments[0] : shipments) ?? {}) as Record<string, unknown>;
  const awbData = (data.awb_data ?? {}) as Record<string, unknown>;

  return {
    status: text(data.status),
    awb: text(shipment.awb) ?? text(awbData.awb),
    courier: text(shipment.courier) ?? text(awbData.courier_name) ?? text(awbData.courier),
  };
}

/**
 * Cancels orders in Shiprocket. Shiprocket refuses once a parcel is out with the
 * courier, so callers should treat a failure as "cancel it in their panel".
 */
export async function cancelOrders(shiprocketOrderIds: number[]): Promise<void> {
  await request<unknown>(`/orders/cancel`, {
    method: "POST",
    body: JSON.stringify({ ids: shiprocketOrderIds }),
  });
}

export type ShiprocketOrderInput = {
  orderId: string;
  orderDate: string; // "YYYY-MM-DD HH:mm"
  billing: {
    name: string;
    lastName?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    phone: string;
  };
  items: { name: string; sku: string; units: number; sellingPrice: number }[];
  paymentMethod: "COD" | "Prepaid";
  subTotal: number;
  /** Coupon discount in rupees, so the line items add up to sub_total. */
  totalDiscount?: number;
  /** Package dimensions in cm and weight in kg. */
  parcel?: { lengthCm: number; breadthCm: number; heightCm: number; weightKg: number };
};

/**
 * Pushes an order to Shiprocket. Called by createShipment in
 * lib/orders/fulfil.ts when an admin packs a paid order, which stores the
 * returned ids against the order.
 */
export async function createOrder(input: ShiprocketOrderInput) {
  const p = input.parcel ?? PARCEL;

  // awb_code and courier_name are filled in only when the account has
  // auto-assign switched on; otherwise they come back empty.
  return request<{
    order_id: number;
    shipment_id: number;
    status: string;
    awb_code?: string | number | null;
    courier_name?: string | null;
  }>(`/orders/create/adhoc`, {
    method: "POST",
    body: JSON.stringify({
      order_id: input.orderId,
      order_date: input.orderDate,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION ?? "Primary",
      channel_id: process.env.SHIPROCKET_CHANNEL_ID || undefined,
      billing_customer_name: input.billing.name,
      billing_last_name: input.billing.lastName ?? "",
      billing_address: input.billing.address,
      billing_address_2: input.billing.address2 ?? "",
      billing_city: input.billing.city,
      billing_pincode: input.billing.pincode,
      billing_state: input.billing.state,
      billing_country: "India",
      billing_email: input.billing.email,
      billing_phone: input.billing.phone,
      shipping_is_billing: true,
      order_items: input.items.map((i) => ({
        name: i.name,
        sku: i.sku,
        units: i.units,
        selling_price: i.sellingPrice,
      })),
      payment_method: input.paymentMethod,
      sub_total: input.subTotal,
      total_discount: input.totalDiscount ?? 0,
      length: p.lengthCm,
      breadth: p.breadthCm,
      height: p.heightCm,
      weight: p.weightKg,
    }),
  });
}

// ── AWB ────────────────────────────────────────────────────────────────────

export type AwbAssignment = { awb: string; courier: string | null };

/**
 * Asks Shiprocket to allocate a courier and tracking number (AWB) for a
 * shipment right away, instead of waiting for someone to click "Ship Now" in
 * their panel. With no courier id, Shiprocket picks one using the account's
 * courier priority rules.
 *
 * Shiprocket sometimes reports a refusal with HTTP 200 and
 * `awb_assign_status: 0` (low wallet balance, pincode not serviceable, …), so a
 * missing AWB is treated as a failure whatever the status code said.
 */
export async function assignAwb(shipmentId: string, courierId?: number): Promise<AwbAssignment> {
  const body = await request<{
    awb_assign_status?: number;
    message?: string;
    response?: { data?: Record<string, unknown> };
  }>(`/courier/assign/awb`, {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipmentId,
      ...(courierId ? { courier_id: courierId } : {}),
    }),
  });

  const data = body.response?.data ?? {};
  const awb = text(data.awb_code);

  if (!awb) {
    const reason =
      text(data.awb_assign_error) ?? text(body.message) ?? "Shiprocket did not return an AWB";
    throw new ShiprocketError(reason, 422);
  }

  return { awb, courier: text(data.courier_name) };
}
