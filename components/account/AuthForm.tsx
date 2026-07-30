import Link from "next/link";

type Field = { name: string; label: string; type: string };

export default function AuthForm({
  title,
  intro,
  fields,
  submitLabel,
  footerText,
  footerLink,
}: {
  title: string;
  intro: string;
  fields: Field[];
  submitLabel: string;
  footerText: string;
  footerLink: { label: string; href: string };
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-center text-3xl tracking-[0.04em] uppercase">{title}</h1>
      <p className="mt-3 text-center text-sm text-muted">{intro}</p>

      <form className="mt-8 space-y-4">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] uppercase">
              {f.label}
            </span>
            <input
              name={f.name}
              type={f.type}
              required
              className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
        ))}

        <button
          type="submit"
          className="w-full bg-ink py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
        >
          {submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        {footerText}{" "}
        <Link href={footerLink.href} className="text-gold underline underline-offset-4">
          {footerLink.label}
        </Link>
      </p>
    </div>
  );
}
