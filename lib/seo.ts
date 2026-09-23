import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "./site";

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
  /** Site path, e.g. "/pricing" or "/products/gpu-pods". */
  path: string;
  absoluteTitle?: boolean;
  noindex?: boolean;
  /** Absolute canonical to use instead of the page's own URL (e.g. the docs
      host once the documentation lives there). */
  canonical?: string;
}): Metadata {
  const url = opts.canonical ?? absoluteUrl(opts.path);
  const ogTitle = opts.absoluteTitle ? opts.title : `${opts.title} · ${SITE_NAME}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: ogTitle,
      description: opts.description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
      images: [SOCIAL_IMAGE.url],
    },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
