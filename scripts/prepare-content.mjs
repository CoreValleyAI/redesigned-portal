#!/usr/bin/env node
/**
 * Runs before `next dev` and `next build` (predev / prebuild).
 *
 * Finds the published content the same way lib/content/source.ts does,
 * checks its schema version, and copies its images into public/media/ (a
 * gitignored folder) so the static export serves them at /media/files/….
 *
 *   CONTENT_DIR        explicit content checkout (CI)
 *   ./content          a local checkout
 *   ./content-fixtures sample content, in dev or with CONTENT_FIXTURES=1
 *   CONTENT_REQUIRED=1 fail if none is found
 */
import fs from "node:fs";
import path from "node:path";

const SUPPORTED_SCHEMA = 1;
const root = process.cwd();
const dev = process.argv.includes("--dev");

function resolveDir() {
  const explicit = process.env.CONTENT_DIR?.trim();
  if (explicit) return { dir: path.resolve(root, explicit), label: `CONTENT_DIR (${explicit})` };
  const local = path.join(root, "content");
  if (fs.existsSync(path.join(local, "manifest.json"))) return { dir: local, label: "./content" };
  const fixtures = process.env.CONTENT_FIXTURES === "1" || (dev && process.env.CONTENT_FIXTURES !== "0");
  if (fixtures) return { dir: path.join(root, "content-fixtures"), label: "sample fixtures" };
  return { dir: null, label: "none" };
}

const { dir, label } = resolveDir();
const out = path.join(root, "public", "media");
fs.rmSync(out, { recursive: true, force: true });

if (!dir) {
  if (process.env.CONTENT_REQUIRED === "1") {
    console.error("prepare-content: CONTENT_REQUIRED=1 but no content was found. Set CONTENT_DIR.");
    process.exit(1);
  }
  console.log("prepare-content: no content folder; building with no jobs or posts.");
  process.exit(0);
}

const manifestPath = path.join(dir, "manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error(`prepare-content: ${dir} has no manifest.json.`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.schemaVersion > SUPPORTED_SCHEMA) {
  console.error(`prepare-content: content schema v${manifest.schemaVersion} is newer than supported v${SUPPORTED_SCHEMA}.`);
  process.exit(1);
}

const files = path.join(dir, "media", "files");
let copied = 0;
if (fs.existsSync(files)) {
  fs.mkdirSync(path.join(out, "files"), { recursive: true });
  for (const f of fs.readdirSync(files)) {
    if (!/^[A-Za-z0-9_-]+\.webp$/.test(f)) continue; // only what the CMS writes
    fs.copyFileSync(path.join(files, f), path.join(out, "files", f));
    copied++;
  }
}
const count = (sub) => (fs.existsSync(path.join(dir, sub)) ? fs.readdirSync(path.join(dir, sub)).filter((f) => f.endsWith(".json")).length : 0);
console.log(
  `prepare-content: ${label} · schema v${manifest.schemaVersion} · ${count("jobs")} jobs · ${count("posts")} posts · ${copied} images`,
);
