export function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Rupees → paise, the unit orders and Razorpay are denominated in.
 *
 * Rounded, not truncated: 2199.1 * 100 is 219909.99999999997 in binary floating
 * point, and truncating that would undercharge by a paisa.
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Renders an integer paise amount the same way formatPrice renders rupees. */
export function formatPaise(paise: number): string {
  return formatPrice(paise / 100);
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
