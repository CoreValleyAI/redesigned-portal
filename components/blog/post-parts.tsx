/**
 * Blog building blocks: cards, byline, category tabs, pagination.
 * Isomorphic (no hooks, no fs) so the live preview can use them too.
 *
 * Every post's art is its own contour print, drawn from its slug and toned
 * by its category (components/art/contour-cover.tsx): the blog has a look
 * of its own and no stock photography. A cover image chosen in the CMS
 * appears inside the post itself, and in its link previews.
 */
import { ContourCover, type ContourTone } from "@/components/art/contour-cover";
import { AppLink } from "@/components/system/app-link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate, mediaSrc } from "@/lib/content/format";
import { key, type Author, type Category, type MediaItem, type Post } from "@/lib/content/types";

type CardPost = Pick<Post, "slug" | "title" | "excerpt" | "cover" | "publishAt"> & {
  authorInfo: Author[];
  categoryInfo: Category | null;
  minutes: number;
};

const TONES: ContourTone[] = ["hydro", "glow-2", "glow-3"];

/** A category's colour in the prints: fixed for the two we start with,
    then a stable pick for any category an editor adds. */
export function toneFor(category: Pick<Category, "slug"> | null | undefined): ContourTone {
  const slug = category?.slug ?? "";
  if (slug === "engineering" || !slug) return "hydro";
  if (slug === "company") return "glow-2";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}

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
    <div className="type-small flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-3">
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
                className={cn(avatar, "rounded-full border-2 border-bg object-cover", i > 0 && "-ml-2")}
              />
            ) : (
              <span
                key={a.slug}
                aria-hidden="true"
                className={cn(
                  avatar,
                  "inline-flex items-center justify-center rounded-full border border-line bg-bg-sunken font-mono text-[0.7rem] font-medium text-ink-2",
                  i > 0 && "-ml-2",
                )}
              >
                {a.name.slice(0, 1)}
              </span>
            );
          })}
        </span>
      ) : null}
      {authors.length ? (
        <span className="text-ink-2">
          {authors.map((a, i) => (
            <span key={a.slug}>
              {i > 0 ? (i === authors.length - 1 ? " and " : ", ") : null}
              {link ? (
                <AppLink
                  href={`/blog/author/${a.slug}/`}
                  className="underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {a.name}
                </AppLink>
              ) : (
                a.name
              )}
            </span>
          ))}
        </span>
      ) : null}
      {authors.length ? <span aria-hidden="true">·</span> : null}
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
  variant?: "grid" | "hero";
}) {
  const hero = variant === "hero";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col",
        hero && "lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-14",
      )}
    >
      <div className="relative overflow-hidden rounded-panel border border-line">
        <ContourCover
          seed={post.slug}
          tone={toneFor(post.categoryInfo)}
          light={hero}
          className="aspect-[16/10] w-full transition-transform duration-[var(--dur-spring-smooth)] ease-spring group-hover:scale-[1.035]"
        />
      </div>
      <div className={cn("flex flex-1 flex-col gap-3", hero ? "mt-7 lg:mt-0" : "mt-5")}>
        {post.categoryInfo ? <p className="type-kicker text-ink-3">{post.categoryInfo.name}</p> : null}
        <h3 className={cn("text-balance", hero ? "type-title-1" : "type-title-3")}>
          <AppLink
            href={`/blog/${post.slug}/`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {post.title}
          </AppLink>
        </h3>
        <p className={cn("text-ink-2", hero ? "type-lead" : "type-small line-clamp-3")}>{post.excerpt}</p>
        <div className={cn("relative z-10 mt-auto", hero ? "pt-4" : "pt-2")}>
          <Byline authors={post.authorInfo} date={post.publishAt} minutes={post.minutes} media={media} link={false} />
        </div>
      </div>
    </article>
  );
}

const pill = (on: boolean) =>
  cn(
    "type-small inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border px-4 font-medium transition-colors duration-[var(--dur-short)]",
    on ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
  );

export function CategoryTabs({
  categories,
  active,
}: {
  categories: { slug: string; name: string; count: number }[];
  active?: string;
}) {
  return (
    <nav aria-label="Categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <AppLink href="/blog/" className={pill(!active)} aria-current={!active ? "page" : undefined}>
        All posts
      </AppLink>
      {categories.map((c) => (
        <AppLink
          key={c.slug}
          href={`/blog/category/${c.slug}/`}
          className={pill(active === c.slug)}
          aria-current={active === c.slug ? "page" : undefined}
        >
          {c.name}
          <span className="font-mono text-[0.75em] tabular-nums opacity-60">{c.count}</span>
        </AppLink>
      ))}
    </nav>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/blog/" : `/blog/page/${n}/`);
  const btn = (on = false) => cn(pill(on), "min-w-11 justify-center px-3");
  return (
    <nav aria-label="Pages" className="mt-16 flex items-center justify-center gap-2">
      {page > 1 ? (
        <AppLink href={href(page - 1)} className={btn()} rel="prev" aria-label="Newer posts">
          <Icon name="arrow-right" size={14} className="rotate-180" />
        </AppLink>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <AppLink key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={btn(n === page)}>
          {n}
        </AppLink>
      ))}
      {page < pages ? (
        <AppLink href={href(page + 1)} className={btn()} rel="next" aria-label="Older posts">
          <Icon name="arrow-right" size={14} />
        </AppLink>
      ) : null}
    </nav>
  );
}

export function PostGrid({ posts, media }: { posts: CardPost[]; media: Map<string, MediaItem> }) {
  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <div key={p.slug} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
          <PostCard post={p} media={media} />
        </div>
      ))}
    </div>
  );
}
