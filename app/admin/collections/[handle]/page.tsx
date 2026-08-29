import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import Container from "@/components/ui/Container";
import CollectionForm from "@/components/admin/CollectionForm";
import { deleteCollection } from "@/app/admin/collections/actions";
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
        ← Collections
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[0.04em] uppercase sm:text-4xl">Edit Collection</h1>
          <Link
            href={`/collections/${collection.handle}`}
            className="mt-2 inline-block text-[12px] text-muted underline underline-offset-4 hover:text-gold"
          >
            View on store →
          </Link>
        </div>

        {/* Products tagged with this only lose the tag — none of them are
            deleted, and none of the past orders change. */}
        <form action={deleteCollection}>
          <input type="hidden" name="handle" value={collection.handle} />
          <button
            type="submit"
            className="flex items-center gap-2 border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:border-red-300 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>

      <CollectionForm collection={collection} />
    </Container>
  );
}
