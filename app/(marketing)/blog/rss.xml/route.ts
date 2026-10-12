import { livePosts } from "@/lib/content/posts";
import { toHtml } from "@/lib/content/lexical";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** RSS 2.0 feed of the latest posts, with full content. */
export function GET() {
  const posts = livePosts().slice(0, 30);
  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      return [
        "<item>",
        `<title>${esc(p.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(p.publishAt).toUTCString()}</pubDate>`,
        ...p.authorInfo.map((a) => `<dc:creator>${esc(a.name)}</dc:creator>`),
        ...(p.categoryInfo ? [`<category>${esc(p.categoryInfo.name)}</category>`] : []),
        ...p.tagInfo.map((t) => `<category>${esc(t.name)}</category>`),
        `<description>${esc(p.excerpt)}</description>`,
        `<content:encoded>${cdata(toHtml(p.body, absoluteUrl))}</content:encoded>`,
        "</item>",
      ].join("");
    })
    .join("\n");

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
    "<channel>",
    `<title>${esc(SITE_NAME)} blog</title>`,
    `<link>${absoluteUrl("/blog")}</link>`,
    `<atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml"/>`,
    "<description>Engineering and company notes from CoreValley, Nepal’s GPU cloud.</description>",
    "<language>en</language>",
    posts[0] ? `<lastBuildDate>${new Date(posts[0].publishAt).toUTCString()}</lastBuildDate>` : "",
    items,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
