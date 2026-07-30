import Container from "@/components/ui/Container";

export default function Newsletter() {
  return (
    <section className="py-14 sm:py-16">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl tracking-[0.06em] uppercase sm:text-3xl">Join Our Mailing List</h2>
          <span className="mx-auto mt-3 block h-px w-14 bg-gold" aria-hidden />
          <p className="mt-4 text-sm text-muted">
            Early access to new drops, restock alerts and subscriber-only offers. One email a fortnight,
            never more.
          </p>
          <form className="mx-auto mt-6 flex max-w-md">
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
              className="min-w-0 flex-1 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase text-cream transition-colors hover:bg-gold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
