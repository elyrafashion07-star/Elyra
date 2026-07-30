import Image from "next/image";
import { IMAGE_SIZES, type ImageSlot } from "@/lib/imageSizes";

type Props = {
  /** Which slot in lib/imageSizes.ts this image fills — decides width/height. */
  slot: ImageSlot;
  /** Drop a real file in /public and pass its path. Omit to render the sized placeholder. */
  src?: string;
  alt: string;
  /** Caption shown on the placeholder so you know what belongs here. */
  label?: string;
  priority?: boolean;
  /** Classes on the outer aspect-ratio box. */
  className?: string;
  /** Classes on the <img> itself — defaults to object-cover. */
  imgClassName?: string;
  sizes?: string;
};

/**
 * Every image on the site goes through here.
 *
 * The outer box locks the aspect ratio from IMAGE_SIZES *before* anything loads,
 * and next/image gets explicit width + height — so swapping a placeholder for a
 * real photo never shifts the layout.
 */
export default function FixedImage({
  slot,
  src,
  alt,
  label,
  priority,
  className = "",
  imgClassName = "object-cover",
  sizes,
}: Props) {
  const spec = IMAGE_SIZES[slot];
  const ratio = `${spec.width} / ${spec.height}`;

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
      data-image-slot={slot}
      data-image-size={`${spec.width}x${spec.height}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={spec.width}
          height={spec.height}
          priority={priority}
          sizes={sizes ?? spec.sizes}
          className={`h-full w-full ${imgClassName}`}
        />
      ) : (
        <div className="img-placeholder flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
          <span className="text-[10px] font-medium tracking-[0.18em] text-ink-soft/60 uppercase">
            {label ?? alt}
          </span>
          <span className="font-mono text-[10px] text-muted/70">
            {spec.width} × {spec.height}
          </span>
        </div>
      )}
    </div>
  );
}
