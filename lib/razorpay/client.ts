/**
 * Razorpay API client — server-side only.
 *
 * Talks to the REST API directly rather than pulling in the Node SDK, matching
 * how lib/shiprocket/client.ts works. Auth is HTTP Basic with key_id:key_secret.
 *
 * The key *id* is public — it ships to the browser to open the checkout widget.
 * The key *secret* never leaves the server: it signs and verifies payments, so
 * anyone holding it could forge a "this order was paid" callback.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.razorpay.com/v1";

export const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
);

export class RazorpayError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RazorpayError";
  }
}

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new RazorpayError(
      "Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
      500,
    );
  }

  return { keyId, keySecret };
}

/** The public half of the key pair, for the browser checkout widget. */
export function razorpayKeyId(): string {
  return credentials().keyId;
}

/**
 * Constant-time compare.
 *
 * A plain `===` on a signature leaks, through how long it takes to fail, how
 * many leading characters were right — which is enough to reconstruct a valid
 * signature one character at a time.
 */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  // timingSafeEqual throws on a length mismatch, so that has to be checked
  // first — and a wrong length is already a definitive "no".
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

/**
 * Opens a Razorpay order. `amountPaise` must match the order total exactly —
 * Razorpay charges what it is told here, not what the browser later claims.
 */
export async function createRazorpayOrder({
  amountPaise,
  receipt,
  notes,
}: {
  amountPaise: number;
  /** Shown in the Razorpay dashboard — our order_no, for reconciliation. */
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = credentials();

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as
    | RazorpayOrder
    | { error?: { description?: string } };

  if (!res.ok || !("id" in body)) {
    const description = "error" in body ? body.error?.description : undefined;
    throw new RazorpayError(description ?? `Razorpay order failed (${res.status})`, res.status || 502);
  }

  return body;
}

/**
 * Verifies the handshake the checkout widget hands back to the browser.
 *
 * This is the only thing standing between "the widget said it worked" and an
 * order being marked paid: the browser is free to lie, but it cannot produce
 * this HMAC without the key secret.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = credentials();
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

/**
 * Verifies a webhook delivery.
 *
 * Signed with the webhook secret — a different secret from the API key, set
 * when the webhook is created in the Razorpay dashboard. The body must be the
 * raw request text: re-serialising the parsed JSON changes the bytes and the
 * signature will never match.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new RazorpayError("Razorpay webhook secret is not set — RAZORPAY_WEBHOOK_SECRET", 500);
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
