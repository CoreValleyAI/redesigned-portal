import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/doc-article";
import { getPage } from "@/lib/docs/content";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site";

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
  return (
    <>
      {/* The docs host's own WebSite node, which is what search engines read
          for the site name shown in results. */}
      <JsonLd
        data={{
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: `${SITE_URL}/`,
          name: "CoreValley Docs",
          inLanguage: "en",
          publisher: { "@type": "Organization", name: "CoreValley AI", url: "https://corevalley.ai/" },
        }}
      />
      <DocArticle page={page} />
    </>
  );
}
