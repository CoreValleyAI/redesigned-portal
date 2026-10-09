/**
 * Site facts, in one place: the canonical origin, the public organisation
 * details that structured data and the footer repeat, and the URL helpers
 * every SEO surface (metadata, sitemap, robots, JSON-LD) builds on.
 *
 * NEXT_PUBLIC_SITE_URL is the address the site is actually served from, base
 * path included. The deploy workflow derives it from the GitHub Pages
 * configuration (origin + base path), so canonical URLs and the sitemap are
 * right whether the site lives at https://corevalley.ai/ or under a project
 * path. Locally it defaults to the production origin.
 */
export const SITE_NAME = "CoreValley";

/** True in the docs-site build, where the docs are served from the root. */
export const IS_DOCS_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === "docs";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (IS_DOCS_BUILD ? "https://docs.corevalley.ai" : "https://corevalley.ai")
).replace(
  /\/+$/,
  "",
);

/** Keep the whole build out of search engines (noindex, nofollow on every
    page). The deploy sets it for the /preview build, which would otherwise be
    a second, competing copy of the site. */
export const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === "1";

/** Show the Status link in the header and footer. Off until status monitoring
    is integrated; flip to true to bring the links back. */
export const SHOW_STATUS = false;

/** The public status page. A separate static site (see /status in the repo). */
export const STATUS_URL = (process.env.NEXT_PUBLIC_STATUS_URL || "https://status.corevalley.ai").replace(
  /\/+$/,
  "",
);

/**
 * The documentation is its own site at docs.corevalley.ai, built from this
 * repository with NEXT_PUBLIC_BUILD_TARGET=docs (see next.config.ts and the
 * `*.docs.tsx` routes in app/). The marketing site has no /docs/ pages; every
 * docs link points at DOCS_URL.
 */
export const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.corevalley.ai").replace(
  /\/+$/,
  "",
);

/** The marketing site, which the docs site's header and footer link back to. */
export const MAIN_URL = (process.env.NEXT_PUBLIC_MAIN_URL || "https://corevalley.ai").replace(
  /\/+$/,
  "",
);

/**
 * A link to a marketing page. In the main build it is the path itself (for
 * <Link>, which adds the base path); in the docs build it is absolute on
 * MAIN_URL, since those pages do not exist on the docs host.
 */
export function siteHref(path: string): string {
  if (!IS_DOCS_BUILD) return path;
  // The trailing slash <Link> would add for a route, so GitHub Pages serves
  // the page instead of redirecting to it: /products#x → /products/#x.
  const [p = "/", hash] = path.split("#");
  const slashed = p.endsWith("/") || /\.[a-z0-9]+$/i.test(p) ? p : `${p}/`;
  return `${MAIN_URL}${slashed}${hash !== undefined ? `#${hash}` : ""}`;
}

export const SITE_TITLE = "CoreValley — Nepal's GPU cloud, NVIDIA H200 in Kathmandu";

/* The default description, also used by the manifest and the WebSite graph.
   Every clause is a confirmed fact (see lib/availability.ts); keep it under
   ~160 characters so search results show it whole. */
export const SITE_DESCRIPTION =
  "NVIDIA H200 GPUs in a hydro-powered Kathmandu datacenter, open now for enterprise early access. Billed in NPR, <5 ms latency in Kathmandu, data kept in Nepal.";

/* Only facts that are stated on the public site or verifiable. Nothing here
   is guessed; see SEO_roadmap.txt for the items awaiting confirmation. */
export const ORG = {
  name: "CoreValley AI",
  legalName: "CoreValley AI Pvt. Ltd.",
  email: "info@corevalley.ai",
  locality: "Kathmandu",
  region: "Bagmati Province",
  country: "NP",
  countryName: "Nepal",
  linkedin: "https://www.linkedin.com/company/corevalleyai/",
  github: "https://github.com/CoreValleyAI",
} as const;

/**
 * Absolute URL for a site path. Paths get the trailing slash the static
 * export uses (`trailingSlash: true`), unless they name a file.
 */
export function absoluteUrl(path = "/"): string {
  let p = path.startsWith("/") ? path : `/${path}`;
  const isFile = /\.[a-z0-9]+$/i.test(p);
  if (!isFile && !p.endsWith("/")) p += "/";
  return `${SITE_URL}${p}`;
}

/** The site's own logo as an absolute URL, for structured data. */
export function logoUrl(): string {
  return absoluteUrl("/brand/cv-combinedmark-green.svg");
}
