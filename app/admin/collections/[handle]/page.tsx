import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import CollectionForm from "@/components/admin/CollectionForm";
import DeleteCollectionButton from "@/components/admin/DeleteCollectionButton";
import { groupLabel } from "@/lib/collectionGroups";
import { getCollection } from "@/lib/collections";

export const metadata: Metadata = {
  title: "Edit Collection · Admin",
  robots: { index: false, follow: false },
};

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <Link href="/admin/collections" className="text-[12px] text-muted underline underline-offset-4">
        ← Categories &amp; Collections
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Edit {groupLabel(collection.group)}</h1>
          <Link
            href={`/collections/${collection.handle}`}
            className="mt-2 inline-block text-[12px] text-muted underline underline-offset-4 hover:text-gold"
          >
            View on store →
          </Link>
        </div>

        {/* Products tagged with this only lose the tag — none of them are
            deleted, and none of the past orders change. */}
        <DeleteCollectionButton handle={collection.handle} title={collection.title} />
      </div>

      <CollectionForm collection={collection} />
    </Container>
  );
}
