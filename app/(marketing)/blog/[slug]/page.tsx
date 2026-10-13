import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Icon } from "@/components/ui";
import { TitledSection as Section } from "@/components/system/page-hero";
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
    image:
      img && item ? { url: absoluteMedia(img.src), width: img.width, height: img.height, alt: item.alt } : undefined,
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
    <>
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

      <div className="shell px-6 md:px-14">
        <AuthorBios authors={post.authorInfo} media={media} />
        {newer || older ? (
          <nav
            aria-label="More posts"
            className="mx-auto mt-10 grid max-w-[72ch] gap-3 text-[1.0625rem] sm:grid-cols-2"
          >
            {older ? (
              <Link
                href={`/blog/${older.slug}/`}
                className="rounded-2xl border border-line p-5 transition-colors hover:border-line-strong"
              >
                <span className="cv-label text-[10px]">Previous</span>
                <span className="mt-2 block text-[15px] font-medium text-ink-100">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link
                href={`/blog/${newer.slug}/`}
                className="rounded-2xl border border-line p-5 text-right transition-colors hover:border-line-strong"
              >
                <span className="cv-label text-[10px]">Next</span>
                <span className="mt-2 block text-[15px] font-medium text-ink-100">{newer.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>

      {related.length ? (
        <Section eyebrow="Keep reading" title="Related posts.">
          <PostGrid posts={related} media={media} />
        </Section>
      ) : null}

      <Section>
        <div className="flex flex-col items-start gap-6 border-t border-line pt-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[46ch]">
            <h2 className="type-title-1">Run your model in Nepal.</h2>
            <p className="type-lead mt-3 text-ink-2">
              Tell us what you want to run, and we will plan the capacity with you.
            </p>
          </div>
          <ButtonLink href="/contact" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
            Request access
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
