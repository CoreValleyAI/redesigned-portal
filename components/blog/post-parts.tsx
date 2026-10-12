/**
 * Blog building blocks: cards, byline, category tabs, pagination.
 * Isomorphic (no hooks, no fs) so the live preview can use them too.
 */
import Link from "next/link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate, mediaSrc, mediaSrcSet, objectPosition } from "@/lib/content/format";
import { key, type Author, type Category, type MediaItem, type Post } from "@/lib/content/types";

type CardPost = Pick<Post, "slug" | "title" | "excerpt" | "cover" | "publishAt"> & {
  authorInfo: Author[];
  categoryInfo: Category | null;
  minutes: number;
};

export function Byline({
  authors,
  date,
  minutes,
  media,
  size = "sm",
  link = true,
}: {
  authors: Author[];
  date: string;
  minutes: number;
  media: Map<string, MediaItem>;
  size?: "sm" | "md";
  link?: boolean;
}) {
  const avatar = size === "md" ? "size-9" : "size-7";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-500", size === "md" ? "text-[14px]" : "text-[13px]")}>
      {authors.length ? (
        <span className="flex items-center">
          {authors.map((a, i) => {
            const img = mediaSrc(a.avatar !== undefined ? media.get(key(a.avatar)) : undefined, "thumb");
            return img ? (
              <img
                key={a.slug}
                src={img.src}
                alt=""
                width={36}
                height={36}
                className={cn(avatar, "rounded-full border-2 border-[var(--surface-page,#f4f4f5)] object-cover", i > 0 && "-ml-2")}
              />
            ) : (
              <span
                key={a.slug}
                aria-hidden="true"
                className={cn(avatar, "inline-flex items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-600", i > 0 && "-ml-2")}
              >
                {a.name.slice(0, 1)}
              </span>
            );
          })}
        </span>
      ) : null}
      {authors.length ? (
        <span className="text-ink-300">
          {authors.map((a, i) => (
            <span key={a.slug}>
              {i > 0 ? (i === authors.length - 1 ? " and " : ", ") : null}
              {link ? (
                <Link href={`/blog/author/${a.slug}/`} className="hover:text-ink-100 hover:underline">
                  {a.name}
                </Link>
              ) : (
                a.name
              )}
            </span>
          ))}
        </span>
      ) : null}
      <span aria-hidden="true">·</span>
      <time dateTime={date}>{formatDate(date)}</time>
      <span aria-hidden="true">·</span>
      <span>{minutes} min read</span>
    </div>
  );
}

export function PostCard({
  post,
  media,
  variant = "grid",
}: {
  post: CardPost;
  media: Map<string, MediaItem>;
  variant?: "grid" | "hero" | "compact";
}) {
  const item = post.cover !== undefined ? media.get(key(post.cover)) : undefined;
  const img = mediaSrc(item, variant === "hero" ? "wide" : "card");
  const hero = variant === "hero";
  return (
    <article className={cn("group relative flex h-full flex-col", hero && "md:grid md:grid-cols-[1.25fr_1fr] md:gap-10")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.5rem] border border-line bg-zinc-900",
          hero ? "aspect-[16/10] md:aspect-auto md:min-h-[22rem]" : "aspect-[16/10]",
          variant === "compact" && "hidden",
        )}
      >
        {img ? (
          <img
            src={img.src}
            srcSet={mediaSrcSet(item)}
            sizes={hero ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
            width={img.width}
            height={img.height}
            alt=""
            loading={hero ? "eager" : "lazy"}
            decoding="async"
            style={{ objectPosition: objectPosition(item) }}
            className="zoom-media absolute inset-0 size-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="lineart absolute inset-0 opacity-60" />
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", hero ? "mt-6 md:mt-0 md:justify-center" : "mt-5")}>
        {post.categoryInfo ? (
          <p className="cv-label text-[10px]">{post.categoryInfo.name}</p>
        ) : null}
        <h3
          className={cn(
            "mt-3 font-semibold tracking-tight text-balance text-ink-100",
            hero ? "display text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05]" : "text-[1.2rem] leading-snug",
          )}
        >
          <Link href={`/blog/${post.slug}/`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className={cn("mt-3 leading-relaxed text-ink-400", hero ? "text-[16px]" : "line-clamp-3 text-[14.5px]")}>
          {post.excerpt}
        </p>
        <div className="relative z-10 mt-auto pt-5">
          <Byline authors={post.authorInfo} date={post.publishAt} minutes={post.minutes} media={media} link={false} />
        </div>
      </div>
    </article>
  );
}

export function CategoryTabs({
  categories,
  active,
}: {
  categories: { slug: string; name: string; count: number }[];
  active?: string;
}) {
  const tab = (on: boolean) =>
    cn(
      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium transition-colors duration-300",
      on
        ? "border-zinc-900 bg-zinc-900 text-white"
        : "border-line text-ink-300 hover:border-line-strong hover:text-ink-100",
    );
  return (
    <nav aria-label="Categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <Link href="/blog/" className={tab(!active)} aria-current={!active ? "page" : undefined}>
        All posts
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/blog/category/${c.slug}/`}
          className={tab(active === c.slug)}
          aria-current={active === c.slug ? "page" : undefined}
        >
          {c.name}
          <span className="font-mono text-[11px] opacity-60">{c.count}</span>
        </Link>
      ))}
    </nav>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/blog/" : `/blog/page/${n}/`);
  const btn =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-line px-3 text-[13.5px] text-ink-300 transition-colors hover:border-line-strong hover:text-ink-100";
  return (
    <nav aria-label="Pages" className="mt-14 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn} rel="prev" aria-label="Newer posts">
          <Icon name="arrow-right" size={14} className="rotate-180" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={cn(btn, n === page && "border-zinc-900 bg-zinc-900 text-white hover:text-white")}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className={btn} rel="next" aria-label="Older posts">
          <Icon name="arrow-right" size={14} />
        </Link>
      ) : null}
    </nav>
  );
}

export function PostGrid({ posts, media }: { posts: CardPost[]; media: Map<string, MediaItem> }) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} media={media} />
      ))}
    </div>
  );
}
