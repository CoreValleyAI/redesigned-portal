import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage } from "@/lib/docs/content";

/** `/docs/` — corevalley-docs/docs/index.md. */
export function generateMetadata() {
  const page = getPage("");
  return {
    title: "Documentation",
    description:
      page?.lead ||
      "CoreValley documentation: platform guides, hardware specs, billing in NPR and support.",
  };
}

export default function DocsIndexPage() {
  const page = getPage("");
  if (!page) notFound();
  return <DocArticle page={page} />;
}
