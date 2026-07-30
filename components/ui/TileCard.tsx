import Link from "next/link";
import FixedImage from "@/components/ui/FixedImage";
import type { ImageSlot } from "@/lib/imageSizes";

/** Reusable image tile — categories, collections, budgets, occasions, gifting. */
export default function TileCard({
  href,
  title,
  slot,
  src,
  rounded = "rounded-xl",
  titleClassName = "",
}: {
  href: string;
  title: string;
  slot: ImageSlot;
  src?: string;
  rounded?: string;
  titleClassName?: string;
}) {
  return (
    <Link href={href} className="group block">
      <FixedImage
        slot={slot}
        src={src}
        alt={title}
        label={title}
        className={`${rounded} border border-line bg-sand transition-transform duration-300 group-hover:scale-[1.02]`}
      />
      <h3
        className={`mt-3 text-center font-sans text-[13px] font-medium tracking-[0.08em] uppercase text-ink-soft transition-colors group-hover:text-gold ${titleClassName}`}
      >
        {title}
      </h3>
    </Link>
  );
}
