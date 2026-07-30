import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Rakkhi — home" className={`block leading-none ${className}`}>
      {/* Wordmark placeholder. Swap for <FixedImage slot="logo" src="/images/logo.png" /> (480 × 160). */}
      <span className="block font-display text-[26px] tracking-[0.34em] text-ink sm:text-[30px]">
        RAKKHI
      </span>
      <span className="mt-0.5 block text-[8px] tracking-[0.4em] text-muted uppercase">
        925 Sterling Silver
      </span>
    </Link>
  );
}
