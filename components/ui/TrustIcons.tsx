/**
 * Hand-drawn line-art icons for the trust strip.
 *
 * All five share one visual language so the row reads as a set:
 * 24 × 24 viewBox, 1.75 stroke on currentColor, round caps and joins,
 * no fills. Size them with a className (e.g. `h-12 w-12`).
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** 925 Sterling Silver — a hallmark stamp, rings around a solid centre. */
export function SilverIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9.25" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Free Shipping — cargo box, cab and two wheels on a shared chassis. */
export function ShippingIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M1.75 6.25h10.75v9.25H1.75z" />
      <path d="M12.5 9.5h3.6l3.15 3.1v2.9H12.5z" />
      <path d="M1.75 15.5h17.5" />
      <circle cx="6.4" cy="17.75" r="1.85" />
      <circle cx="15.6" cy="17.75" r="1.85" />
    </svg>
  );
}

/** Secure Payments — a payment card with its magnetic stripe. */
export function PaymentsIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="1.75" y="5.25" width="20.5" height="13.5" rx="2.5" />
      <path d="M1.75 9.75h20.5" />
      <path d="M5.25 14.5h4" />
    </svg>
  );
}

/** Easy 7-Day Returns — a counter-clockwise arrow closing its loop. */
export function ReturnsIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3.25 12a8.75 8.75 0 1 0 2.6-6.2L3.25 8.2" />
      <path d="M3.25 3.6v4.6h4.6" />
    </svg>
  );
}

/** Certified — a shield with a check, for hallmarked purity. */
export function CertifiedIcon({ className = "" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.25 4.25 5.4v5.5c0 4.5 3.1 7.9 7.75 9.15 4.65-1.25 7.75-4.65 7.75-9.15V5.4z" />
      <path d="M8.9 11.9l2.5 2.5 4.1-4.9" />
    </svg>
  );
}

/** Keys match the `icon` field on `trustStrip` in data/site.ts. */
export const trustIcons = {
  silver: SilverIcon,
  shipping: ShippingIcon,
  payments: PaymentsIcon,
  returns: ReturnsIcon,
  certified: CertifiedIcon,
};

export type TrustIconName = keyof typeof trustIcons;
