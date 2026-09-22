/**
 * The documentation content model. Server-only: reads corevalley-docs/ from
 * disk at build (and per request in `next dev`, so edits show on refresh).
 *
 *   corevalley-docs/mkdocs.yml   → nav (order, sidebar titles, sections)
 *   corevalley-docs/docs/**.md   → pages
 *
 * MkDocs remains an optional standalone build of the same files; this module
 * only reads them. Never import it from a client component.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";
import { docsHref, slugFromFile } from "./href";
import {
  collectHeadings,
  collectSections,
  preprocess,
  remarkContainers,
  remarkHeadingIds,
  remarkIcons,
  toText,
  type DocHeading,
} from "./markdown";

const DOCS_ROOT = path.join(process.cwd(), "corevalley-docs");
const DOCS_DIR = path.join(DOCS_ROOT, "docs");

export interface NavItem {
  /** Sidebar label, from mkdocs.yml (may differ from the page's H1). */
  title: string;
  /** Path relative to docs/, e.g. `guides/quickstart.md`. */
  file: string;
  slug: string;
  url: string;
  /** Section heading in the nav, null for top-level entries. */
  section: string | null;
}

export interface NavGroup {
  title: string | null;
  items: NavItem[];
}

export interface PageLink {
  title: string;
  url: string;
}

export interface DocPage extends NavItem {
  /** The page's H1, falling back to the nav title. */
  heading: string;
  /** First paragraph as plain text — the meta description. */
  lead: string;
  /** Preprocessed Markdown with the H1 removed, ready for the renderer. */
  body: string;
  headings: DocHeading[];
  prev: PageLink | null;
  next: PageLink | null;
}

export interface SearchDoc {
  id: string;
  page: string;
  section: string | null;
  url: string;
  heading: string;
  anchor: string;
  text: string;
}

/* ── Nav ─────────────────────────────────────────────────────────────────── */

type RawNav = Array<Record<string, string | RawNav>>;

function parseNav(): NavGroup[] {
  const src = fs.readFileSync(path.join(DOCS_ROOT, "mkdocs.yml"), "utf8");
  // mkdocs.yml uses `!ENV` and `!!python/name:` tags the parser cannot
  // resolve; those only produce warnings, and we read nothing but `nav`.
  const doc = YAML.parseDocument(src, { logLevel: "silent" });
  const nav = doc.toJS()?.nav as RawNav | undefined;
  if (!Array.isArray(nav)) throw new Error("corevalley-docs/mkdocs.yml: no `nav` list");

  const groups: NavGroup[] = [];
  const item = (title: string, file: string, section: string | null): NavItem => {
    const slug = slugFromFile(file);
    return { title, file, slug, url: docsHref(slug), section };
  };
  const walk = (entries: RawNav, section: string | null) => {
    for (const entry of entries) {
      for (const [title, value] of Object.entries(entry)) {
        if (typeof value === "string") {
          const it = item(title, value, section);
          const last = groups[groups.length - 1];
          if (last && last.title === section) last.items.push(it);
          else groups.push({ title: section, items: [it] });
        } else if (Array.isArray(value)) {
          // Nested sections flatten into their parent's title.
          walk(value, section ? `${section} · ${title}` : title);
        }
      }
    }
  };
  walk(nav, null);
  return groups;
}

/* ── Pages ───────────────────────────────────────────────────────────────── */

const processor = remark()
  .use(remarkGfm)
  .use(remarkContainers)
  .use(remarkIcons)
  .use(remarkHeadingIds);

function loadPage(nav: NavItem): Omit<DocPage, "prev" | "next"> {
  const file = path.join(DOCS_DIR, nav.file);
  if (!fs.existsSync(file)) {
    throw new Error(`mkdocs.yml nav points at a missing page: docs/${nav.file}`);
  }
  const pre = preprocess(fs.readFileSync(file, "utf8"));
  const tree = processor.runSync(processor.parse(pre)) as Root;

  let heading = nav.title;
  let body = pre;
  const h1 = tree.children.find((n) => n.type === "heading" && n.depth === 1);
  if (h1 && h1.type === "heading") {
    heading = toText(h1).trim() || nav.title;
    const end = h1.position?.end.offset;
    if (typeof end === "number") body = pre.slice(end);
  }
  const firstParagraph = tree.children.find((n) => n.type === "paragraph");
  const lead = firstParagraph ? toText(firstParagraph).replace(/\s+/g, " ").trim() : "";

  return {
    ...nav,
    heading,
    lead: lead.length > 160 ? `${lead.slice(0, 157).trimEnd()}…` : lead,
    body,
    headings: collectHeadings(tree),
  };
}

interface Loaded {
  nav: NavGroup[];
  pages: DocPage[];
  search: SearchDoc[];
}

let cache: Loaded | null = null;

function load(): Loaded {
  if (cache && process.env.NODE_ENV === "production") return cache;

  const nav = parseNav();
  const flat = nav.flatMap((g) => g.items);
  const partial = flat.map(loadPage);
  const pages: DocPage[] = partial.map((p, i) => {
    const prev = partial[i - 1];
    const next = partial[i + 1];
    return {
      ...p,
      prev: prev ? { title: prev.title, url: prev.url } : null,
      next: next ? { title: next.title, url: next.url } : null,
    };
  });

  const search: SearchDoc[] = [];
  for (const page of pages) {
    const tree = processor.runSync(processor.parse(page.body)) as Root;
    for (const s of collectSections(tree, page.heading)) {
      search.push({
        id: `${page.slug || "index"}#${s.anchor}`,
        page: page.heading,
        section: page.section,
        url: page.url,
        heading: s.heading,
        anchor: s.anchor,
        text: s.text,
      });
    }
  }

  cache = { nav, pages, search };
  return cache;
}

export function getNav(): NavGroup[] {
  return load().nav;
}

export function getPages(): DocPage[] {
  return load().pages;
}

/** `getPage("guides/quickstart")`, `getPage("")` for the landing page. */
export function getPage(slug: string): DocPage | null {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return load().pages.find((p) => p.slug === clean) ?? null;
}

export function getSearchDocs(): SearchDoc[] {
  return load().search;
}
