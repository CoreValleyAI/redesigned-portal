# 11 — SEO, Status Page & Content Surfaces

**Owner:** Kaustuv

**Status:** ✅ **Implemented** in the repository (metadata, sitemap, robots,
structured data, icons, status page, docs-host switch). ❌ The launch steps
that need account access — domain cut-over, search consoles, DNS for the
subdomains — are listed in `SEO_roadmap.txt` and `doc_cname_readme.txt`.

---

## 1. Where the site facts live

`lib/site.ts` is the one place the canonical origin and organisation facts
are declared. Everything below reads from it.

| Export | Value | Used by |
|---|---|---|
| `SITE_URL` | `NEXT_PUBLIC_SITE_URL` or `https://corevalley.ai`, no trailing slash | metadata base, canonicals, sitemap, robots, JSON-LD |
| `STATUS_URL` | `NEXT_PUBLIC_STATUS_URL` or `https://status.corevalley.ai` | header and footer links |
| `DOCS_URL` | `NEXT_PUBLIC_DOCS_URL` or empty | `docsHref()` and the sitemap |
| `ORG` | legal name, email, locality, LinkedIn, GitHub | Organization JSON-LD, company page |
| `absoluteUrl(path)` | `SITE_URL` + path with the export's trailing slash | all of the above |

The deploy workflow sets `NEXT_PUBLIC_SITE_URL` to the GitHub Pages origin
plus base path (`steps.pages.outputs.origin` + `base_path`). Under the
project path that is `https://corevalley.ai/redesigned-portal`; once the
repository becomes the organisation site it is `https://corevalley.ai`.

## 2. Metadata

- Site defaults: `app/layout.tsx` — title template `%s · CoreValley`,
  description, keywords, Open Graph and Twitter defaults, robots directives,
  optional verification tags (`NEXT_PUBLIC_GSC_VERIFICATION`,
  `NEXT_PUBLIC_BING_VERIFICATION`).
- Per page: `pageMetadata()` in `lib/seo.ts` returns title, description,
  `alternates.canonical`, `openGraph` and `twitter` for a path. Every public
  page uses it, including the dynamic product, legal and docs routes.
- Images: `app/opengraph-image.png` (1200×630) and `app/apple-icon.png` are
  Next file conventions, attached automatically. `app/icon.svg` is the
  favicon. The manifest icons are in `public/icons/`. All PNGs come from
  `scripts/generate-brand-images.mjs` (`npm run generate:brand`), which
  renders HTML templates in a local headless Chrome over the DevTools
  protocol — no image library is needed.
- The console layout sets `robots: { index: false }`; the 404 page too.

## 3. Sitemap, robots, manifest, security.txt

| File | Output | Notes |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | Core routes, the four products, three legal pages, docs pages from the MkDocs nav (omitted when `DOCS_URL` is set). `lastModified` is build time. |
| `app/robots.ts` | `/robots.txt` | Allow all, disallow `/portal/`, sitemap URL. |
| `app/manifest.ts` | `/manifest.webmanifest` | Name, colours, icons, base-path aware. |
| `public/.well-known/security.txt` | same path | RFC 9116; renew `Expires` yearly. |
| `public/{about,services,pricing,contact}.html` | same paths | Meta-refresh + canonical stubs for the previous site's URLs. |

All three generated routes are `force-static`, which the static export
requires.

## 4. Structured data

`components/seo/json-ld.tsx` renders `<script type="application/ld+json">`
with `<` escaped. Builders:

| Builder | Where |
|---|---|
| `organizationJsonLd()`, `webSiteJsonLd()` | root layout, every page |
| `serviceJsonLd()`, `breadcrumbJsonLd()` | product detail pages |
| `faqJsonLd()` | pricing, contact, company, use cases — from the same `FAQ` arrays the pages render |
| `breadcrumbJsonLd()` | docs pages, company, use cases |

Offer/price structured data is deliberately absent while pricing is a
placeholder (`CATALOG.meta.pricingIsPlaceholder`).

## 5. Status page

`status/` is a standalone static site: `index.html` (inline CSS/JS),
`status.json` (data feed) and `brand/` (three SVGs). It is not part of the
Next build and is ignored by the deploy workflow's path filter. The page
renders the component list, 90-day bars, response-time charts, maintenance
and incidents from `status.json`; with no data it shows "monitoring not yet
connected" rather than invented uptime. `status/README.md` documents the JSON
schema and three ways to feed it. The main site links to `STATUS_URL` from
the header (external link) and the footer.

## 6. Docs host switch

`docsHref()` in `lib/docs/href.ts` returns in-app paths by default. With
`NEXT_PUBLIC_DOCS_URL` set it returns URLs on that host (`/docs/x/` →
`https://docs.corevalley.ai/x/`), and `app/sitemap.ts` stops listing the
in-app docs. The in-app routes keep building for local preview.
`doc_cname_readme.txt` is the operator's tutorial for the GitHub Pages +
CNAME setup.

## 7. Content sources and claims

Company and use-case copy was aligned with what the public site states
(service lines, GPU list, payment rails, audiences, early-access status).
Claims not found publicly — hydropower supply, SLA percentages, SOC 2
alignment, the region name — are unchanged in the code and listed in
`SEO_roadmap.txt` §3 for confirmation.

## 8. Verification

```bash
NEXT_PUBLIC_BASE_PATH=/redesigned-portal NEXT_PUBLIC_SITE_URL=https://example.test/redesigned-portal npm run build
grep -c "<loc>" out/sitemap.xml          # 8 core + 4 products + 3 legal + 8 docs = 23 (docs omitted with DOCS_URL)
grep -o 'rel="canonical" href="[^"]*"' out/pricing/index.html
grep -c 'application/ld+json' out/products/gpu-pods/index.html   # 2: org+site graph, service+breadcrumb graph
```

Validate a deployed page at https://validator.schema.org/ and
https://search.google.com/test/rich-results.
