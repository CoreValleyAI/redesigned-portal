<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/cv-combinedmark-green.svg">
  <img src="public/brand/cv-combinedmark.svg" alt="CoreValley" width="200">
</picture>

### CoreValley web

**Marketing site, documentation and customer console for Nepal's sovereign AI cloud.**

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · static export to GitHub Pages

</div>

---

## Contents

1. [Status of the project](#status-of-the-project)
2. [Quick start](#quick-start)
3. [Repository layout](#repository-layout)
4. [Editing content](#editing-content)
5. [Design system and theming](#design-system-and-theming)
6. [SEO](#seo)
7. [Deployment](#deployment)
8. [Status page and docs host](#status-page-and-docs-host)
9. [Verification](#verification)
10. [Further reading](#further-reading)

---

## Status of the project

The public pages are production-quality. Three things are placeholders and
are labelled as such in the UI:

| Placeholder | Where | To go live |
|---|---|---|
| **Pricing** — every NPR rate was invented for UI work | `lib/catalog.ts` | Replace the rates, set `meta.pricingIsPlaceholder` to `false`, fill `meta.reviewedAt`. The "indicative pricing" badge disappears. |
| **Console data** — the portal runs on an in-memory mock | `lib/api/mock.ts` | Implement `lib/api/http.ts` against the control plane and build with `NEXT_PUBLIC_API_MODE=http`. |
| **Sign-in** — the auth modal sets a cookie, nothing more | `components/layout/auth-modal.tsx` | Wire the Keycloak flow described in `docs/03-keycloak-identity.md`. |

`SEO_roadmap.txt` lists the launch tasks that need account access (search
consoles, DNS, domain cut-over) and the copy claims to confirm.

---

## Quick start

Requires Node 20.9 or newer (CI uses Node 24).

```bash
npm install
npm run dev            # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server. Docs Markdown is re-read on every refresh. |
| `npm run build` | Production build: a static export in `out/`. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run docs:check` | After a build: every docs page in the MkDocs nav exported, links under the right base path. |
| `npm run generate:brand` | Regenerate the Open Graph image and app icons from the SVG marks (needs a local Chrome). |
| `npm run generate:basemap` | Regenerate the map data in `lib/mesh-basemap.ts`. |
| `npm run docs:mkdocs` | Optional standalone MkDocs build of the same docs (Python). |

Do not run `npm run build` while `next dev` is running against the same
`.next` folder. Use `NEXT_DIST_DIR=.next-build npm run build` for a side
build, or stop the dev server first.

---

## Repository layout

```
app/
  (marketing)/        public pages: home, products, pricing, use cases, company, contact, legal, docs
  (portal)/           customer console (mock data, noindex)
  layout.tsx          fonts, site-wide metadata, theme bootstrap, organisation JSON-LD
  sitemap.ts · robots.ts · manifest.ts   generated /sitemap.xml, /robots.txt, /manifest.webmanifest
  opengraph-image.png · apple-icon.png · icon.svg   link-preview image and icons
  globals.css         Tailwind ↔ design-system bridge
  theme.css           light theme (token overrides) and terminal surfaces
  glass.css           glass surfaces and motion helpers
  prose.css           documentation typography
components/
  ui/                 design-system primitives (Button, Card, Terminal, Icon…)
  layout/             header, footer, console shell, logo, theme toggle
  marketing/          hero graphics, pricing tables, quote console, page hero
  docs/               documentation shell, renderer, search
  seo/                JSON-LD helpers
  fx/                 reveal, scroll and canvas effects
lib/
  site.ts             canonical origin, organisation facts, URL helpers
  seo.ts              per-page metadata helper
  theme.ts            dark/light theme state and the canvas palette
  products.ts         the four products (drives /products and nav)
  catalog.ts          GPU SKUs, slice profiles and placeholder rates
  docs/               reads corevalley-docs/ into pages, headings and search
  api/                console data client (mock + HTTP stub)
corevalley-docs/      documentation source: mkdocs.yml (nav) + docs/**/*.md
status/               the standalone status page for status.corevalley.ai
public/               brand SVGs, icons, security.txt, redirect stubs for the old site
design_system/        read-only design tokens and reference components (do not import)
docs/                 engineering notes (architecture, identity, billing, deploy…)
scripts/              generators (brand images, basemap, docs export check)
```

---

## Editing content

**Marketing copy** lives in the page files under `app/(marketing)/` and in
`lib/products.ts` (products) and `lib/catalog.ts` (hardware and rates). Each
page exports its metadata through `pageMetadata()` from `lib/seo.ts`, which
sets the title, description, canonical URL and social card in one call:

```ts
export const metadata = pageMetadata({
  title: "GPU Pricing in NPR — Per-second H100 and H200 Rates",
  description: "…",
  path: "/pricing",
});
```

**Documentation** is Markdown in `corevalley-docs/docs/`. The sidebar order
and labels come from the `nav` in `corevalley-docs/mkdocs.yml`. Add a page by
creating the `.md` file and listing it in `nav`; the route, search index and
sitemap entry follow. The Markdown is MkDocs Material compatible (admonitions,
grid cards, tabs, icon shortcodes) and is rendered by the site itself. Pages
are currently professional placeholders with an "in progress" notice; replace
the body of each as the content is written.

**Legal pages** are a content map in `app/(marketing)/legal/[slug]/page.tsx`.

**Facts the whole site repeats** — organisation name, email, location, social
links, canonical origin — are in `lib/site.ts`.

---

## Design system and theming

`design_system/tokens/*.css` is the single source of truth for colours,
type, spacing and motion; `app/globals.css` bridges those tokens into
Tailwind. Rules that break silently if changed are documented at the top of
that file.

The site ships both themes behind the sun/moon toggle; light is the default:

- `lib/theme.ts` owns the theme (a `data-theme` attribute on `<html>`,
  stamped before first paint, saved in `localStorage`; light unless the
  visitor chose dark).
- `app/theme.css` overrides the same token names for light mode. The
  carbon, ink and hydro ramps invert so components need no per-theme
  variants; terminals get a pale teal surface (`cv-terminal`).
- The canvas graphics read `canvasPalette()` per frame and repaint on
  toggle.

Details: `docs/06-design-system-and-frontend.md`.

---

## SEO

Everything a static site can do for search is generated at build time:

- **Metadata** — site defaults in `app/layout.tsx`, per-page overrides via
  `lib/seo.ts`. Canonical URLs are absolute and include the deploy base path.
- **Sitemap and robots** — `app/sitemap.ts`, `app/robots.ts`. The console is
  excluded and noindex.
- **Structured data** — `components/seo/json-ld.tsx`: Organization and
  WebSite on every page; Service and breadcrumbs on products; FAQ on pricing,
  contact, company and use cases.
- **Social cards and icons** — `app/opengraph-image.png`, `app/apple-icon.png`,
  `public/icons/*`, generated by `npm run generate:brand`.
- **Old URLs** — `public/{about,services,pricing,contact}.html` redirect the
  previous site's pages to their replacements.

The canonical origin comes from `NEXT_PUBLIC_SITE_URL`; the deploy workflow
sets it from the GitHub Pages configuration, so it is correct both under a
project path and at the root domain. Verification tokens for Google and
Bing are read from the repository variables `GSC_VERIFICATION` and
`BING_VERIFICATION`.

Manual launch tasks are in `SEO_roadmap.txt`.

---

## Deployment

The site is a static export (`output: "export"`, `trailingSlash: true`)
deployed to GitHub Pages by two workflows:

| Workflow | Runs on | Does |
|---|---|---|
| `deploy.yml` | push to `main` that touches the site; manual dispatch | reads the Pages base path and origin, typechecks, lints, builds, runs `docs:check`, uploads `out/`, deploys |
| `verify.yml` | push to any other branch; pull requests to `main` | the same checks without deploying; keeps the export as an artifact for 7 days |

Pages must be set to deploy from **GitHub Actions**. Environment variables
the build understands:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `""` | Subpath for a project site (`/redesigned-portal`). Set by the workflow. |
| `NEXT_PUBLIC_SITE_URL` | `https://corevalley.ai` | Canonical origin (+ base path) for metadata, sitemap and JSON-LD. Set by the workflow. |
| `NEXT_PUBLIC_DOCS_URL` | unset | Set to `https://docs.corevalley.ai` once that host is live: all docs links point there, in-app docs redirect (path preserved), go noindex and leave the sitemap. Repository variable `DOCS_URL`. |
| `NEXT_PUBLIC_STATUS_URL` | `https://status.corevalley.ai` | The status page link. Repository variable `STATUS_URL`. |
| `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION` | unset | Search-console verification tags. Repository variables. |
| `NEXT_PUBLIC_API_MODE` | `mock` | `http` selects the real-backend client. |

To check the export locally the way CI builds it:

```bash
NEXT_PUBLIC_BASE_PATH=/redesigned-portal npm run build && npm run docs:check
# Git Bash: prefix with MSYS_NO_PATHCONV=1 so the path is not rewritten
```

---

## Status page and docs host

- **Status page** — `status/` is a self-contained page (HTML, `status.json`,
  brand SVGs) for `status.corevalley.ai`. Upload the folder to any static
  host; a monitor updates it by rewriting `status.json`. See
  `status/README.md`. The header and footer link to it.
- **Docs on a subdomain** — `doc_cname_readme.txt` walks through publishing
  `corevalley-docs/` as a MkDocs site at `docs.corevalley.ai` with a CNAME,
  and switching the main site's links with `DOCS_URL`.

---

## Verification

```bash
npm run typecheck && npm run lint
NEXT_PUBLIC_BASE_PATH=/redesigned-portal npm run build && npm run docs:check
```

Every `(marketing)` route must build as static; `/portal` must be excluded
from `out/sitemap.xml`. Before a release also check: no emoji in `app/`,
`components/`, `lib/` (brand rule); glass panels stay readable with
`backdrop-filter` disabled; the hero renders one static frame under
reduce-motion; both themes on `/`, `/pricing/`, `/docs/`, `/portal/`.

---

## Further reading

| Document | Covers |
|---|---|
| `docs/README.md` | Index of the engineering notes below |
| `docs/01-platform-architecture.md` | System context and rendering model |
| `docs/06-design-system-and-frontend.md` | Tokens, cascade layers, components, theming |
| `docs/07-build-deploy-and-environments.md` | Build targets, environment variables, CI |
| `docs/11-seo-status-and-content.md` | How SEO, the status page and the docs host fit together |
| `SEO_roadmap.txt` | Launch checklist for search, domains and claims to confirm |
| `doc_cname_readme.txt` | Tutorial: docs.corevalley.ai on GitHub Pages |

Brand assets in `public/brand/` and `design_system/` are proprietary to
CoreValley AI Pvt. Ltd. Country outlines are Natural Earth (public domain),
icons are Phosphor (MIT), fonts are Manrope and JetBrains Mono (OFL).
