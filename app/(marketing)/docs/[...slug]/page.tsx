import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage, getPages } from "@/lib/docs/content";
import { pageMetadata } from "@/lib/seo";
import { docsHref } from "@/lib/docs/href";
import { DOCS_URL } from "@/lib/site";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";

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
  return pageMetadata({
    title: `${page.title} · Docs`,
    description: page.lead || `${page.title} — CoreValley platform documentation.`,
    path: page.url,
    ...(DOCS_URL ? { canonical: docsHref(page.slug), noindex: true } : {}),
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
          { name: "Documentation", path: "/docs" },
          ...(page.section ? [{ name: page.section, path: "/docs" }] : []),
          { name: page.title, path: page.url },
        ])}
      />
      <DocArticle page={page} />
    </>
  );
}
