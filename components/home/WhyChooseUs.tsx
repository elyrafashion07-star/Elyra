import { BadgeCheck, Headphones, Lock, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { whyUs } from "@/data/site";

const icons = {
  truck: Truck,
  badge: BadgeCheck,
  headset: Headphones,
  lock: Lock,
};

export default function WhyChooseUs() {
  return (
    <section className="bg-sand py-14 sm:py-16">
      <Container>
        <SectionHeading title="Why Rakkhi" />
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons];
            return (
              <div
                key={item.title}
                className="flex flex-col items-center gap-3 rounded-xl border border-line bg-white px-5 py-8 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand">
                  <Icon className="h-5 w-5 text-gold" />
                </span>
                <h3 className="text-[13px] font-semibold tracking-[0.14em] uppercase">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
