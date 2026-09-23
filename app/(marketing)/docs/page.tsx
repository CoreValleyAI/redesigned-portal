import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage } from "@/lib/docs/content";
import { pageMetadata } from "@/lib/seo";
import { docsHref } from "@/lib/docs/href";
import { DOCS_URL } from "@/lib/site";

/** `/docs/` — corevalley-docs/docs/index.md. */
export function generateMetadata() {
  const page = getPage("");
  return pageMetadata({
    title: "Documentation",
    description:
      page?.lead ||
      "CoreValley documentation: platform guides, hardware specs, billing in NPR and support.",
    path: "/docs",
    // Once the docs live on docs.corevalley.ai that copy is canonical and
    // this one only redirects there (see the docs layout).
    ...(DOCS_URL ? { canonical: docsHref(), noindex: true } : {}),
  });
}

export default function DocsIndexPage() {
  const page = getPage("");
  if (!page) notFound();
  return <DocArticle page={page} />;
}
