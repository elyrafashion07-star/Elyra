import { Play } from "lucide-react";
import Container from "@/components/ui/Container";
import FixedImage from "@/components/ui/FixedImage";

export default function VideoSection() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-xl border border-line">
          {/* Poster 1280 × 720 — swap for a <video poster> using the same box. */}
          <FixedImage slot="videoPoster" alt="Rakkhi brand film" label="Brand video poster" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/25 text-center text-cream">
            <button
              type="button"
              aria-label="Play brand film"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/90 text-ink transition-transform hover:scale-105"
            >
              <Play className="ml-1 h-6 w-6 fill-ink" />
            </button>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">
              Made by hand, in small batches
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
