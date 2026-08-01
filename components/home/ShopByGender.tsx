import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FixedImage from "@/components/ui/FixedImage";

/**
 * The two panel PNGs are transparent and already carry their own script
 * wordmark and SHOP NOW button, so the whole image is the link — no text
 * overlay of ours, just an accessible name for screen readers.
 *
 * Men sits on the left so each model faces out of their own half.
 */
const panels = [
  { title: "Shop Men", href: "/collections/men", src: "/images/gender/men.png" },
  { title: "Shop Women", href: "/collections/women", src: "/images/gender/women.png" },
];

export default function ShopByGender() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading title="Shop by Gender" />
      </Container>

      {/* Full-bleed band: silk wave behind, the two transparent panels on top.
          The panels run edge to edge with no gutter, so each is a full 50vw. */}
      <div className="relative mt-9 overflow-hidden">
        {/* Decorative backdrop — `fill` rather than FixedImage, since the band's
            height comes from the panels, not from this image. */}
        <Image
          src="/images/gender/background_image.png"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div className="relative grid md:grid-cols-2">
          {panels.map((p) => (
            <Link key={p.href} href={p.href} className="group block">
              <FixedImage
                slot="genderBanner"
                src={p.src}
                alt={p.title}
                sizes="(max-width: 768px) 100vw, 50vw"
                // Stacked on phones, only the lower panel is flush with the band — fade
                // the cropped foot of each image so the straight cut never shows.
                imgClassName="object-cover max-md:[mask-image:linear-gradient(to_bottom,black_88%,transparent_100%)]"
              />
              <span className="sr-only">{p.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
