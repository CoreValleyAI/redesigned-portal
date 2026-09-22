/**
 * Markdown plumbing shared by the docs content module (metadata, search
 * index) and the renderer (components/docs/markdown.tsx).
 *
 * The Markdown in corevalley-docs/docs/ is written for MkDocs Material and
 * must stay buildable by it, so nothing here changes the source format. It
 * teaches the site's renderer the Material constructs the content uses:
 *
 *   - `!!! note "Title"` / `??? tip` admonitions and `=== "Tab"` content
 *     tabs are python-markdown block syntax with 4-space-indented bodies.
 *     CommonMark has no such thing, so `preprocess()` rewrites them into
 *     `<div class="md-…">` wrappers separated by blank lines — the same
 *     md_in_html shape Material's own grid cards already use.
 *   - `remarkContainers` pairs those `<div>`/`</div>` html nodes back into
 *     one container node carrying the div's attributes, so the renderer can
 *     map `md-cards`, `md-admonition`, `md-tabs` to real components.
 *   - `remarkIcons` turns `:material-x:`/`:octicons-x:` shortcodes into
 *     icon nodes and drops the `{ .lg .middle }` attr_list that follows.
 *   - `remarkHeadingIds` gives headings python-markdown-compatible ids so
 *     anchors match between the MkDocs build and this one.
 */
import type {
  Heading,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import { visit } from "unist-util-visit";

/* ── Text-level preprocessing ────────────────────────────────────────────── */

const ADMONITION = /^(!!!|\?\?\?\+?)\s+([\w-]+)(?:\s+"([^"]*)")?\s*$/;
const TAB = /^===\s+"([^"]*)"\s*$/;

function attr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/** Lines indented by 4 spaces (or a tab) after `start`, dedented. */
function takeIndented(lines: string[], start: number): [string, number] {
  const body: string[] = [];
  let i = start;
  while (i < lines.length) {
    const l = lines[i]!;
    if (l.trim() === "") body.push("");
    else if (l.startsWith("    ")) body.push(l.slice(4));
    else if (l.startsWith("\t")) body.push(l.slice(1));
    else break;
    i++;
  }
  while (body.length && body[body.length - 1] === "") body.pop();
  return [body.join("\n"), i];
}

/**
 * Rewrites python-markdown admonitions and content tabs into html-wrapped
 * blocks. Idempotent: output contains none of the input syntax.
 */
