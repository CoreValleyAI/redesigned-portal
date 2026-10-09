import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage } from "@/lib/docs/content";
import { pageMetadata } from "@/lib/seo";

/** docs.corevalley.ai/ — corevalley-docs/docs/index.md. */
export function generateMetadata() {
  const page = getPage("");
  return {
    ...pageMetadata({
      title: "Documentation",
      description:
        page?.lead ||
        "CoreValley documentation: platform guides, hardware specs, billing in NPR and support.",
      path: "/",
    }),
    title: { absolute: "Documentation · CoreValley" },
  };
}

export default function DocsIndexPage() {
  const page = getPage("");
  if (!page) notFound();
  return <DocArticle page={page} />;
}
