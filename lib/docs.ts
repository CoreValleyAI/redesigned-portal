/**
 * Links into the documentation site.
 *
 * The docs are a separate MkDocs build (see corevalley-docs/) that lands in
 * public/docs/ and ships inside the static export at /docs/. They are not
 * Next.js routes, so links to them must be plain <a> tags — a <Link> would
 * attempt a client-side navigation, fail, and only then fall back to a full
 * load — and they must carry the GitHub Pages base path themselves, since
 * only <Link> prefixes it automatically.
 *
 * `next dev` does not serve public/docs/index.html at /docs/, so
 * .env.development points NEXT_PUBLIC_DOCS_URL at `mkdocs serve`
 * (`npm run docs:dev`). Production leaves it unset and uses the export path.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROOT = (process.env.NEXT_PUBLIC_DOCS_URL || `${BASE}/docs`).replace(
  /\/+$/,
  "",
);

/** `docsUrl("guides/quickstart")` → `/docs/guides/quickstart/`. */
export function docsUrl(path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${ROOT}/${clean}/` : `${ROOT}/`;
}
