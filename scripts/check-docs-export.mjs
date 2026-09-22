/**
 * Verifies that a static export (`next build` with `output: "export"`)
 * contains every documentation page listed in corevalley-docs/mkdocs.yml,
 * and that the exported HTML links under the configured base path.
 *
 *   node scripts/check-docs-export.mjs [exportDir]
 *
 * exportDir defaults to `out/`, or to NEXT_DIST_DIR when that is set (with a
 * custom distDir the export lands inside it — see next.config.ts). The
 * deploy and verify workflows run this before uploading the export.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const exportDir = path.resolve(process.argv[2] ?? process.env.NEXT_DIST_DIR ?? "out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mkdocsFile = path.resolve("corevalley-docs/mkdocs.yml");

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(exportDir, "index.html"))) {
  fail(`No static export at ${exportDir} (expected index.html). Run \`npm run build\` first.`);
}

// mkdocs.yml uses `!ENV` and `!!python/name:` tags; only `nav` is read.
const doc = YAML.parseDocument(fs.readFileSync(mkdocsFile, "utf8"), { logLevel: "silent" });
const nav = doc.toJS()?.nav;
if (!Array.isArray(nav)) fail(`${mkdocsFile}: no \`nav\` list`);

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

// Mirrors slugFromFile() in lib/docs/href.ts: `guides/quickstart.md` →
// `guides/quickstart`, `index.md` → `` (the /docs/ landing page).
const slugOf = (file) => {
  const noExt = file.replace(/\.md$/i, "");
  return noExt === "index" ? "" : noExt.replace(/\/index$/, "");
};

const missing = [];
for (const file of files) {
  const slug = slugOf(file);
  const html = path.join(exportDir, "docs", ...(slug ? slug.split("/") : []), "index.html");
  if (!fs.existsSync(html)) missing.push(`${file} → ${path.relative(process.cwd(), html)}`);
}
if (missing.length) {
  fail(`Docs pages missing from the export:\n  ${missing.join("\n  ")}`);
}

// Links must carry the base path, else a project site 404s on every click.
const landing = fs.readFileSync(path.join(exportDir, "docs", "index.html"), "utf8");
const expectedHref = `href="${basePath}/docs/`;
if (!landing.includes(expectedHref)) {
  fail(
    `${path.join("docs", "index.html")} has no link matching ${expectedHref}… ` +
      `(NEXT_PUBLIC_BASE_PATH="${basePath}"). Was the export built with the same base path?`,
  );
}

console.log(
  `✔ ${files.length} docs pages exported to ${path.relative(process.cwd(), exportDir) || "."} ` +
    `(base path "${basePath}")`,
);
