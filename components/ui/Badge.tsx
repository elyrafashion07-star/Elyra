const styles: Record<string, string> = {
  NEW: "bg-ink text-cream",
  BESTSELLER: "bg-gold text-white",
  LIMITED: "bg-sale text-white",
  SALE: "bg-sale text-white",
  "SOLD OUT": "bg-muted text-white",
};

export default function Badge({ label }: { label: string }) {
  return (
    <span
      className={`inline-block max-w-full truncate px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] uppercase sm:px-2 sm:py-1 sm:text-[10px] sm:tracking-[0.14em] ${styles[label] ?? "bg-ink text-cream"}`}
    >
      {label}
    </span>
  );
}
