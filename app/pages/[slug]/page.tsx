import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StaticPageBody from "@/components/ui/StaticPageBody";
import { infoPages } from "@/data/pages";

export function generateStaticParams() {
  return infoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = infoPages.find((p) => p.slug === slug);
  if (!page) return { title: "Page not found" };
  return { title: page.title, description: page.intro };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = infoPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return <StaticPageBody page={page} />;
}
