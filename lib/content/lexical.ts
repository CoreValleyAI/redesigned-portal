/**
 * Pure helpers over Lexical JSON (client-safe): plain text, headings for a
 * table of contents, reading time, and an HTML string for JobPosting and RSS.
 * The node types handled here are exactly the ones the CMS lets editors use.
 */
import type { LexicalNode, LexicalState } from "./types";

export interface ContentHeading {
  id: string;
  text: string;
  depth: 2 | 3 | 4;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function nodeText(node: LexicalNode): string {
  if (node.type === "text") return String(node.text ?? "");
  if (node.type === "linebreak") return "\n";
  return (node.children ?? []).map(nodeText).join("");
}

export function plainText(state: LexicalState | null | undefined): string {
  if (!state) return "";
  const out: string[] = [];
  const walk = (n: LexicalNode) => {
    if (n.type === "paragraph" || n.type === "heading" || n.type === "listitem" || n.type === "quote") {
      out.push(nodeText(n));
      return;
    }
    if (n.type === "block") {
      const f = (n.fields ?? {}) as Record<string, unknown>;
      if (typeof f.body === "string") out.push(f.body);
      if (typeof f.heading === "string") out.push(f.heading);
      return;
    }
    n.children?.forEach(walk);
  };
  walk(state.root);
  return out.join("\n").trim();
}

/** Assigns ids to headings in document order, de-duplicated like GitHub does. */
export function headingIds(state: LexicalState | null | undefined): Map<LexicalNode, string> {
  const ids = new Map<LexicalNode, string>();
  if (!state) return ids;
  const seen = new Map<string, number>();
  const walk = (n: LexicalNode) => {
    if (n.type === "heading") {
      const base = slugify(nodeText(n)) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      ids.set(n, count ? `${base}-${count}` : base);
    }
    n.children?.forEach(walk);
  };
  walk(state.root);
  return ids;
}

export function headings(state: LexicalState | null | undefined): ContentHeading[] {
  const ids = headingIds(state);
  const out: ContentHeading[] = [];
  for (const [node, id] of ids) {
    const depth = Number(String(node.tag ?? "h2").slice(1));
    if (depth >= 2 && depth <= 4) out.push({ id, text: nodeText(node), depth: depth as 2 | 3 | 4 });
  }
  return out;
}

/** Minutes to read at 230 words a minute, never less than 1. */
export function readingMinutes(state: LexicalState | null | undefined): number {
  const words = plainText(state).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:)/i;

/**
 * Lexical → a small, escaped HTML string, for JobPosting.description and the
 * RSS feed. `absolute` turns site paths into full URLs.
 */
export function toHtml(state: LexicalState | null | undefined, absolute: (path: string) => string): string {
  if (!state) return "";
  const text = (n: LexicalNode) => {
    let s = esc(String(n.text ?? ""));
    const f = Number(n.format ?? 0);
    if (f & 16) s = `<code>${s}</code>`;
    if (f & 1) s = `<strong>${s}</strong>`;
    if (f & 2) s = `<em>${s}</em>`;
    if (f & 4) s = `<s>${s}</s>`;
    return s;
  };
  const walk = (n: LexicalNode): string => {
    const kids = () => (n.children ?? []).map(walk).join("");
    switch (n.type) {
      case "root":
        return kids();
      case "text":
        return text(n);
      case "linebreak":
        return "<br>";
      case "paragraph":
        return `<p>${kids()}</p>`;
      case "heading":
        return `<${n.tag}>${kids()}</${n.tag}>`;
      case "list":
        return n.listType === "number" ? `<ol>${kids()}</ol>` : `<ul>${kids()}</ul>`;
      case "listitem":
        return `<li>${kids()}</li>`;
      case "quote":
        return `<blockquote>${kids()}</blockquote>`;
      case "horizontalrule":
        return "<hr>";
      case "link": {
        const url = String((n.fields as { url?: string } | undefined)?.url ?? "");
        if (!SAFE_URL.test(url)) return kids();
        return `<a href="${esc(url.startsWith("/") ? absolute(url) : url)}">${kids()}</a>`;
      }
      case "block": {
        const f = (n.fields ?? {}) as Record<string, string>;
        if (f.blockType === "code") return `<pre><code>${esc(f.code ?? "")}</code></pre>`;
        if (f.blockType === "callout") return `<p><strong>${esc(f.title ?? "Note")}:</strong> ${esc(f.body ?? "")}</p>`;
        if (f.blockType === "cta") return `<p><a href="${esc(f.href?.startsWith("/") ? absolute(f.href) : f.href ?? "")}">${esc(f.label ?? "")}</a></p>`;
        return "";
      }
      default:
        return "";
    }
  };
  return walk(state.root);
}
