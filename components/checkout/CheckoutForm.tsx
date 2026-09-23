"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  confirmPayment,
  quoteCheckout,
  startCheckout,
  startCodOrder,
  type Address,
  type QuoteResult,
} from "@/app/checkout/actions";
import { formatPaise, formatPrice } from "@/lib/format";
import { cartSubtotal, useCart } from "@/lib/store/cart";
import { site } from "@/data/site";

/**
 * Razorpay's widget is loaded from their CDN and attaches itself to `window`.
 * Only the parts we actually call are typed.
 */
type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

/** Loaded on first use rather than on page load — most visitors never check out. */
function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// All 28 states and 8 union territories, so nobody (Chandigarh, the islands…) is
// locked out of the form.
const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const PINCODE = /^[1-9][0-9]{5}$/;

export default function CheckoutForm({
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const { lines, note, clear } = useCart();

  // Cart comes from localStorage, so it is only real after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<string | null>(null);
  // True once a pincode comes back genuinely unreachable — separate from
  // `delivery` being empty, which just means nothing has been checked yet.
  const [undeliverable, setUndeliverable] = useState(false);
  const [codAvailable, setCodAvailable] = useState(false);
  // Only meaningful once a pincode has been checked and is deliverable: tells
  // the shopper plainly that COD specifically is not on offer there.
  const [codUnavailableNote, setCodUnavailableNote] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");

  // City and State are filled in from the pin code once it looks real, but stay
  // editable by hand — a pincode can straddle more than one town.
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const subtotal = mounted ? cartSubtotal(lines) : 0;
  const empty = mounted && lines.length === 0;

  // What the server will really charge. The cart in localStorage remembers the
  // price from when each item was added, so it can be out of date — the button
  // and the summary show this instead, and Pay waits for it.
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoting, setQuoting] = useState(true);

  useEffect(() => {
    if (!mounted || lines.length === 0) return;

    let stale = false;
    setQuoting(true);

    quoteCheckout(lines.map((l) => ({ handle: l.handle, variant: l.variant ?? null, qty: l.qty })))
      .then((result) => {
        if (!stale) setQuote(result);
      })
      .catch(() => {
        // Not fatal: startCheckout prices the order again on the server anyway.
        if (!stale) setQuote(null);
      })
      .finally(() => {
        if (!stale) setQuoting(false);
      });

    return () => {
      stale = true;
    };
  }, [mounted, lines]);

  const priced = quote?.ok ? quote : null;
  const totalLabel = priced ? formatPaise(priced.totalPaise) : formatPrice(subtotal);

  /**
   * Runs the moment a pin code looks complete: confirms it actually exists (so
   * a typo is caught here, not after the order is placed), fills in City and
   * State from it, and — the same as before — checks whether Shiprocket can
   * reach it and whether Cash on Delivery is on offer there.
   *
   * A pincode edited after COD was picked can turn it back off, so any change
   * here also resets the choice back to prepaid.
   */
  async function checkPincode(pincode: string) {
    setDelivery(null);
    setUndeliverable(false);
    setCodAvailable(false);
    setCodUnavailableNote(null);
    setPaymentMethod("prepaid");
    setPincodeError(null);

    if (!pincode) return;
    if (!PINCODE.test(pincode)) {
      setPincodeError("Enter a valid 6-digit pin code.");
      return;
    }

    setCheckingPincode(true);

    try {
      const lookup = await fetch(`/api/pincode/lookup?pincode=${pincode}`);
      const lookupData = (await lookup.json()) as { valid?: boolean | null; city?: string | null; state?: string | null };

      // false means India Post has no such pincode — that is a typo, and the
      // order must not go through with an address that cannot exist. null
      // (lookup service unreachable) is not a verdict either way, so it falls
      // through to the delivery check same as before.
      if (lookupData.valid === false) {
        setPincodeError("We could not find that pin code — please check and re-enter it.");
        return;
      }

      if (lookupData.valid) {
        if (lookupData.city) setCity(lookupData.city);
        if (lookupData.state) setState(lookupData.state);
      }

      const res = await fetch(`/api/shipping/serviceability?pincode=${pincode}`);
      const data = (await res.json()) as { serviceable?: boolean; minDays?: number; codAvailable?: boolean };
      if (!res.ok) return;

      if (!data.serviceable) {
        setUndeliverable(true);
        setDelivery(`We cannot deliver to ${pincode} yet — please try another pin code.`);
        return;
      }

      setDelivery(`Delivers to ${pincode}${data.minDays ? ` in about ${data.minDays} days` : ""}.`);
      setCodAvailable(Boolean(data.codAvailable));
      if (!data.codAvailable) {
        setCodUnavailableNote(`Cash on Delivery is not available for ${pincode} — please pay online.`);
      }
    } catch {
      // A failed check must never block checkout; the address is validated anyway.
    } finally {
      setCheckingPincode(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (pincodeError) {
      setError(pincodeError);
      return;
    }
    if (undeliverable) {
      setError(delivery ?? "We cannot deliver to this pin code yet.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const address: Address = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      line1: String(form.get("line1") ?? ""),
      line2: String(form.get("line2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      pincode: String(form.get("pincode") ?? ""),
    };

    setPending(true);

    // Only handles, variants and quantities go to the server — it prices the
    // order itself, so nothing here can change what gets charged.
    const cartLines = lines.map((l) => ({ handle: l.handle, variant: l.variant ?? null, qty: l.qty }));

    if (paymentMethod === "cod") {
      const placed = await startCodOrder({ lines: cartLines, address, note });

      if (!placed.ok) {
        setError(placed.error);
        setPending(false);
        return;
      }

      clear();
      router.push(`/account/orders/${placed.orderNo}`);
      return;
    }

    const started = await startCheckout({ lines: cartLines, address, note });

    if (!started.ok) {
      setError(started.error);
      setPending(false);
      return;
    }

    if (!(await loadRazorpay()) || !window.Razorpay) {
      setError("Could not load the payment window. Check your connection and try again.");
      setPending(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: started.keyId,
      amount: started.amountPaise,
      currency: "INR",
      name: site.name,
      description: `Order ${started.orderNo}`,
      order_id: started.razorpayOrderId,
      prefill: { name: started.name, email: started.email, contact: started.phone },
      theme: { color: "#b08d57" },
      handler: async (response: RazorpayResponse) => {
        const confirmed = await confirmPayment({
          orderId: started.orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });

        if (!confirmed.ok) {
          // The money may well have left — never tell them to just pay again.
          setError(confirmed.error);
          setPending(false);
          return;
        }

        clear();
        router.push(`/account/orders/${confirmed.orderNo}`);
      },
      modal: {
        // Closing the widget leaves the order in `pending`; the webhook will
        // still fulfil it if the payment actually went through.
        ondismiss: () => setPending(false),
      },
    });

    checkout.open();
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <p className="text-sm text-muted">Your cart is empty.</p>
        <Link
          href="/collections/all"
          className="bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">Delivery Address</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Full Name" defaultValue={defaultName} autoComplete="name" />
          <Field
            name="phone"
            label="Mobile Number"
            type="tel"
            defaultValue={defaultPhone}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={10}
          />
        </div>

        <Field name="email" label="Email" type="email" defaultValue={defaultEmail} autoComplete="email" />
        <Field name="line1" label="Address" autoComplete="address-line1" minLength={8} />
        <Field name="line2" label="Apartment, landmark (optional)" required={false} autoComplete="address-line2" />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            name="city"
            label="City"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">State</span>
            <select
              name="state"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              autoComplete="address-level1"
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option value="" disabled>
                Select
              </option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <Field
            name="pincode"
            label="Pin Code"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={6}
            // Fires as soon as a real 6-digit code is typed, not just on blur —
            // City and State fill in before the shopper has even tabbed away.
            onChange={(e) => {
              const digits = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
              if (e.currentTarget.value !== digits) e.currentTarget.value = digits;
              if (digits.length === 6) checkPincode(digits);
              else {
                setPincodeError(null);
                setDelivery(null);
                setUndeliverable(false);
                setCodUnavailableNote(null);
              }
            }}
            onBlur={(e) => checkPincode(e.currentTarget.value.trim())}
          />
        </div>

        {pincodeError ? (
          <p className="text-[12px] text-red-700">{pincodeError}</p>
        ) : checkingPincode ? (
          <p className="text-[12px] text-muted">Checking pin code…</p>
        ) : delivery ? (
          <div className="space-y-1">
            <p className={`text-[12px] ${undeliverable ? "text-red-700" : "text-muted"}`}>{delivery}</p>
            {codUnavailableNote ? <p className="text-[12px] text-amber-700">{codUnavailableNote}</p> : null}
          </div>
        ) : null}

        <div className="pt-2">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">Payment Method</h2>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer items-start gap-3 border border-line px-4 py-3 has-[:checked]:border-gold">
              <input
                type="radio"
                name="paymentMethod"
                value="prepaid"
                checked={paymentMethod === "prepaid"}
                onChange={() => setPaymentMethod("prepaid")}
                className="mt-0.5"
              />
              <span className="text-[13px]">
                <span className="block font-semibold">Pay Online</span>
                <span className="text-muted">UPI, cards or net banking, secured by Razorpay.</span>
              </span>
            </label>

            {codAvailable ? (
              <label className="flex cursor-pointer items-start gap-3 border border-line px-4 py-3 has-[:checked]:border-gold">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5"
                />
                <span className="text-[13px]">
                  <span className="block font-semibold">Cash on Delivery</span>
                  <span className="text-muted">Pay in cash when your order arrives.</span>
                </span>
              </label>
            ) : null}
          </div>
        </div>
      </div>

      {/* summary */}
      <aside className="h-max border border-line bg-white p-6">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase">Order Summary</h2>

        <ul className="mt-4 space-y-3 border-b border-line pb-4">
          {(priced
            ? priced.items.map((i) => ({
                key: `${i.handle}-${i.variant ?? ""}`,
                title: i.title,
                variant: i.variant,
                qty: i.qty,
                total: formatPaise(i.lineTotalPaise),
              }))
            : lines.map((l) => ({
                key: `${l.handle}-${l.variant ?? ""}`,
                title: l.title,
                variant: l.variant ?? null,
                qty: l.qty,
                total: formatPrice(l.price * l.qty),
              }))
          ).map((l) => (
            <li key={l.key} className="flex justify-between gap-3 text-[13px]">
              <span className="text-ink-soft">
                {l.title}
                {l.variant ? ` · ${l.variant}` : ""} × {l.qty}
              </span>
              <span className="whitespace-nowrap">{l.total}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-[13px]">
          <Row label="Subtotal" value={priced ? formatPaise(priced.subtotalPaise) : formatPrice(subtotal)} />
          <Row label="Shipping" value="Free" />
          <div className="flex justify-between border-t border-line pt-3 text-[15px] font-semibold">
            <dt>Total</dt>
            <dd>{totalLabel}</dd>
          </div>
        </dl>

        {quote && !quote.ok ? (
          <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {quote.error}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            pending ||
            !mounted ||
            quoting ||
            checkingPincode ||
            Boolean(pincodeError) ||
            undeliverable ||
            (quote !== null && !quote.ok)
          }
          className="mt-5 flex w-full items-center justify-center gap-2 bg-ink py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {pending
            ? paymentMethod === "cod"
              ? "Placing order…"
              : "Opening payment…"
            : quoting
              ? "Checking prices…"
              : paymentMethod === "cod"
                ? `Place Order · ${totalLabel} on Delivery`
                : `Pay ${totalLabel}`}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          {paymentMethod === "cod" ? "Pay the courier in cash on delivery" : "Secured by Razorpay · UPI, cards, net banking"}
        </p>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = true,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
        {...rest}
      />
    </label>
  );
}
