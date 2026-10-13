import { PageHero, TitledSection as Section } from "@/components/system/page-hero";
import { BlogSearch } from "./blog-search";
import { CategoryTabs, Pagination, PostCard, PostGrid } from "./post-parts";
import { categoriesInUse, type PostView } from "@/lib/content/posts";
import type { MediaItem } from "@/lib/content/types";

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
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={lead}>
        {children}
      </PageHero>
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CategoryTabs categories={categories} active={activeCategory} />
          <BlogSearch className="shrink-0 self-start md:self-auto" />
        </div>

        {hero ? (
          <div className="mt-12 border-b border-line pb-14">
            <PostCard post={hero} media={media} variant="hero" />
          </div>
        ) : null}

        {posts.length ? (
          <div className="mt-12">
            <PostGrid posts={posts} media={media} />
          </div>
        ) : !hero ? (
          <div className="mt-12 rounded-[2rem] border border-dashed border-line px-6 py-16 text-center">
            <p className="text-xl font-semibold tracking-tight text-ink-100">The first posts are on their way.</p>
            <p className="mt-2 text-[15px] text-ink-400">Engineering notes and company news from Kathmandu.</p>
          </div>
        ) : null}

        <Pagination page={page} pages={pages} />
      </Section>
    </>
  );
}
