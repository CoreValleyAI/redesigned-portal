/**
 * A blog post's header and body. Isomorphic (no hooks, no fs): the post
 * page and the CMS live preview render the same markup.
 *
 * The header's art is the post's own contour print, drawn large: its lines
 * trace themselves in, and a light follows the pointer across them. A cover
 * image chosen in the CMS opens the article body instead.
 */
import { ContourCover } from "@/components/art/contour-cover";
import { RichText } from "@/components/content/rich-text";
import { ShareLinks } from "@/components/content/share-links";
import { DocsToc } from "@/components/docs/docs-toc";
import { AppLink } from "@/components/system/app-link";
import { mediaSrc, mediaSrcSet, objectPosition } from "@/lib/content/format";
import type { ContentHeading } from "@/lib/content/lexical";
import { key, type Author, type Category, type MediaItem, type Post, type Tag } from "@/lib/content/types";
import { Byline, toneFor } from "./post-parts";

export interface ArticlePost extends Pick<
  Post,
  "slug" | "title" | "excerpt" | "cover" | "body" | "publishAt" | "updatedAt"
> {
  authorInfo: Author[];
  categoryInfo: Category | null;
  tagInfo: Tag[];
  minutes: number;
  toc: ContentHeading[];
}

export function PostHeader({ post, media }: { post: ArticlePost; media: Map<string, MediaItem> }) {
  return (
    <header className="pt-[calc(var(--header-h)+clamp(2.5rem,6vw,5rem))]">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="type-small flex items-center gap-2 text-ink-3">
          <AppLink href="/blog/" transitionTypes={["page-up"]} className="transition-colors hover:text-ink">
            Blog
          </AppLink>
          {post.categoryInfo ? (
            <>
              <span aria-hidden="true">/</span>
              <AppLink
                href={`/blog/category/${post.categoryInfo.slug}/`}
                transitionTypes={["page-up"]}
                className="transition-colors hover:text-ink"
              >
                {post.categoryInfo.name}
              </AppLink>
            </>
          ) : null}
        </nav>
        <h1 className="type-display-2 mt-6 max-w-[18ch] text-balance">{post.title}</h1>
        <p className="type-lead measure mt-6 text-ink-2">{post.excerpt}</p>
        <div className="mt-8">
          <Byline authors={post.authorInfo} date={post.publishAt} minutes={post.minutes} media={media} size="md" />
        </div>
      </div>
      <div className="container-page mt-12 md:mt-16">
        <ContourCover
          seed={post.slug}
          tone={toneFor(post.categoryInfo)}
          draw
          light
          className="aspect-[4/3] w-full rounded-panel border border-line sm:aspect-[2/1] lg:aspect-[12/5]"
        />
      </div>
    </header>
  );
}

export function PostBody({ post, media, url }: { post: ArticlePost; media: Map<string, MediaItem>; url: string }) {
  const toc = post.toc.filter((h): h is ContentHeading & { depth: 2 | 3 } => h.depth <= 3);
  const item = post.cover !== undefined ? media.get(key(post.cover)) : undefined;
  const cover = mediaSrc(item, "wide");
  return (
    <div className="container-page">
      <div className="grid gap-12 py-14 md:py-20 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          {cover && item ? (
            <figure className="mx-auto mb-12 max-w-[44rem]">
              <img
                src={cover.src}
                srcSet={mediaSrcSet(item)}
                sizes="(min-width: 768px) 44rem, 100vw"
                width={cover.width}
                height={cover.height}
                alt={item.alt}
                decoding="async"
                style={{ objectPosition: objectPosition(item) }}
                className="aspect-[16/10] w-full rounded-panel border border-line object-cover"
              />
              {item.caption || item.credit ? (
                <figcaption className="type-caption mt-3 text-ink-3">
                  {[item.caption, item.credit].filter(Boolean).join(" · ")}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <RichText state={post.body} media={media} className="prose-article mx-auto max-w-[44rem]" />

          <div className="mx-auto mt-16 flex max-w-[44rem] flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            {post.tagInfo.length ? (
              <ul className="flex flex-wrap gap-2">
                {post.tagInfo.map((t) => (
                  <li key={t.slug}>
                    <AppLink
                      href={`/blog/tag/${t.slug}/`}
                      className="type-small inline-flex min-h-9 items-center rounded-pill border border-line px-3.5 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                    >
                      #{t.name}
                    </AppLink>
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <ShareLinks url={url} title={post.title} />
          </div>
        </div>
        {toc.length > 1 ? <DocsToc headings={toc} /> : null}
      </div>
    </div>
  );
}

export function AuthorBios({ authors, media }: { authors: Author[]; media: Map<string, MediaItem> }) {
  const withBio = authors.filter((a) => a.bio);
  if (!withBio.length) return null;
  return (
    <div className="mx-auto flex max-w-[44rem] flex-col gap-4">
      {withBio.map((a) => {
        const img = mediaSrc(a.avatar !== undefined ? media.get(key(a.avatar)) : undefined, "thumb");
        return (
          <div key={a.slug} className="flex gap-4 rounded-panel border border-line bg-bg-raised p-6">
            {img ? (
              <img src={img.src} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full object-cover" />
            ) : null}
            <div className="flex flex-col gap-1">
              <p className="type-body font-semibold text-ink">
                <AppLink href={`/blog/author/${a.slug}/`} className="underline-offset-4 hover:underline">
                  {a.name}
                </AppLink>
                {a.title ? <span className="font-normal text-ink-3"> · {a.title}</span> : null}
              </p>
              <p className="type-small text-ink-2">{a.bio}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
