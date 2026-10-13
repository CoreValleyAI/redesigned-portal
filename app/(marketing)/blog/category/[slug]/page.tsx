import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/blog-listing";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { NONE, categoriesInUse, paramsOrPlaceholder, postsInCategory } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return paramsOrPlaceholder(
    categoriesInUse().map((c) => ({ slug: c.slug })),
    "slug",
  );
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const c = categoriesInUse().find((x) => x.slug === slug);
  if (!c || slug === NONE) return {};
  return pageMetadata({
    title: `${c.name} — Blog`,
    description: c.description ?? `Posts about ${c.name.toLowerCase()} from the CoreValley blog.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const c = categoriesInUse().find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          { name: c.name, path: `/blog/category/${slug}` },
        ])}
      />
      <BlogListing
        eyebrow="Blog · category"
        title={c.name}
        lead={c.description}
        posts={postsInCategory(slug)}
        activeCategory={slug}
        media={loadContent().media}
      />
    </>
  );
}
