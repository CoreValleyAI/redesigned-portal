import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { GENERAL_APPLICATION, openJobs } from "@/lib/content/jobs";
import { authorsInUse, blogIndex, categoriesInUse, livePosts } from "@/lib/content/posts";
import { absoluteUrl } from "@/lib/site";

/**
 * /sitemap.xml — every public marketing route. The console (/portal) is
 * excluded and marked noindex in its layout. The documentation is its own
 * site at docs.corevalley.ai, with its own sitemap (app/sitemap.docs.ts).
 *
 * `lastModified` is the build time: the export is regenerated on every
 * deploy, and there is no per-page edit history to draw on.
 */
export const dynamic = "force-static";

/* The legal page slugs live in app/(marketing)/legal/[slug]/page.tsx. */
const LEGAL = ["privacy", "terms", "data-residency"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  });

  const core = [
    entry("/", 1, "weekly"),
    entry("/products", 0.9),
    ...PRODUCTS.map((p) => entry(`/products/${p.slug}`, 0.8)),
    entry("/platform", 0.8),
    entry("/pricing", 0.9, "weekly"),
    entry("/use-cases", 0.7),
    entry("/company", 0.6),
    entry("/contact", 0.6),
    ...LEGAL.map((slug) => entry(`/legal/${slug}`, 0.2, "yearly")),
  ];

  /* Content from the CMS: open roles and live posts, dated by their last edit. */
  const dated = (path: string, updated: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: new Date(updated),
    changeFrequency: "weekly",
    priority,
  });
  const posts = livePosts();
  const content = [
    entry("/jobs", 0.8, "weekly"),
    entry(`/jobs/${GENERAL_APPLICATION}`, 0.4),
    ...openJobs().map((j) => dated(`/jobs/${j.slug}`, j.updatedAt, 0.7)),
    entry("/blog", 0.7, "weekly"),
    ...Array.from({ length: blogIndex(1).pages - 1 }, (_, i) => entry(`/blog/page/${i + 2}`, 0.3, "weekly")),
    ...posts.filter((p) => !p.seo.noindex && !p.seo.canonical).map((p) => dated(`/blog/${p.slug}`, p.updatedAt, 0.6)),
    ...categoriesInUse().map((c) => entry(`/blog/category/${c.slug}`, 0.4, "weekly")),
    ...authorsInUse().map((a) => entry(`/blog/author/${a.slug}`, 0.3, "weekly")),
  ];

  return [...core, ...content];
}
