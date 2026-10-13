# 03 · Information architecture

The site today repeats itself: the six products appear in full five times, payment methods on six pages, the hardware roadmap on eight, "we reply within one working day" almost everywhere, and the company page restates the product catalogue. This document gives **every subject exactly one home**.

---

## 1. Sitemap

```
/                                Home — the journey, teasers only
/products                        What you can buy (overview + compare)
/products/reserved
/products/on-demand
/products/inferencing
/products/mig-slicing
/products/storage
/products/services
/hardware                        The machines: H200 NVL, the cluster, the roadmap
/infrastructure                  The place: power, datacentre, network, residency
/platform                        The software: from bare metal to API
/use-cases                       Nepal (and later India) — the atlas of what people build
/use-cases/[slug]                One story per use case (optional, Phase 5)
/pricing                         How billing works, the Meter, the quote console
/trust                           Security, compliance status, data handling, subprocessors
/company                         Story, mission, principles, team, vision, press
/jobs                            Careers (CMS)
/jobs/[slug]                     Role (CMS)
/blog                            Notes from Kathmandu (CMS)
/blog/[slug] … category/tag/author/page/rss.xml/search-index.json
/contact                         The Ascent — request access and every other route in
/legal/privacy | terms | data-residency
/404
/cms-preview                     CMS live preview (noindex, unlinked)
docs.corevalley.ai               Documentation (separate build, unchanged)
status.corevalley.ai             Status (returns to footer when monitoring is live)
```

**New pages:** `/hardware`, `/infrastructure`, `/trust`. **Removed as standalone subjects:** the hardware table on `/products`, the products block on `/company`, duplicated FAQs.

---

## 2. Navigation

### Desktop header (≥1280 px)

```
[ Living Mark · corevalley ]   Products ▾   Platform   Infrastructure   Use cases   Pricing   Company ▾      Docs ↗   [ Request access ]
```

- **Products ▾** — a mega panel, two columns:
  - *Ways to run*: the six products, each with a one-line promise and a micro-visual (a single dot motif).
  - *The machines*: Hardware (H200 NVL · the cluster · roadmap) and a compare link.
- **Company ▾** — About, Careers (with live open-role count), Blog, Trust.
- **Request access** — the only primary button in the header.
- Theme toggle and (later) language switch sit in the header's right edge as icon buttons.
- The header is a translucent floating bar (the only glass in the site), compacting on scroll; the Living Mark contracts to the dot icon.

### Tablet and phone (<1280 px)

- Header: Living Mark, Request access (short label "Access"), menu button.
- Menu: a full-height sheet that rises from the bottom on phones (thumb reach), from the top on tablets; Products and Company as accordions; theme toggle as a labelled row; Docs as an external row.
- After the hero, a **sticky "Request access" pill** appears at the bottom on phones (hides while scrolling down fast, returns on scroll up).

### Footer (every page)

