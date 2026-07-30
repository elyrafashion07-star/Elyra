import Link from "next/link";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";

const points = [
  "Metal purity, weight and stone type printed on every certificate.",
  "BIS hallmarked 925 sterling silver, assayed batch by batch.",
  "Inspected for setting security and finish before it is boxed.",
];

export default function AuthenticityBanner() {
  return (
    <section className="bg-sand py-14 sm:py-16">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* 1200 × 1500 */}
          <div className="mx-auto w-full max-w-[500px]">
            <FixedImage
              slot="authenticityBanner"
              alt="Rakkhi certificate of authenticity"
              label="Certificate banner"
              className="rounded-xl border border-line"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">
              Guaranteed Purity
            </p>
            <h2 className="mt-3 text-3xl leading-tight lg:text-[38px]">Certificate of Authenticity</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
              Our certificate ensures every Rakkhi piece you receive is crafted from genuine,
              high-quality 925 sterling silver. Each certificate verifies the purity and standard of
              the metal, giving you complete confidence in your purchase — and a record you can keep
              for resale, insurance or exchange.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-ink-soft">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/pages/certificate-of-authenticity"
              className="mt-7 inline-block bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
            >
              Learn More
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
