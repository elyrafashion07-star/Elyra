import Link from "next/link";
import FixedImage from "@/components/ui/FixedImage";
import { site } from "@/data/site";

/**
 * Stacked lockup: EF monogram over the letterspaced brand name.
 * The mark is a transparent PNG cropped out of the source lockup by
 * scripts/make-logo-mark.py, so it sits on any background.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={`flex shrink-0 flex-col items-center gap-1 leading-none ${className}`}
    >
      <FixedImage
        slot="logoMark"
        src="/images/logo/logo-mark.png"
        alt={`${site.name} monogram`}
        priority
        className="w-19.5 sm:w-23 2xl:w-28"
        imgClassName="object-contain"
      />
      <span className="text-[9px] tracking-[0.26em] text-ink-soft uppercase sm:text-[10px]">
        {site.wordmark.head}
        {site.wordmark.tail}
      </span>
    </Link>
  );
}
