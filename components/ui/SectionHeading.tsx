export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  as?: "h1" | "h2";
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col ${alignment} gap-3`}>
      <Tag className="text-2xl tracking-[0.06em] uppercase sm:text-3xl lg:text-[34px]">{title}</Tag>
      <span className="h-px w-14 bg-gold" aria-hidden />
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">{subtitle}</p>
      ) : null}
    </div>
  );
}
