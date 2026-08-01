import Container from "@/components/ui/Container";
import { trustIcons } from "@/components/ui/TrustIcons";
import { trustStrip } from "@/data/site";

export default function TrustStrip() {
  return (
    <section className="border-b border-line bg-cream">
      <Container>
        <ul className="flex justify-between gap-4 overflow-x-auto py-8 no-scrollbar sm:justify-center sm:gap-8 lg:gap-12">
          {trustStrip.map((item) => {
            const Icon = trustIcons[item.icon];
            // Fixed width on phones so labels wrap to two lines; from md they hug their
            // text and each sits on a single line.
            return (
              <li
                key={item.label}
                className="flex w-26 shrink-0 flex-col items-center gap-3.5 text-center sm:w-32 md:w-auto md:whitespace-nowrap"
              >
                <Icon className="h-11 w-11 text-gold sm:h-12 sm:w-12" />
                <span className="text-[14px] leading-tight font-semibold text-ink sm:text-[15px]">
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
