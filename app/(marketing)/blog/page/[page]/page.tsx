import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/blog-listing";
import { NONE, blogIndex, paramsOrPlaceholder } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

/** Pages 2…n; page 1 is /blog itself. */
export function generateStaticParams() {
  const { pages } = blogIndex(1);
  return paramsOrPlaceholder(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ page: String(i + 2) })),
    "page",
  );
}

type Params = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Params) {
  const { page } = await params;
  if (page === NONE) return {};
  return pageMetadata({
    title: `Blog — page ${page}`,
    description: "Older posts from the CoreValley blog.",
    path: `/blog/page/${page}`,
  });
}

export default async function BlogPageN({ params }: Params) {
  const { page } = await params;
  const n = Number(page);
  if (page === NONE || !Number.isInteger(n) || n < 2) notFound();
  const { posts, pages } = blogIndex(n);
  if (!posts.length) notFound();
  return (
    <BlogListing
      eyebrow={`Blog · page ${n}`}
      title="Notes from Kathmandu."
      posts={posts}
      page={n}
      pages={pages}
      media={loadContent().media}
    />
  );
}
