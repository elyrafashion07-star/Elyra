import { BadgeCheck, RefreshCw, Sparkles, Truck, Wallet } from "lucide-react";
import Container from "@/components/ui/Container";
import { trustStrip } from "@/data/site";

const icons = {
  sparkles: Sparkles,
  truck: Truck,
  wallet: Wallet,
  refresh: RefreshCw,
  badge: BadgeCheck,
};

export default function TrustStrip() {
  return (
    <section className="border-y border-line bg-white">
      <Container>
        <ul className="flex gap-6 overflow-x-auto py-4 no-scrollbar sm:justify-between sm:gap-4">
          {trustStrip.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li
                key={item.label}
                className="flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-[0.1em] uppercase text-ink-soft"
              >
                <Icon className="h-4 w-4 text-gold" />
                {item.label}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
