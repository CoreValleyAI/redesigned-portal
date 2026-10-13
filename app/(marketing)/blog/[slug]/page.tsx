import { notFound } from "next/navigation";
import { Page } from "@/components/motion/page";
import { AppLink } from "@/components/system/app-link";
import { Cta } from "@/components/system/cta";
import { SectionHead } from "@/components/system/section";
import { AuthorBios, PostBody, PostHeader } from "@/components/blog/post-article";
import { PostGrid } from "@/components/blog/post-parts";
import { JsonLd, blogPostingJsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { mediaSrc } from "@/lib/content/format";
import { NONE, livePosts, neighbours, paramsOrPlaceholder, postBySlug, relatedPosts } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { key } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return paramsOrPlaceholder(
    livePosts().map((p) => ({ slug: p.slug })),
    "slug",
  );
}

type Params = { params: Promise<{ slug: string }> };

const absoluteMedia = (src: string) =>
  src.startsWith("http") ? src : absoluteUrl(src.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", ""));

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = slug === NONE ? undefined : postBySlug(slug);
  if (!post) return {};
  const { media } = loadContent();
  const imageId = post.seo.image ?? post.cover;
  const item = imageId !== undefined ? media.get(key(imageId)) : undefined;
  const img = mediaSrc(item, "wide");
  return pageMetadata({
    title: post.seo.title ?? post.title,
    description: post.seo.description ?? post.excerpt,
    path: `/blog/${post.slug}`,
    canonical: post.seo.canonical,
    noindex: post.seo.noindex,
    // The post's own image if it has one; otherwise its contour print
    // (./og.png/route.tsx), so every shared link looks like its post.
    image:
      img && item
        ? { url: absoluteMedia(img.src), width: img.width, height: img.height, alt: item.alt }
        : { url: absoluteUrl(`/blog/${post.slug}/og.png`), width: 1200, height: 630, alt: post.title },
    article: {
      publishedTime: post.publishAt,
      modifiedTime: post.updatedAt,
      authors: post.authorInfo.map((a) => a.name),
      section: post.categoryInfo?.name,
      tags: post.tagInfo.map((t) => t.name),
    },
    feeds: [{ url: absoluteUrl("/blog/rss.xml"), title: "CoreValley blog" }],
  });
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = slug === NONE ? undefined : postBySlug(slug);
  if (!post) notFound();
  const { media } = loadContent();
  const path = `/blog/${post.slug}`;
  const { newer, older } = neighbours(post);
  const related = relatedPosts(post);
  const coverItem = post.cover !== undefined ? media.get(key(post.cover)) : undefined;
  const cover = mediaSrc(coverItem, "wide");

  return (
    <Page>
      <JsonLd
        data={[
          blogPostingJsonLd({
            path,
            title: post.title,
            description: post.excerpt,
            datePublished: post.publishAt,
            dateModified: post.updatedAt,
            image: cover ? absoluteMedia(cover.src) : undefined,
            authors: post.authorInfo.map((a) => ({ name: a.name, path: `/blog/author/${a.slug}` })),
            section: post.categoryInfo?.name,
            keywords: post.tagInfo.map((t) => t.name),
            wordCount: post.words,
          }),
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            ...(post.categoryInfo
              ? [{ name: post.categoryInfo.name, path: `/blog/category/${post.categoryInfo.slug}` }]
              : []),
            { name: post.title, path },
          ]),
        ]}
      />

      <article>
        <PostHeader post={post} media={media} />
        <PostBody post={post} media={media} url={absoluteUrl(path)} />
      </article>

      <div className="container-page">
        <AuthorBios authors={post.authorInfo} media={media} />
        {newer || older ? (
          <nav aria-label="More posts" className="mx-auto mt-10 grid max-w-[44rem] gap-3 sm:grid-cols-2">
            {older ? (
              <AppLink
                href={`/blog/${older.slug}/`}
                className="flex flex-col gap-2 rounded-panel border border-line p-5 transition-colors hover:border-line-strong"
              >
                <span className="type-kicker text-ink-3">Previous</span>
                <span className="type-body font-medium text-ink">{older.title}</span>
              </AppLink>
            ) : (
              <span />
            )}
            {newer ? (
              <AppLink
                href={`/blog/${newer.slug}/`}
                className="flex flex-col gap-2 rounded-panel border border-line p-5 text-right transition-colors hover:border-line-strong"
              >
                <span className="type-kicker text-ink-3">Next</span>
                <span className="type-body font-medium text-ink">{newer.title}</span>
              </AppLink>
            ) : null}
          </nav>
        ) : null}
      </div>

      {related.length ? (
        <section aria-labelledby="related-title" className="section-y">
          <div className="container-page">
            <SectionHead id="related-title" kicker="Keep reading" title="Related posts." size="title-2" />
            <div className="mt-10">
              <PostGrid posts={related} media={media} />
            </div>
          </div>
        </section>
      ) : null}

      <Cta
        title="Run your model in Nepal."
        lead="Tell us what you want to run, and we will plan the capacity with you."
        action={{ href: "/contact", label: "Request access" }}
      />
    </Page>
  );
}
