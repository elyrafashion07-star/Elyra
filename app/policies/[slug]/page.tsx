import { notFound } from "next/navigation";
import type { Metadata } from "next";
import StaticPageBody from "@/components/ui/StaticPageBody";
import { policyPages } from "@/data/pages";

export function generateStaticParams() {
  return policyPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = policyPages.find((p) => p.slug === slug);
  if (!page) return { title: "Page not found" };
  return { title: page.title, description: page.intro };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = policyPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return <StaticPageBody page={page} />;
}
