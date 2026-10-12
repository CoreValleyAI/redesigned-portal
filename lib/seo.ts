import type { Metadata } from "next";
import { absoluteUrl, NOINDEX, SITE_NAME } from "./site";

/** The generated social card (app/opengraph-image.png, `npm run generate:brand`).
    Listed explicitly: a page-level openGraph block replaces the layout's, which
    is where Next would otherwise attach the file-based image. */
export const SOCIAL_IMAGE = {
  url: absoluteUrl("/opengraph-image.png"),
  width: 1200,
  height: 630,
  alt: "CoreValley — Nepal's sovereign AI cloud",
};

/**
 * Per-page metadata with the fields every public page should carry: a
 * canonical URL (absolute, trailing slash, base path included), a matching
 * Open Graph block, and an explicit noindex where a page must stay out of
 * search. Titles run through the root layout's template ("%s · CoreValley")
 * unless `absoluteTitle` is set.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  /** Site path, e.g. "/pricing" or "/products/on-demand". */
  path: string;
  absoluteTitle?: boolean;
  noindex?: boolean;
  /** Absolute canonical to use instead of the page's own URL (e.g. the docs
      host once the documentation lives there). */
  canonical?: string;
  /** A page-specific share image (absolute URL), e.g. a blog post's cover. */
  image?: { url: string; width: number; height: number; alt: string };
  /** Articles (blog posts) carry dates and authors in Open Graph. */
  article?: { publishedTime: string; modifiedTime: string; authors: string[]; section?: string; tags?: string[] };
  /** Extra <link rel="alternate"> feeds, e.g. the blog's RSS. */
  feeds?: { url: string; title: string }[];
}): Metadata {
  const url = opts.canonical ?? absoluteUrl(opts.path);
  const ogTitle = opts.absoluteTitle ? opts.title : `${opts.title} · ${SITE_NAME}`;
  const image = opts.image ?? SOCIAL_IMAGE;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      ...(opts.feeds?.length
        ? { types: { "application/rss+xml": opts.feeds.map((f) => ({ url: f.url, title: f.title })) } }
        : {}),
    },
    openGraph: opts.article
      ? {
          type: "article",
          url,
          title: ogTitle,
          description: opts.description,
          images: [image],
          publishedTime: opts.article.publishedTime,
          modifiedTime: opts.article.modifiedTime,
          authors: opts.article.authors,
          section: opts.article.section,
          tags: opts.article.tags,
        }
      : {
          type: "website",
          url,
          title: ogTitle,
          description: opts.description,
          images: [image],
        },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
      images: [image.url],
    },
    ...(opts.noindex || NOINDEX ? { robots: { index: false, follow: false } } : {}),
  };
}
