import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage, getPages } from "@/lib/docs/content";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";

/**
 * Every documentation page except the landing one, e.g.
 * docs.corevalley.ai/guides/quickstart/ ← corevalley-docs/docs/guides/quickstart.md.
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
  return pageMetadata({
    title: page.title,
    description: page.lead || `${page.title} — CoreValley platform documentation.`,
    path: page.url,
  });
}

export default async function DocPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug.join("/"));
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Documentation", path: "/" },
          ...(page.section ? [{ name: page.section, path: "/" }] : []),
          { name: page.title, path: page.url },
        ])}
      />
      <DocArticle page={page} />
    </>
  );
}
