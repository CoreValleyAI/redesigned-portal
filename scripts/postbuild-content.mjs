#!/usr/bin/env node
/**
 * Runs after `next build` (postbuild).
 *
 *  · Removes the `__none` placeholder pages that keep empty dynamic routes
 *    (no posts yet, no tags yet…) from breaking `output: export`.
 *  · Checks that every published job and live post has a page in out/, and
 *    that the feed and search index exist, so a content problem fails the
 *    deploy instead of shipping a broken careers page.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, process.env.NEXT_DIST_DIR ? path.join(process.env.NEXT_DIST_DIR, "..", "out") : "out");
if (!fs.existsSync(out)) {
  console.log("postbuild-content: no out/ folder (not a static export build); skipping.");
  process.exit(0);
}

let removed = 0;
const sweep = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "__none") {
        fs.rmSync(full, { recursive: true, force: true });
        removed++;
      } else sweep(full);
    } else if (e.name.startsWith("__none")) {
      fs.rmSync(full, { force: true });
      removed++;
    }
  }
};
sweep(out);

function contentDir() {
  const explicit = process.env.CONTENT_DIR?.trim();
  if (explicit) return path.resolve(root, explicit);
  if (fs.existsSync(path.join(root, "content", "manifest.json"))) return path.join(root, "content");
  if (process.env.CONTENT_FIXTURES === "1") return path.join(root, "content-fixtures");
  return null;
}

const problems = [];
const must = (rel) => {
  if (!fs.existsSync(path.join(out, rel))) problems.push(rel);
};

must("jobs/index.html");
must("jobs/general-application/index.html");
must("blog/index.html");
must("blog/rss.xml");
must("blog/search-index.json");

const dir = contentDir();
const now = (process.env.CONTENT_NOW ? new Date(process.env.CONTENT_NOW) : new Date()).toISOString();
if (dir) {
  const read = (sub) =>
    fs.existsSync(path.join(dir, sub))
      ? fs.readdirSync(path.join(dir, sub)).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, sub, f), "utf8")))
      : [];
  for (const job of read("jobs")) must(`jobs/${job.slug}/index.html`);
  for (const post of read("posts")) if (post.publishAt <= now) must(`blog/${post.slug}/index.html`);
}

if (problems.length) {
  console.error(`postbuild-content: missing from the export:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`postbuild-content: ok (${removed} placeholder${removed === 1 ? "" : "s"} removed)`);
