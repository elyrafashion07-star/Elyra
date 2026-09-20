import Link from "next/link";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";

const points = [
  "Finish, clasp strength and stone setting checked on every piece.",
  "Artificial fashion jewellery, inspected batch by batch.",
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
              alt="Elyrafashion quality promise"
              label="Quality banner"
              className="rounded-xl border border-line"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">
              Quality Checked
            </p>
            <h2 className="mt-3 text-3xl leading-tight lg:text-[38px]">Our Quality Promise</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
              Every Elyrafashion piece is artificial fashion jewellery, checked for finish and
              construction before it is packed, so what reaches you looks as good as it does on
              the page.
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
              href="/pages/quality-promise"
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
