import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/blog-listing";
import { NONE, paramsOrPlaceholder, postsWithTag, tagsInUse } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return paramsOrPlaceholder(
    tagsInUse().map((t) => ({ slug: t.slug })),
    "slug",
  );
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const t = tagsInUse().find((x) => x.slug === slug);
  if (!t || slug === NONE) return {};
  return pageMetadata({
    title: `Posts tagged ${t.name} — Blog`,
    description: `Posts tagged ${t.name} on the CoreValley blog.`,
    path: `/blog/tag/${slug}`,
    // Thin tag pages stay out of search until they hold a few posts.
    noindex: t.count < 3,
  });
}

export default async function TagPage({ params }: Params) {
  const { slug } = await params;
  const t = tagsInUse().find((x) => x.slug === slug);
  if (!t) notFound();
  return (
    <BlogListing eyebrow="Blog · tag" title={`#${t.name}`} posts={postsWithTag(slug)} media={loadContent().media} />
  );
}
