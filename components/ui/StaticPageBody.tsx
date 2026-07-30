import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { StaticPage } from "@/data/pages";

export default function StaticPageBody({ page }: { page: StaticPage }) {
  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: page.title }]} />
      <div className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">{page.title}</h1>
        <span className="mt-4 block h-px w-14 bg-gold" aria-hidden />
        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{page.intro}</p>

        {page.sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl tracking-[0.04em]">{s.heading}</h2>
            <div className="mt-3 space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-[14px] leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
