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
  return clean ? `/docs/${clean}/` : "/docs/";
}

/** `guides/quickstart.md` → `guides/quickstart`; `index.md` → `""`. */
export function slugFromFile(file: string): string {
  const noExt = file.replace(/\.md$/i, "").replace(/\\/g, "/");
  if (noExt === "index") return "";
  return noExt.replace(/\/index$/, "");
}
