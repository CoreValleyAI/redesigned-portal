/**
 * Route for a documentation page. Pure — safe in client components.
 *
 *   docsHref()                    → "/docs/"
 *   docsHref("guides/quickstart") → "/docs/guides/quickstart/"
 *
 * The docs are Next.js routes (app/(marketing)/docs), so use these with
 * <Link>, which adds the GitHub Pages base path itself. The trailing slash
 * matches `trailingSlash: true` in next.config.ts.
 */
export function docsHref(slug = ""): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  const path = clean ? `/docs/${clean}/` : "/docs/";
  // Once the docs live on their own host (NEXT_PUBLIC_DOCS_URL, see
  // doc_cname_readme.txt) every link goes there; the in-app route stays
  // buildable for local preview. Inlined at build time.
  const host = (process.env.NEXT_PUBLIC_DOCS_URL || "").replace(/\/+$/, "");
  return host ? `${host}${path.replace(/^\/docs/, "")}` : path;
}

/** `guides/quickstart.md` → `guides/quickstart`; `index.md` → `""`. */
export function slugFromFile(file: string): string {
  const noExt = file.replace(/\.md$/i, "").replace(/\\/g, "/");
  if (noExt === "index") return "";
  return noExt.replace(/\/index$/, "");
}
