import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-5 py-28 text-center">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">404</p>
      <h1 className="text-3xl sm:text-4xl">This page slipped off the tray</h1>
      <p className="max-w-md text-sm text-muted">
        The link may be old, or the piece may have sold out. Try the full catalogue instead.
      </p>
      <Link
        href="/collections/all"
        className="mt-2 bg-ink px-8 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream transition-colors hover:bg-gold"
      >
        Shop All Jewellery
      </Link>
    </Container>
  );
}
