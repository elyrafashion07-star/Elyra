import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { homeCollections } from "@/lib/collections";

/**
 * Navy medallions, drawn in CSS — no artwork needed.
 *
 * Two stacked layers: the tilted oval (rim + gradient) sits behind an upright
 * text layer, so the badge leans but "UNDER ₹1599" stays level.
 */
export default async function ShopByBudget() {
  const budgets = await homeCollections("budget");
  if (!budgets.length) return null;

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <SectionHeading
          title="Shop by Budget"
          subtitle="Explore our premium collection sorted by budget."
        />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6 lg:gap-5">
          {budgets.map((c) => {
            const amount = c.title.replace(/\D/g, "");

            return (
              <Link
                key={c.handle}
                href={`/collections/${c.handle}`}
                className="group flex flex-col items-center"
              >
                <div className="relative mx-auto aspect-[9/10] w-full max-w-45">
                  {/* Tilted shell: silver rim as the outer gradient, navy face inside. */}
                  <div className="absolute inset-0 -rotate-6 rounded-[50%] bg-[linear-gradient(135deg,#ffffff_0%,#cfd5dd_26%,#8b96a3_55%,#e9edf1_78%,#ffffff_100%)] p-1.25 shadow-[0_18px_34px_-12px_rgba(11,33,72,0.55)] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-[1.04]">
                    <div className="h-full w-full rounded-[50%] bg-[radial-gradient(120%_120%_at_30%_22%,#264f92_0%,#173a72_45%,#0b2148_100%)]" />
                  </div>

                  {/* Upright text layer. */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[12px] font-bold tracking-[0.12em] text-white sm:text-[14px]">
                      UNDER
                    </span>
                    <span className="mt-1.5 text-[24px] font-bold text-white sm:text-[30px]">
                      ₹{amount}
                    </span>
                  </div>
                </div>

                <h3 className="mt-4 text-center font-sans text-[15px] font-semibold text-ink transition-colors group-hover:text-gold sm:text-[17px]">
                  {c.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
