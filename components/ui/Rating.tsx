import { Star } from "lucide-react";

export default function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
      <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-hidden />
      <span className="font-medium">{value.toFixed(1)}</span>
      {/* No count on a product nobody has reviewed yet — "(0)" beside 4.6 reads
          as a bug rather than as an honest zero. */}
      {count ? <span className="text-muted">({count})</span> : null}
    </span>
  );
}
