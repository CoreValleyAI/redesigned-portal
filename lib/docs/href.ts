import { DOCS_URL, IS_DOCS_BUILD } from "@/lib/site";

/**
 * Route for a documentation page. Pure — safe in client components.
 *
 *   docs build:  docsHref("guides/quickstart") → "/guides/quickstart/"
 *   main build:  docsHref("guides/quickstart") → "https://docs.corevalley.ai/guides/quickstart/"
 *
 * The docs site (NEXT_PUBLIC_BUILD_TARGET=docs) serves the pages from its
 * root, so there these are routes for <Link>. The marketing site has no docs
 * routes and links to the docs host. The trailing slash matches
 * `trailingSlash: true` in next.config.ts.
 */
export function docsHref(slug = ""): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const path = clean ? `/${clean}/` : "/";
  return IS_DOCS_BUILD ? path : `${DOCS_URL}${path}`;
}

/** `guides/quickstart.md` → `guides/quickstart`; `index.md` → `""`. */
export function slugFromFile(file: string): string {
  const noExt = file.replace(/\.md$/i, "").replace(/\\/g, "/");
  if (noExt === "index") return "";
  return noExt.replace(/\/index$/, "");
}
