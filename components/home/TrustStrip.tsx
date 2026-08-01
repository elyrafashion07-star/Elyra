import Container from "@/components/ui/Container";
import { trustIcons } from "@/components/ui/TrustIcons";
import { trustStrip } from "@/data/site";

export default function TrustStrip() {
  return (
    <section className="border-b border-line bg-cream">
      <Container>
        {/* Always one row. Below lg every item is `flex-1 min-w-0`, so the five share
            whatever width there is and simply get narrower — the row can never
            overflow, no matter how small the screen. From lg they go back to hugging
            their own text, centred with a wide gap. */}
        <ul className="flex justify-center gap-1 py-5 sm:gap-3 sm:py-6 md:gap-5 lg:gap-12 lg:py-8">
          {trustStrip.map((item) => {
            const Icon = trustIcons[item.icon];
            return (
              <li
                key={item.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center sm:gap-2.5 lg:w-auto lg:flex-none lg:gap-3.5 lg:whitespace-nowrap"
              >
                <Icon className="h-6 w-6 shrink-0 text-gold xs:h-7 xs:w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12" />
                <span className="text-[7px] leading-tight font-semibold tracking-tight text-ink xs:text-[8px] sm:text-[10px] sm:tracking-normal md:text-[11px] lg:text-[13px]">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
