import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import CollectionForm from "@/components/admin/CollectionForm";

export const metadata: Metadata = {
  title: "New Collection · Admin",
  robots: { index: false, follow: false },
};

export default function NewCollectionPage() {
  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/collections" className="text-[12px] text-muted underline underline-offset-4">
        ← Collections
      </Link>
      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">New Collection</h1>

      <CollectionForm />
    </Container>
  );
}
