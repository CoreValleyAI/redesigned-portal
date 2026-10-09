/**
 * Builds the documentation site for docs.corevalley.ai into `out-docs/`.
 *
 *   npm run build:docs
 *
 * 1. `next build` with NEXT_PUBLIC_BUILD_TARGET=docs, which makes only the
 *    `*.docs.tsx` files in app/ routes (see next.config.ts), in its own build
 *    directory so it never collides with the marketing build or `next dev`.
 * 2. Checks that every page in corevalley-docs/mkdocs.yml's nav exported.
 * 3. Finishes the export for GitHub Pages: robots.txt, sitemap.xml, CNAME,
 *    .nojekyll (without it Pages drops `_next/`), and removes the marketing
 *    site's legacy redirect files from public/, which mean nothing here.
 *
 * The deploy workflow runs this and publishes `out-docs/` to the gh-pages
 * branch of CoreValleyAI/docs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const DIST = ".next-docs";
const OUT = path.resolve("out-docs");
// Its own variable: NEXT_PUBLIC_SITE_URL in the environment belongs to the marketing build.
const SITE_URL = (process.env.DOCS_SITE_URL || "https://docs.corevalley.ai").replace(/\/+$/, "");

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/* ── 1. Build ───────────────────────────────────────────────────────────── */

const build = spawnSync("npx next build", {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_BUILD_TARGET: "docs",
    NEXT_PUBLIC_SITE_URL: SITE_URL,
    // Served from the root of its own host, never under a base path.
    NEXT_PUBLIC_BASE_PATH: "",
    NEXT_DIST_DIR: DIST,
  },
});
if (build.status !== 0) fail("next build failed");

// With a custom distDir the static export lands inside it (next.config.ts).
const exported = path.resolve(DIST);
if (!fs.existsSync(path.join(exported, "index.html"))) fail(`No export at ${DIST}/index.html`);
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(exported, OUT, { recursive: true });

/* ── 2. Every nav page exported ─────────────────────────────────────────── */

// mkdocs.yml uses `!ENV` and `!!python/name:` tags; only `nav` is read.
const mkdocs = YAML.parseDocument(fs.readFileSync("corevalley-docs/mkdocs.yml", "utf8"), {
  logLevel: "silent",
});
const nav = mkdocs.toJS()?.nav;
if (!Array.isArray(nav)) fail("corevalley-docs/mkdocs.yml: no `nav` list");

const files = [];
const walk = (entries) => {
  for (const entry of entries) {
    for (const value of Object.values(entry)) {
      if (typeof value === "string") files.push(value);
      else if (Array.isArray(value)) walk(value);
    }
  }
};
walk(nav);

// Mirrors slugFromFile() in lib/docs/href.ts.
const slugOf = (file) => {
  const noExt = file.replace(/\.md$/i, "");
  return noExt === "index" ? "" : noExt.replace(/\/index$/, "");
};
const slugs = files.map(slugOf);

const missing = slugs.filter((s) => !fs.existsSync(path.join(OUT, ...(s ? s.split("/") : []), "index.html")));
if (missing.length) fail(`Docs pages missing from the export:\n  ${missing.join("\n  ")}`);

/* ── 3. Finish for GitHub Pages ─────────────────────────────────────────── */

for (const legacy of ["about.html", "contact.html", "pricing.html", "services.html", "redesigned-portal"]) {
  fs.rmSync(path.join(OUT, legacy), { recursive: true, force: true });
}

const now = new Date().toISOString();
const urls = slugs
  .map((s) => `  <url><loc>${SITE_URL}/${s ? `${s}/` : ""}</loc><lastmod>${now}</lastmod></url>`)
  .join("\n");
fs.writeFileSync(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, "CNAME"), `${new URL(SITE_URL).host}\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

console.log(`✔ ${slugs.length} docs pages exported to out-docs/ for ${SITE_URL}`);
