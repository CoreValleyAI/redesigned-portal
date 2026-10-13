# 11 · Roadmap and phases

Built in phases, each ending with a demo on the staging URL (`corevalley.ai/revamp/`, noindex) and a quality gate (10 §5). Nothing in this plan touches the live site until Phase 8, and going live is the owner's explicit decision.

Effort is given in **build sessions** (a focused working block of several hours with review). Phases can overlap where noted.

> **Owner review, 13 Oct 2026 (second pass).** The snow-to-answer storytelling on the home page and /infrastructure read as childish: removed. In its place, the way infrastructure companies present themselves — "Every layer, named" (an exploded stack drawing of the facility, network and storage, servers and GPUs, AI software and workspace), a key-facts row, the cluster totalled, the H200 NVL's numbers, the workspace's tools. The billing meter became a plain billing box; the quote console was rebuilt (product tiles, the cluster's eight GPUs as the picker, segmented controls). Use cases became a carousel of live pictures of the work, in the owner's order: startups and IT exporters, then fraud, AML and KYC for banks and wallets, then universities, then voice, private language models and training. The footer's wordmark became a live Reservoir; light mode's valley a halftone print; liquid glass was added (05 §4); phones got touch and scroll motion (06 §9a). HPE and NVIDIA logos are in use (owner-approved).
>
> **Status, 13 Oct 2026.** Phases 0–6 are built on `revamp` and staged at `corevalley.ai/revamp/` (noindex): every page, both themes, mobile, the valley hero, the Living Mark, the 404 snow, the Dew cursor and magnetic buttons, Valley Time, the plan card, engineer mode, contour prints for the blog and use cases, and the live GPU on the hardware page. Every page passes an axe audit in both themes. Still open: the owner's questions (12 §1); the full slicer (S7, needs the MIG profiles, Q16) and a WebGL journey (S4); Lighthouse budgets and visual baselines in CI; Phase 8, going live, which is the owner's decision.

---

## Phase 0 — Foundations (≈ 3–4 sessions)

**Goal:** the skeleton everything else stands on.

- Branch `revamp` worktree at `C:\corevalley\CoreValley Revamped` *(done)*; backup of preview at `C:\corevalley\backups\` *(done)*.
- Add `/revamp/` staging build to `deploy.yml` (main) + noindex; verify.
- Upgrade: Next 16.4, React 19.3, Tailwind 4.3, three 0.186 (two hops), eslint config; `agentRules: false`; re-verify static export, basePath, docs build.
- Design tokens: colour (both themes), type, space, radii, motion tokens → CSS vars + GSAP eases + WebGL uniforms.
- Theme bootstrap + toggle with circular reveal.
- Fonts: Inter + JetBrains Mono self-hosted.
- `lib/facts.ts` registry + build guard; correct H200 NVL facts (pending owner confirmations).
- Content modules `content/en/*` scaffolding; first-pass copy for Home and Hardware.
- Motion runtime: GSAP registration, Lenis (desktop only), single ticker, reduced-motion provider + on-site toggle.
- **GLRoot + SceneManager + GLView + tiers + PerformanceMonitor**, with a test scene; posters pipeline; context-loss handling.
- Page-transition skeleton (`<ViewTransition>` + types).
- CI: Playwright, axe, Lighthouse CI budgets, visual baselines.
- Install/verify design skills (done) and add GSAP + accessibility/performance references to the team docs.

**Demo:** an empty but themed site with header/footer, working transitions between stub pages, a test GL scene running at Tier 2 on a phone, budgets green.

---

## Phase 1 — Signature systems (≈ 5–6 sessions)

- S2 **Living Mark** (header + footer) and S3 **Reservoir footer**.
- S1 **Valley Online** hero: DEM → terrain, river light-up, cursor/touch light, scroll push, dot-morph hand-off; LCP-safe headline with word rise + decode kicker + online glow.
- Header (desktop + mega panel), mobile sheet, sticky request pill.
- S12 **Valley Time**; Dew cursor; micro-interaction library (buttons, links, toggles, accordions).
- S17 **Fog pass** with shared-element morphs.
- The **Glow** shader + CSS fallback.

**Demo:** Home hero and footer feel finished on desktop and phone, both themes, reduced motion.

---

## Phase 2 — Home journey (≈ 4–5 sessions)

- Chapters 2–9 (08 §1): S4 short, S7 teaser, S9 teaser, S8 teaser, product carousel, Built-for-Nepal stories, partners line, Ascent step 1 inline.
- Posters for every chapter (light/dark).
- Copy final for Home.

**Demo:** the full Home journey; hallway test with 5 people ("tell me what CoreValley is" afterwards).

---

## Phase 3 — Products, Hardware, Infrastructure, Platform (≈ 7–9 sessions)

- `/products` + six product pages with unique dot heroes; compare; decision widget.
- `/hardware` with S6 **The Machine**, spec sheets, metrics, roadmap, engineer mode (S15).
- `/infrastructure` with S4 full, S9 full, S10 **Blink scale** (with disclaimer), hydropower and 99.99 % facility uptime (S5 The River optional, later).
- `/platform` describing HPE AI Essentials on HPE Private Cloud AI with NVIDIA AI Enterprise (owner-confirmed).

**Demo:** an engineer reviews Hardware/Platform for accuracy; owner signs off energy and residency copy.

---

## Phase 4 — Pricing, Contact, forms (≈ 4 sessions)

- `/pricing` with S8 **The Meter**, quote console, S13 **Plan Card**.
- `/contact` with S11 **The Ascent** (all routes), JS-off fallback, drafts, FormSubmit integration.
- Careers application form re-skinned as an Ascent variant.

**Demo:** complete request flows on phone and desktop; median completion ≤ 90 s.

---

## Phase 5 — Use cases (≈ 3–4 sessions)

- S16 **Atlas** with 15 Nepal stations + India section; S14 generative covers; filters.
- Optional long-form `/use-cases/[slug]` stories.

**Demo:** owner reviews every fact/source; guardrails check passes.

---

## Phase 6 — Company, Trust, Careers, Blog, Legal, 404 (≈ 4–5 sessions)

- `/company` (story, principles, team, timeline, vision, press, careers count).
- `/trust` (status table, data handling, subprocessors, disclosure).
- `/jobs` and roles re-skinned; `/blog` and posts with generative covers, reading experience, category tints.
- Legal re-layout + privacy updates; S18 404.

---

## Phase 7 — Polish and proof (≈ 4–5 sessions)

- Performance pass on the device matrix; tier tuning; soak tests.
- Accessibility pass (axe + manual screen readers, keyboard).
- Motion review ritual on every scene (06 §11); restraint pass (remove one effect per page that doesn't carry a fact).
- Copy proof-read; facts re-verification with dates.
- SEO/metadata/OG/JSON-LD; sitemap; service worker caching.
- Cross-browser fixes.

**Gate:** all QA checklists green on every route.

---

## Phase 8 — Launch (≈ 1–2 sessions, owner-triggered)

- Owner go/no-go.
- Merge strategy decided with the owner (the preview redesign was once merged and reverted via 861a765 on main — the revamp branch will be merged as a new history-aware change, with a rollback plan).
- Production deploy; IndexNow; Search Console.
- Post-launch: field metrics (if enabled), bug triage, Awwwards/CSSDA/FWA submissions with a case-study page and device videos.

---

## Later (after launch)

- Hindi and Nepali locales (copy by native writers; Devanagari typography pass).
- In-country form backend on the CMS server (applications and enquiries stored in Nepal).
- Live status in the footer once monitoring exists.
- Blackwell "drop" page when RTX PRO 6000 arrives.
- WebGPU (TSL) upgrade of the hero particles when R3F v10 is stable.
- Commissioned photography of the team and (non-sensitive) facility.

---

## Dependencies on the owner (blocking items by phase)

| Phase | Needed from the owner |
|---|---|
| 0 | ~~H200 NVL~~ (answered: NVL); ~~NVLink~~ (answered: no claims); support hours (later) |
| 1 | Approval of hero copy and the three-fact strip |
| 3 | ~~Customer software~~ (answered: HPE AI Essentials); ~~power~~ (answered: hydropower); ~~latency~~ (answered: keep with disclaimer); datacentre facts we may publish; Q15 uptime vs Terms |
| 3 | Whether "ready-made AI" solutions are offered (Q4) |
| 4 | Confirm FormSubmit stays until the in-country backend; inbox for routes (sales, partners, press, support) |
| 5 | Review of use-case facts and any partner names |
| 6 | Team names/roles/photos (consent), timeline dates, compliance status for Trust, press contact |
| 8 | Go-live decision |
