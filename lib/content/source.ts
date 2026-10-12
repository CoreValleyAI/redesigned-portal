/**
 * Where published content comes from. Server-only: reads JSON from disk at
 * build time (and per request in `next dev`). Never import from a client
 * component.
 *
 *   CONTENT_DIR        a checkout of CoreValleyAI/content (CI sets it)
 *   ./content          the same, if present in the project root
 *   ./content-fixtures sample content — only in `next dev` or with
 *                      CONTENT_FIXTURES=1 (verify.yml), never by accident
 *   CONTENT_REQUIRED=1 fail the build if no content folder is found, so a
 *                      broken checkout can't ship an empty careers page
 *
 * Nothing found and nothing required: the site builds with no jobs or
 * posts, and /jobs shows its empty state.
 */
import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_SCHEMA,
  key,
  type Author,
  type CareersPage,
  type Category,
  type Job,
  type Location,
  type Lookups,
  type Manifest,
  type MediaItem,
  type Post,
  type Redirect,
  type Tag,
  type Team,
} from "./types";

export interface ContentStore extends Lookups {
  dir: string | null;
  fixtures: boolean;
  manifest: Manifest | null;
  jobs: Job[];
  posts: Post[];
  careers: CareersPage | null;
  redirects: Redirect[];
}

export function resolveContentDir(): { dir: string | null; fixtures: boolean } {
  const root = process.cwd();
  const explicit = process.env.CONTENT_DIR?.trim();
  if (explicit) {
    const dir = path.resolve(root, explicit);
    if (!fs.existsSync(path.join(dir, "manifest.json"))) {
      throw new Error(`CONTENT_DIR=${explicit} has no manifest.json.`);
    }
    return { dir, fixtures: false };
  }
  const local = path.join(root, "content");
  if (fs.existsSync(path.join(local, "manifest.json"))) return { dir: local, fixtures: false };

  const useFixtures =
    process.env.CONTENT_FIXTURES === "1" ||
    (process.env.NODE_ENV === "development" && process.env.CONTENT_FIXTURES !== "0");
  if (useFixtures) return { dir: path.join(root, "content-fixtures"), fixtures: true };

  if (process.env.CONTENT_REQUIRED === "1") {
    throw new Error(
      "CONTENT_REQUIRED=1 but no content was found. Set CONTENT_DIR to a checkout of CoreValleyAI/content.",
    );
  }
  return { dir: null, fixtures: false };
}

function readJson<T>(dir: string, file: string, fallback: T): T {
  const full = path.join(dir, file);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8")) as T;
}

function readFolder<T>(dir: string, sub: string): T[] {
  const folder = path.join(dir, sub);
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson<T>(folder, f, null as T));
}

const byId = <T extends { id: string | number }>(list: T[]) => new Map(list.map((x) => [key(x.id), x]));

let cache: ContentStore | null = null;

/** The whole published snapshot. Cached for a build; re-read on every call in dev. */
export function loadContent(): ContentStore {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const { dir, fixtures } = resolveContentDir();

  if (!dir) {
    cache = {
      dir: null,
      fixtures: false,
      manifest: null,
      jobs: [],
      posts: [],
      careers: null,
      redirects: [],
      media: new Map(),
      teams: new Map(),
      locations: new Map(),
      authors: new Map(),
      categories: new Map(),
      tags: new Map(),
    };
    return cache;
  }

  const manifest = readJson<Manifest | null>(dir, "manifest.json", null);
  if (manifest && manifest.schemaVersion > SUPPORTED_SCHEMA) {
    throw new Error(
      `Content schema v${manifest.schemaVersion} is newer than this site supports (v${SUPPORTED_SCHEMA}). Update lib/content first.`,
    );
  }

  cache = {
    dir,
    fixtures,
    manifest,
    jobs: readFolder<Job>(dir, "jobs"),
    posts: readFolder<Post>(dir, "posts"),
    careers: readJson<CareersPage | null>(dir, "globals/careers-page.json", null),
    redirects: readJson<Redirect[]>(dir, "redirects.json", []),
    media: byId(readJson<MediaItem[]>(dir, "media.json", [])),
    teams: byId(readJson<Team[]>(dir, "teams.json", [])),
    locations: byId(readJson<Location[]>(dir, "locations.json", [])),
    authors: byId(readJson<Author[]>(dir, "authors.json", [])),
    categories: byId(readJson<Category[]>(dir, "categories.json", [])),
    tags: byId(readJson<Tag[]>(dir, "tags.json", [])),
  };
  return cache;
}

/** The moment this build treats as "now" (CI passes the gate job's clock). */
export function contentNow(): string {
  const fromEnv = process.env.CONTENT_NOW?.trim();
  const d = fromEnv ? new Date(fromEnv) : new Date();
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}
