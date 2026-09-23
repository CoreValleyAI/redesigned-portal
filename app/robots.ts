import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * /robots.txt. Everything public is crawlable; the console is not (it is
 * also noindex at the layout level, which is the part crawlers actually
 * honour for pages they have already fetched).
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal/", "/portal"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
