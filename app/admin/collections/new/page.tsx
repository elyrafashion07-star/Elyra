import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import CollectionForm from "@/components/admin/CollectionForm";
import { GROUPS } from "@/lib/collectionGroups";

export const metadata: Metadata = {
  title: "New Collection · Admin",
  robots: { index: false, follow: false },
};

export default async function NewCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  // Only a known group is honoured; anything else falls back to Category.
  const chosen = GROUPS.find((g) => g.value === group) ?? GROUPS[0];

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/collections" className="text-[12px] text-muted underline underline-offset-4">
        ← Categories &amp; Collections
      </Link>
      <h1 className="mt-3 text-3xl tracking-[0.04em] uppercase sm:text-4xl">New {chosen.label}</h1>

      <CollectionForm defaultGroup={chosen.value} />
    </Container>
  );
}
