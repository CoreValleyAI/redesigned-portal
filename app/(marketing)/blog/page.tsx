import { BlogListing } from "@/components/blog/blog-listing";
import { blogIndex } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export function generateMetadata() {
  return pageMetadata({
    title: "Blog — engineering and company notes",
    description:
      "Notes from CoreValley in Kathmandu: how we build Nepal’s GPU cloud, from MIG slicing and scheduling to power, cooling and data residency.",
    path: "/blog",
    feeds: [{ url: absoluteUrl("/blog/rss.xml"), title: "CoreValley blog" }],
  });
}

export default function BlogPage() {
  const { hero, posts, pages } = blogIndex(1);
  return (
    <BlogListing
      eyebrow="Blog"
      title="Notes from Kathmandu."
      lead="How we build Nepal’s GPU cloud — the engineering, the infrastructure and the company behind it."
      hero={hero}
      posts={posts}
      page={1}
      pages={pages}
      media={loadContent().media}
    />
  );
}