export function preprocess(src: string): string {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let fence: string | null = null;
  while (i < lines.length) {
    const line = lines[i]!;

    // Inside a fenced code block nothing is rewritten.
    const f = /^\s*(`{3,}|~{3,})/.exec(line);
    if (f) {
      if (fence === null) fence = f[1]!;
      else if (line.trim().startsWith(fence)) fence = null;
      out.push(line);
      i++;
      continue;
    }
    if (fence !== null) {
      out.push(line);
      i++;
      continue;
    }

    const adm = ADMONITION.exec(line);
    if (adm) {
      const [body, next] = takeIndented(lines, i + 1);
      const mode =
        adm[1] === "!!!" ? "" : adm[1] === "???+" ? "open" : "closed";
      out.push(
        `<div class="md-admonition" data-type="${attr(adm[2]!)}" data-title="${attr(adm[3] ?? "")}" data-collapse="${mode}">`,
        "",
        preprocess(body),
        "",
        "</div>",
        "",
      );
      i = next;
      continue;
    }

    if (TAB.test(line)) {
      const panels: string[] = [];
      let j = i;
      while (j < lines.length) {
        const m = TAB.exec(lines[j]!);
        if (!m) break;
        const [body, next] = takeIndented(lines, j + 1);
        panels.push(
          `<div class="md-tab" data-title="${attr(m[1]!)}">`,
          "",
          preprocess(body),
          "",
          "</div>",
          "",
        );
        j = next;
      }
      out.push(`<div class="md-tabs">`, "", ...panels, "</div>", "");
      i = j;
      continue;
    }

    out.push(line);
    i++;
  }
  return out.join("\n");
}

/* ── Container pairing ───────────────────────────────────────────────────── */

const OPEN = /^<div\b([^>]*)>\s*$/;
const CLOSE = /^<\/div>\s*$/;

interface ContainerNode extends Parent {
  type: "mdContainer";
  data: { hName: "div"; hProperties: Record<string, string | string[]> };
  children: RootContent[];
}

function parseAttrs(raw: string): Record<string, string | string[]> {
  const props: Record<string, string | string[]> = {};
  const re = /([\w-]+)(?:="([^"]*)")?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const key = m[1]!;
    const val = (m[2] ?? "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&");
    if (key === "class") props.className = val.split(/\s+/).filter(Boolean);
    else if (key.startsWith("data-")) {
      // hast wants camelCase property names for data-* attributes.
      const camel = key
        .slice(5)
        .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      props[`data${camel.charAt(0).toUpperCase()}${camel.slice(1)}`] = val;
    }
    // `markdown` (md_in_html's marker) and anything else is dropped.
  }
  return props;
}

/** Pairs `<div …>` … `</div>` html blocks into container nodes, recursively. */
export function remarkContainers() {
  return (tree: Root) => {
    process(tree);
  };
  function process(parent: Parent) {
    const kids = parent.children as RootContent[];
    for (let i = 0; i < kids.length; i++) {
      const n = kids[i]!;
      if (n.type === "html" && OPEN.test(n.value)) {
        let depth = 0;
        let j = i;
        for (; j < kids.length; j++) {
          const m = kids[j]!;
          if (m.type !== "html") continue;
          if (OPEN.test(m.value)) depth++;
          else if (CLOSE.test(m.value) && --depth === 0) break;
        }
        if (j >= kids.length) continue; // unmatched: leave the raw html alone
        const container: ContainerNode = {
          type: "mdContainer",
          data: {
            hName: "div",
            hProperties: parseAttrs(OPEN.exec(n.value)![1] ?? ""),
          },
          children: kids.slice(i + 1, j),
        };
        kids.splice(i, j - i + 1, container as unknown as RootContent);
        process(container);
      } else if ("children" in n) {
        process(n as Parent);
      }
    }
  }
}

/* ── Icon shortcodes ─────────────────────────────────────────────────────── */

const SHORTCODE = /:((?:material|octicons|fontawesome|simple)-[a-z0-9-]+):(\s*\{[^}]*\})?/g;

/** `:material-rocket-outline:{ .lg .middle }` → an icon node; attr_list dropped. */
export function remarkIcons() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined) return;
      const value = node.value;
      SHORTCODE.lastIndex = 0;
      if (!SHORTCODE.test(value)) return;
      SHORTCODE.lastIndex = 0;
      const parts: PhrasingContent[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = SHORTCODE.exec(value))) {
        if (m.index > last) parts.push({ type: "text", value: value.slice(last, m.index) });
        parts.push({
          type: "mdIcon",
          data: { hName: "span", hProperties: { className: ["md-icon"], dataIcon: m[1]! } },
        } as unknown as PhrasingContent);
        last = m.index + m[0].length;
      }
      const tail = value.slice(last);
      if (tail) parts.push({ type: "text", value: tail });
      (parent.children as PhrasingContent[]).splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}

/* ── Heading ids ─────────────────────────────────────────────────────────── */

/** python-markdown's default toc slugify, so anchors match the MkDocs build. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-");
}

const BLOCKS = new Set([
  "paragraph", "heading", "list", "listItem", "blockquote", "code", "table",
  "tableRow", "tableCell", "thematicBreak", "mdContainer", "html",
]);

/** Plain text of a node, ignoring raw html and icons; blocks joined by spaces. */
export function toText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; value?: string; children?: { type?: string }[] };
  if (n.type === "html" || n.type === "mdIcon") return "";
  if (typeof n.value === "string") return n.value;
  if (Array.isArray(n.children)) {
    const sep = n.children.some((c) => BLOCKS.has(c.type ?? "")) ? " " : "";
    return n.children.map(toText).join(sep);
  }
  return "";
}

export interface DocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Assigns unique ids to h1–h4 (python-markdown style `_1`, `_2` suffixes). */
export function remarkHeadingIds() {
  return (tree: Root) => {
    const used = new Map<string, number>();
    visit(tree, "heading", (node: Heading) => {
      if (node.depth > 4) return;
      const base = slugify(toText(node)) || "section";
      const seen = used.get(base) ?? 0;
      used.set(base, seen + 1);
      const id = seen === 0 ? base : `${base}_${seen}`;
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    });
  };
}

/** The h2/h3 outline of a processed tree. */
export function collectHeadings(tree: Root): DocHeading[] {
  const out: DocHeading[] = [];
  visit(tree, "heading", (node: Heading) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const id = (node.data?.hProperties as { id?: string } | undefined)?.id;
    if (!id) return;
    out.push({ id, text: toText(node).trim(), depth: node.depth });
  });
  return out;
}

export interface DocSection {
  /** Heading text, or the page title for the intro. */
  heading: string;
  /** Anchor id, empty for the intro. */
  anchor: string;
  text: string;
}

/**
 * Splits a processed tree into search chunks at every h2/h3, flattening
 * containers so admonition and tab bodies are indexed with their section.
 */
export function collectSections(tree: Root, pageTitle: string): DocSection[] {
  const sections: DocSection[] = [{ heading: pageTitle, anchor: "", text: "" }];
  const walk = (nodes: RootContent[]) => {
    for (const n of nodes) {
      if (n.type === "heading") {
        if (n.depth === 1) continue;
        const id = (n.data?.hProperties as { id?: string } | undefined)?.id ?? "";
        if (n.depth === 2 || n.depth === 3) {
          sections.push({ heading: toText(n).trim(), anchor: id, text: "" });
          continue;
        }
      }
      if ((n as { type: string }).type === "mdContainer") {
        walk((n as unknown as ContainerNode).children);
        continue;
      }
      const t = toText(n).replace(/\s+/g, " ").trim();
      if (t) {
        const cur = sections[sections.length - 1]!;
        cur.text = cur.text ? `${cur.text} ${t}` : t;
      }
    }
  };
  walk(tree.children);
  return sections.filter((s) => s.text || s.anchor);
}
