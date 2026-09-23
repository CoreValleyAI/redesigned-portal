import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { getPages } from "@/lib/docs/content";
import { absoluteUrl, DOCS_URL } from "@/lib/site";

/**
 * /sitemap.xml — every public marketing route. The console (/portal) is
 * excluded and marked noindex in its layout. Documentation pages are listed
 * only while the docs are served by this site; once NEXT_PUBLIC_DOCS_URL
 * points at a separate host, that host owns them.
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
    entry("/pricing", 0.9, "weekly"),
    entry("/use-cases", 0.7),
    entry("/company", 0.6),
    entry("/contact", 0.6),
    ...LEGAL.map((slug) => entry(`/legal/${slug}`, 0.2, "yearly")),
  ];

  const docs = DOCS_URL ? [] : getPages().map((p) => entry(p.url, p.slug === "" ? 0.7 : 0.5));

  return [...core, ...docs];
}
