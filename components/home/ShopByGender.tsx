import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FixedImage from "@/components/ui/FixedImage";

const panels = [
  { title: "For Her", href: "/collections/women", text: "Rings, chains, anklets and pendants." },
  { title: "For Him", href: "/collections/men", text: "Bracelets, rings, buttons and brooches." },
];

export default function ShopByGender() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading title="Shop by Gender" />
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {panels.map((p) => (
            <Link key={p.title} href={p.href} className="group relative block overflow-hidden rounded-xl">
              {/* 1000 × 1200 */}
              <FixedImage
                slot="genderBanner"
                alt={p.title}
                label={`${p.title} banner`}
                className="border border-line transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6 pt-16 text-cream">
                <h3 className="text-2xl">{p.title}</h3>
                <p className="mt-1 text-[13px] text-cream/75">{p.text}</p>
                <span className="mt-3 inline-block border-b border-cream/70 pb-0.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
