import { Page } from "@/components/motion/page";
import { Kicker } from "@/components/system/kicker";
import { categoriesInUse, type PostView } from "@/lib/content/posts";
import type { MediaItem } from "@/lib/content/types";
import { BlogSearch } from "./blog-search";
import { CategoryTabs, Pagination, PostCard, PostGrid } from "./post-parts";

/** The shared shape of /blog, its later pages, and category/tag/author pages. */
export function BlogListing({
  eyebrow,
  title,
  lead,
  hero,
  posts,
  page = 1,
  pages = 1,
  activeCategory,
  media,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  hero?: PostView | null;
  posts: PostView[];
  page?: number;
  pages?: number;
  activeCategory?: string;
  media: Map<string, MediaItem>;
  children?: React.ReactNode;
}) {
  const categories = categoriesInUse();
  return (
    <Page>
      <section className="pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>{eyebrow}</Kicker>
            <h1 className="type-display-2 text-balance">{title}</h1>
            {lead ? <p className="type-lead measure text-ink-2">{lead}</p> : null}
            {children}
          </div>
        </div>
      </section>

      <section aria-label="Posts" className="pb-[var(--section-y)]">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CategoryTabs categories={categories} active={activeCategory} />
            <BlogSearch className="shrink-0 self-start md:self-auto" />
          </div>

          {hero ? (
            <div className="mt-12 border-b border-line pb-16">
              <PostCard post={hero} media={media} variant="hero" />
            </div>
          ) : null}

          {posts.length ? (
            <div className="mt-14">
              <PostGrid posts={posts} media={media} />
            </div>
          ) : !hero ? (
            <div className="mt-12 rounded-panel border border-dashed border-line px-6 py-16 text-center">
              <p className="type-title-3">The first posts are on their way.</p>
              <p className="type-body mt-2 text-ink-2">Engineering notes and company news from Kathmandu.</p>
            </div>
          ) : null}

          <Pagination page={page} pages={pages} />
        </div>
      </section>
    </Page>
  );
}
