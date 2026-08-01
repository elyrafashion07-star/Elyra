import { Suspense } from "react";
import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SearchResults from "@/components/collection/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Elyrafashion catalogue.",
};

export default function SearchPage() {
  return (
    <Container className="py-10">
      <Breadcrumbs trail={[{ label: "Search" }]} />
      <h1 className="mt-4 text-3xl tracking-[0.04em] uppercase sm:text-4xl">Search</h1>
      <Suspense fallback={<p className="mt-10 text-sm text-muted">Loading…</p>}>
        <SearchResults />
      </Suspense>
    </Container>
  );
}
