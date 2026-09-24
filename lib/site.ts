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

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://corevalley.ai").replace(
  /\/+$/,
  "",
);

/** Show the Status link in the header and footer. Off until status monitoring
    is integrated; flip to true to bring the links back. */
export const SHOW_STATUS = false;

/** The public status page. A separate static site (see /status in the repo). */
export const STATUS_URL = (process.env.NEXT_PUBLIC_STATUS_URL || "https://status.corevalley.ai").replace(
  /\/+$/,
  "",
);

/**
 * Where the documentation is served. Empty (the default) means the docs are
 * routes of this site at /docs/. Set to e.g. https://docs.corevalley.ai once
 * the docs move to their own host (see doc_cname_readme.txt): every docs
 * link then points there and the in-app copies drop out of the sitemap.
 */
export const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "").replace(/\/+$/, "");

export const SITE_TITLE = "CoreValley — Nepal's sovereign AI cloud";

export const SITE_DESCRIPTION =
  "GPU cloud hosted in Kathmandu, Nepal. NVIDIA H100 and H200 capacity for training, fine-tuning and inference — billed in NPR, supported in Nepal time, with data that never leaves the country.";

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
