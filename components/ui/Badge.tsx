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
      className={`inline-block px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${styles[label] ?? "bg-ink text-cream"}`}
    >
      {label}
    </span>
  );
}
