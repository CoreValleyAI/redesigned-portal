import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage, getPages } from "@/lib/docs/content";

/**
 * Every documentation page except the landing one, e.g.
 * /docs/guides/quickstart/ ← corevalley-docs/docs/guides/quickstart.md.
 * The set of pages is mkdocs.yml's nav, enumerated at build time.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPages()
    .filter((p) => p.slug !== "")
    .map((p) => ({ slug: p.slug.split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) return {};
  return { title: `${page.title} · Docs`, description: page.lead || undefined };
}

export default async function DocPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) notFound();
  return <DocArticle page={page} />;
}
