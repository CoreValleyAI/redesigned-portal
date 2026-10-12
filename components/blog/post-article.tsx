/**
 * A blog post's header and body. Isomorphic (no hooks, no fs): the post
 * page and the CMS live preview render the same markup.
 */
import Link from "next/link";
import { RichText } from "@/components/content/rich-text";
import { ShareLinks } from "@/components/content/share-links";
import { DocsToc } from "@/components/docs/docs-toc";
import { mediaSrc, mediaSrcSet, objectPosition } from "@/lib/content/format";
import type { ContentHeading } from "@/lib/content/lexical";
import { key, type Author, type Category, type MediaItem, type Post, type Tag } from "@/lib/content/types";
import { Byline } from "./post-parts";

export interface ArticlePost extends Pick<Post, "slug" | "title" | "excerpt" | "cover" | "body" | "publishAt" | "updatedAt"> {
  authorInfo: Author[];
  categoryInfo: Category | null;
  tagInfo: Tag[];
  minutes: number;
  toc: ContentHeading[];
}

export function PostHeader({ post, media }: { post: ArticlePost; media: Map<string, MediaItem> }) {
  const item = post.cover !== undefined ? media.get(key(post.cover)) : undefined;
  const cover = mediaSrc(item, "wide");
  return (
    <header className="shell">
      <div className="px-6 pt-36 md:px-14 md:pt-44">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-ink-500">
          <Link href="/blog/" className="hover:text-ink-100">
            Blog
          </Link>
          {post.categoryInfo ? (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/blog/category/${post.categoryInfo.slug}/`} className="hover:text-ink-100">
                {post.categoryInfo.name}
              </Link>
            </>
          ) : null}
        </nav>
        <h1 className="display mt-6 max-w-[22ch] text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.02] text-balance text-ink-100">
          {post.title}
        </h1>
        <p className="mt-6 max-w-[60ch] text-[clamp(1.05rem,1.35vw,1.25rem)] leading-relaxed font-light text-pretty text-ink-400">
          {post.excerpt}
        </p>
        <div className="mt-8">
          <Byline authors={post.authorInfo} date={post.publishAt} minutes={post.minutes} media={media} size="md" />
        </div>
        {cover && item ? (
          <figure className="mt-12">
            <img
              src={cover.src}
              srcSet={mediaSrcSet(item)}
              sizes="100vw"
              width={cover.width}
              height={cover.height}
              alt={item.alt}
              decoding="async"
              fetchPriority="high"
              style={{ objectPosition: objectPosition(item) }}
              className="aspect-[21/9] w-full rounded-[2rem] border border-line object-cover"
            />
            {item.caption || item.credit ? (
              <figcaption className="mt-3 text-[13px] text-ink-500">
                {[item.caption, item.credit].filter(Boolean).join(" · ")}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </header>
  );
}

export function PostBody({
  post,
  media,
  url,
}: {
  post: ArticlePost;
  media: Map<string, MediaItem>;
  url: string;
}) {
  const toc = post.toc.filter((h): h is ContentHeading & { depth: 2 | 3 } => h.depth <= 3);
  return (
    <div className="shell">
      <div className="grid gap-12 px-6 py-14 md:px-14 md:py-20 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <RichText state={post.body} media={media} className="mx-auto max-w-[72ch] text-[1.0625rem]" />

          <div className="mx-auto mt-14 flex max-w-[72ch] flex-col gap-6 border-t border-line pt-8 text-[1.0625rem] sm:flex-row sm:items-center sm:justify-between">
            {post.tagInfo.length ? (
              <ul className="flex flex-wrap gap-2">
                {post.tagInfo.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/blog/tag/${t.slug}/`}
                      className="inline-flex min-h-8 items-center rounded-full border border-line px-3 text-[13px] text-ink-300 transition-colors hover:border-line-strong hover:text-ink-100"
                    >
                      #{t.name}
                    </Link>
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
    <div className="mx-auto flex max-w-[72ch] flex-col gap-4 text-[1.0625rem]">
      {withBio.map((a) => {
        const img = mediaSrc(a.avatar !== undefined ? media.get(key(a.avatar)) : undefined, "thumb");
        return (
          <div key={a.slug} className="flex gap-4 rounded-2xl border border-line bg-surface-card p-5">
            {img ? (
              <img src={img.src} alt="" width={56} height={56} className="size-14 shrink-0 rounded-full object-cover" />
            ) : null}
            <div>
              <p className="text-[15px] font-semibold text-ink-100">
                <Link href={`/blog/author/${a.slug}/`} className="hover:underline">
                  {a.name}
                </Link>
                {a.title ? <span className="font-normal text-ink-500"> · {a.title}</span> : null}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-400">{a.bio}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
