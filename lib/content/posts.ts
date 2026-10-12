/**
 * The blog's view of published content. Server-only.
 *
 * A post is live once an approver has published it in the CMS AND its
 * publishAt time has passed (by this build's clock). Scheduled posts are in
 * the content repo early; the site's 15-minute cron rebuilds when one is due.
 */
import { headings, plainText, readingMinutes, type ContentHeading } from "./lexical";
import { contentNow, loadContent } from "./source";
import { key, type Author, type Category, type Post, type Tag } from "./types";

export const PAGE_SIZE = 9;

export interface PostView extends Post {
  authorInfo: Author[];
  categoryInfo: Category | null;
  tagInfo: Tag[];
  minutes: number;
  words: number;
  toc: ContentHeading[];
}

function view(p: Post): PostView {
  const store = loadContent();
  const text = plainText(p.body);
  return {
    ...p,
    authorInfo: p.authors.map((a) => store.authors.get(key(a))).filter((a): a is Author => Boolean(a)),
    categoryInfo: p.category !== undefined ? (store.categories.get(key(p.category)) ?? null) : null,
    tagInfo: p.tags.map((t) => store.tags.get(key(t))).filter((t): t is Tag => Boolean(t)),
    minutes: readingMinutes(p.body),
    words: text.split(/\s+/).filter(Boolean).length,
    toc: headings(p.body),
  };
}

/** Live posts, newest first. */
export function livePosts(): PostView[] {
  const now = contentNow();
  return loadContent()
    .posts.filter((p) => p.publishAt <= now)
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt))
    .map(view);
}

export function postBySlug(slug: string): PostView | undefined {
  return livePosts().find((p) => p.slug === slug);
}

/** Featured posts by rank, then newest; falls back to the latest post. */
export function featuredPosts(limit = 3): PostView[] {
  const all = livePosts();
  const featured = all
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || b.publishAt.localeCompare(a.publishAt));
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

/** Manual picks first, then the posts sharing the most tags (and the category). */
export function relatedPosts(post: PostView, limit = 3): PostView[] {
  const all = livePosts().filter((p) => p.slug !== post.slug);
  const manual = post.relatedPosts
    .map((id) => all.find((p) => key(p.id) === key(id)))
    .filter((p): p is PostView => Boolean(p));
  const tags = new Set(post.tags.map(key));
  const scored = all
    .filter((p) => !manual.includes(p))
    .map((p) => ({
      p,
      score:
        p.tags.filter((t) => tags.has(key(t))).length * 2 +
        (post.category !== undefined && key(p.category) === key(post.category) ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.publishAt.localeCompare(a.p.publishAt))
    .map((x) => x.p);
  const fill = all.filter((p) => !manual.includes(p) && !scored.includes(p));
  return [...manual, ...scored, ...fill].slice(0, limit);
}

/** The posts either side of `post` in date order (older = next to read). */
export function neighbours(post: PostView): { newer: PostView | null; older: PostView | null } {
  const all = livePosts();
  const i = all.findIndex((p) => p.slug === post.slug);
  return { newer: i > 0 ? all[i - 1]! : null, older: i >= 0 && i < all.length - 1 ? all[i + 1]! : null };
}

export function pageCount(total = livePosts().length): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function postsPage(page: number): PostView[] {
  return livePosts().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export function categoriesInUse(): (Category & { count: number })[] {
  const counts = new Map<string, number>();
  for (const p of livePosts()) if (p.category !== undefined) counts.set(key(p.category), (counts.get(key(p.category)) ?? 0) + 1);
  return [...loadContent().categories.values()]
    .filter((c) => counts.has(key(c.id)))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((c) => ({ ...c, count: counts.get(key(c.id))! }));
}

export function tagsInUse(): (Tag & { count: number })[] {
  const counts = new Map<string, number>();
  for (const p of livePosts()) for (const t of p.tags) counts.set(key(t), (counts.get(key(t)) ?? 0) + 1);
  return [...loadContent().tags.values()]
    .filter((t) => counts.has(key(t.id)))
    .map((t) => ({ ...t, count: counts.get(key(t.id))! }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function authorsInUse(): Author[] {
  const ids = new Set(livePosts().flatMap((p) => p.authors.map(key)));
  return [...loadContent().authors.values()].filter((a) => ids.has(key(a.id)));
}

export const postsInCategory = (slug: string) => livePosts().filter((p) => p.categoryInfo?.slug === slug);
export const postsWithTag = (slug: string) => livePosts().filter((p) => p.tagInfo.some((t) => t.slug === slug));
export const postsByAuthor = (slug: string) => livePosts().filter((p) => p.authorInfo.some((a) => a.slug === slug));

/** For the client-side search: small, fetched only when search opens. */
export function searchIndex() {
  return livePosts().map((p) => ({
    id: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.categoryInfo?.name ?? "",
    tags: p.tagInfo.map((t) => t.name).join(" "),
    authors: p.authorInfo.map((a) => a.name).join(" "),
    text: plainText(p.body).slice(0, 4000),
    date: p.publishAt,
  }));
}

/** /blog shows the top featured post large, then the rest in pages of PAGE_SIZE. */
export function blogIndex(page: number) {
  const hero = featuredPosts(1)[0] ?? null;
  const rest = livePosts().filter((p) => p.slug !== hero?.slug);
  const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  return {
    hero: page === 1 ? hero : null,
    posts: rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    pages,
  };
}

/** Static params that are never empty: an empty list breaks `output: export`. */
export const NONE = "__none";
export function paramsOrPlaceholder<T extends Record<string, string>>(list: T[], keyName: keyof T): T[] {
  return list.length ? list : [{ [keyName]: NONE } as T];
}