- **Reservoir**: the giant dot-matrix wordmark that fills as you near the end of the page, with the Living Mark reacting to cursor or touch.
- Columns: Products · Machines & place (Hardware, Infrastructure, Platform) · Company (About, Careers, Blog, Trust) · Help (Docs, Contact, Status when live).
- **Valley Time**: Nepal Standard Time clock (UTC+05:45), "engineers online/offline".
- Legal row: © CoreValley AI Pvt. Ltd., Kathmandu · Privacy · Terms · Data residency · security.txt · email.
- **No CTA block in the footer** — every page already ends with its own one call to action. (Removes today's double-CTA.)

### Breadcrumbs

Shown on depth ≥ 2 (product detail, role, post, use-case story) as a quiet line above the title; emitted as BreadcrumbList JSON-LD.

---

## 3. Content ownership — one home per subject

| Subject | Its only home | Allowed elsewhere (one line + link, max) |
|---|---|---|
| The six products: what they do, features, who for | `/products/[slug]` (+ overview on `/products`) | Home chapter teasers; footer links; contact routing labels |
| Product comparison (billing / commitment / best for) | `/products#compare` | — |
| GPU specs (H200 NVL, RTX PRO 6000), cluster spec, slicing profiles | `/hardware` | Product pages quote ≤3 key specs and link "Full specs →" |
| Hardware roadmap (Blackwell next, future generations) | `/hardware#roadmap` | Company vision quotes the *ambition*, not specs |
| Power, datacentre, network, latency, residency, the valley | `/infrastructure` | Home "Snow → Token" (short); Trust links to residency |
| Software stack (NVIDIA AI Enterprise, NIM, HPE AI Essentials, Kubernetes, frameworks, API/CLI) | `/platform` | Product pages name only what they use |
| Billing model, per-second, NPR, payment rails, quote | `/pricing` | One line on product pages: "Billed per second in NPR. How billing works →" |
| Security, compliance status, subprocessors, audit, disclosure | `/trust` | Infrastructure links to Trust |
| Legal text | `/legal/*` | Trust and footer link |
| Use cases by sector (Nepal; India later) | `/use-cases` | Home "Built for Nepal" chapter (3 rotating stories) |
| Company story, mission, principles, team, vision, timeline, press | `/company` | — (no product or pricing content here) |
| Careers | `/jobs` | Company page: open-role count + link |
| Contact routes, process, reply promise | `/contact` | Every page's final CTA links here; the promise appears on Contact and Pricing only |
| Availability status ("H200 coming soon") | `lib/availability.ts` (data) shown by a single `<Status>` component | Wherever a status is needed, always the same component |

### FAQs — topic-owned, never duplicated

| Page | FAQ topics (only these) |
|---|---|
| Pricing | When rates are published; per-second details; NPR & payment rails; minimum commitment; academic pricing |
| Hardware | NVL vs SXM; MIG profiles; NVLink domains; when Blackwell arrives |
| Infrastructure | Where exactly the data is; latency; power and seasons; outages and backup |
| Trust | Certifications status; who can access data; incident disclosure; subprocessors |
| Products/[slug] | 2–4 product-specific questions only |
| Contact | What to include; how fast we reply; what happens after |
| Company | Who we are; are we hiring; press contact |

FAQPage JSON-LD only on the page that owns the FAQ.

---

## 4. Page purposes (one sentence each)

| Page | Purpose | Primary action | Secondary |
|---|---|---|---|
| Home | Make the visitor *feel* the valley switching on and know the five things that matter | Request access | Explore products |
| Products | Choose the right way to run | Open a product | Compare |
| Product detail | Understand one product deeply and start | Request access (pre-filled product) | Specs → Hardware; Billing → Pricing |
| Hardware | Trust the machines | Request access (H200) | Compare GPUs; engineer mode |
| Infrastructure | Trust the place | Read Trust / Request access | Two seasons; latency |
| Platform | Know what you'll actually touch (software, API, notebooks) | Read the docs | Request access |
| Use cases | See yourself in a story | Talk about your use case (pre-filled) | Product fit |
| Pricing | Understand the money | Get an NPR quote (quote console → Ascent) | FAQ |
| Trust | Pass the security review | Request the security pack / contact | Legal |
| Company | Believe in the people and the long game | Careers / Contact | Blog |
| Careers | Find a role, feel the culture | Apply | General application |
| Blog | Learn how we build | Read; subscribe RSS | Related posts |
| Contact | Start — effortlessly | Submit | Email directly |

---

## 5. Cross-linking rules

1. Every page ends with **one** call to action appropriate to its purpose (never two stacked).
2. Specs and prices always link to their owner page rather than repeating.
3. Product cards and product heroes share a **view-transition name** so moving between them morphs (see 06 §8).
4. The quote console (Pricing) and product pages pre-fill the Ascent form through URL parameters, so no answer is ever asked twice.
5. Internal links never open new tabs; external links show ↗ and open in the same tab unless they are downloads.

---

## 6. URLs and redirects

- All existing marketing URLs keep working: `/products/*`, `/platform`, `/pricing`, `/use-cases`, `/company`, `/contact`, `/jobs/*`, `/blog/*`, `/legal/*`.
- `/products#hardware` → `/hardware` (static stub with meta refresh + canonical, since GitHub Pages has no 301s).
- Legacy stubs (`about.html`, `contact.html`, `pricing.html`, `services.html`, `/redesigned-portal/*`) stay.
- Trailing slashes everywhere (static export).

## 7. Internationalisation readiness (English first)

- Every user-facing string lives in **typed content modules** (`content/en/*.ts`) or the CMS — never inline in components. Adding Hindi or Nepali later means adding `content/hi/*`, `content/ne/*`, not touching components.
- Route plan for later locales (GitHub Pages, no server negotiation): English stays unprefixed at `/`; other locales live at `/hi/…` and `/ne/…` under `app/[locale]` with `dynamicParams = false`; `hreflang` alternates emitted on every page.
- Numbers, dates and currency always go through `Intl` with explicit locale and numbering system (Latin vs Devanagari digits).
- Layouts tolerate 30–40 % longer strings and Devanagari line-height (1.5–1.7); no text baked into images or canvases.
- Fonts: Noto Sans Devanagari variable loaded only on hi/ne routes.

## 8. SEO scope

Per the standing decision: SEO work covers corevalley.ai marketing pages only — never docs, status, `/preview`, `/revamp` staging, `/portal` or `/cms-preview`. Staging builds are `noindex`. Canonicals always point at the production URL.
