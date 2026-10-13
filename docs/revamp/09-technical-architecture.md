# 09 · Technical architecture

How the site is built so it can be this alive *and* this fast. Versions verified on npm on 13 Oct 2026.

> **As built (13 Oct 2026).** The build departed from this plan in a few deliberate ways; where they differ, the code is the source of truth.
>
> - **No GSAP, Lenis, three.js or React Three Fiber.** Motion runs on one requestAnimationFrame clock (`lib/motion/clock.ts`), with springs generated as CSS `linear()` curves (`lib/motion/spring.ts`) and scroll progress read from cached geometry (`lib/motion/scroll.ts`); scrolling is native everywhere. WebGL is a small WebGL2 layer of our own (`lib/gl/core.ts`, `lib/gl/stage.ts`): one canvas per GL moment, inside its own DOM box (no fixed full-viewport canvas), and each scene a plain module in `components/gl/scenes/`: the valley hero (real elevation data, `scripts/build-terrain.mjs`) and the Living Mark (footer, and the 404's snow).
> - **Copy lives in `copy/en/*`**, not `content/en/*`: `/content/` is the CMS checkout and is gitignored.
> - **Palette for WebGL** is read from the CSS tokens in any colour syntax (the CSS build rewrites `oklch()` as `lab()`); scenes lit additively work in linear light, scenes printed on paper write gamma-encoded colour.
> - **Quality gates in CI** (`.github/workflows/verify.yml`): typecheck, lint, the static export with sample content, and an axe-core audit of every main page in both themes (`npm run audit:a11y`). The facts guard is strict on pull requests into main.

---

## 1. Stack

| Package | Version | Purpose | Notes |
|---|---|---|---|
| next | **16.4.x** | Framework, static export | Upgrade from 15.5; React 19.3 support; view transitions need no config |
| react / react-dom | **19.3.x** | Stable `<ViewTransition>`, `addTransitionType` | |
| typescript | 5.9 | | |
| tailwindcss | 4.3.x | Utility CSS on top of our token layer | Tokens are CSS custom properties, not hard-coded classes |
| gsap + @gsap/react | **3.15** + 2.1 | Timelines, ScrollTrigger, SplitText, ScrambleText, Flip, Observer, Inertia, DrawSVG, MorphSVG, CustomEase | Free "Standard" licence incl. all plugins |
| motion | **14.x** | React-state UI motion (AnimatePresence, layout) | `LazyMotion` + `domAnimation`; `MotionConfig reducedMotion="user"` |
| lenis | **1.3.x** | Wheel smoothing on desktop only | Driven by `gsap.ticker`; off on Safari/touch/reduced motion |
| three | **0.186.x** (pinned) | 3D | Hold at 0.186 until postprocessing supports 0.187 |
| @react-three/fiber | 9.8.x | React renderer for three | `frameloop="never"`, advanced by our clock |
| @react-three/drei | 10.7.x | `View`, `PerformanceMonitor`, `useGLTF`, `AdaptiveDpr` | Draco/meshopt decoders self-hosted |
| @react-three/postprocessing | 3.2.x | Bloom on Tier 3 desktop only | |
| maath | 0.10.x | Damping helpers | |
| @pmndrs/detect-gpu | 6.0.x | Initial quality hint | Benchmarks self-hosted |
| @number-flow/react | 0.6.x | Animated numbers | |
| react-hook-form + @hookform/resolvers + zod (`zod/mini`) | 7.90 / 5.9 / 4.6 | Forms | `zod/mini` keeps it ~4 KB |
| @paper-design/shaders-react | 0.0.81 (exact) | Prototyping only; shaders ported into our canvas | Apache-2.0, keep NOTICE |
| minisearch | 7.x | Blog search (exists) | |
| web-vitals | 6.x | Field metrics (only if a privacy-respecting endpoint exists; see §12) | |
| Dev: @gltf-transform/cli, gltfjsx, leva, stats-gl, @lhci/cli, unlighthouse, playwright, @axe-core/playwright | | Tooling | Dev-only |

Explicitly **not used**: GSAP ScrollSmoother, Barba/Swup/Taxi/Highway, Theatre.js, Spline/Unicorn runtimes, Lottie, PixiJS, Babylon, next-themes, COEP header, client-side fluid simulation on phones.

---

## 2. Repository layout (revamp branch)

```
app/
  layout.tsx                  root: <html> theme bootstrap, fonts, GLRoot (dynamic), Header, Footer, Cursor
  (marketing)/…               pages (each page wraps content in <ViewTransition>)
  cms-preview/                CMS live preview (exists)
components/
  system/                     tokens-aware primitives: Button, Link, Card, Status, Metric, SpecTable, Terminal, Chip, Field…
  layout/                     Header, MegaPanel, MobileSheet, Footer, ValleyTime, ReduceMotionToggle, ThemeToggle
  motion/                     hooks: useScrollProgress, useDamped, useSplitReveal, useScramble, useMagnetic; Cursor
  gl/                         GLRoot, SceneManager, GLView, tiers, uniforms, shaders/*, scenes/*
  signature/                  S1…S18 (07)
  content/                    rich text renderer, layout blocks (exist; re-skinned)
  forms/                      Ascent, steps, PlanCard, field components
content/
  en/                         typed copy per page (home.ts, products.ts…)
lib/
  facts.ts                    the facts registry (04 §1)
  availability.ts catalog.ts gpu-specs.ts products.ts   (exist; reconciled with facts.ts)
  content/                    CMS loaders (exist)
  motion/tokens.ts            durations, springs → CSS linear() + GSAP CustomEase
  theme/                      tokens → CSS vars → WebGL uniforms
scripts/
  build-dot-sources.mjs       logo/wordmark SVG → binary dot arrays
  build-terrain.mjs           DEM → packed height texture
  build-covers.mjs            generative covers + OG PNGs
  prepare-content.mjs postbuild-content.mjs   (exist)
public/
  gl/                         terrain, dot sources, decoders, posters (AVIF light/dark)
docs/revamp/                  this plan
```

---

## 3. The persistent canvas

```
<html>
  <body>
    <GLRoot/>        ← fixed, full-viewport R3F <Canvas frameloop="never" eventSource={document.body} aria-hidden>
                       mounted via next/dynamic(ssr:false) after LCP + idle
    <Header/>
    <main>  … <GLView id="hero" poster="…"/> …  </main>
    <Footer/>  ← contains <GLView id="reservoir"/>
```

- **GLView** is a DOM box (fixed aspect, poster image inside). drei `<View track={ref}>` renders the scene into that rectangle of the shared canvas. On the first rendered frame the poster cross-fades out — no layout shift.
- **One WebGL context** for the whole site (avoids per-component contexts and Chrome's context limits). Scenes register with the **SceneManager**: `{ id, priority, tierMin, visible (IntersectionObserver), needsFrame() }`.
- **One clock**: `gsap.ticker` runs, in order: `lenis.raf(t)` → ScrollTrigger update → damped uniforms → `advance()` R3F *only if* a visible scene needs a frame. Idle scenes cost nothing.
- **Shared uniforms**: `uTime`, `uPointer` (damped), `uScrollVel`, `uTheme` (palette, lerped), `uEnergy` (Glow), `uReducedMotion`.
- **Across routes**: the canvas lives in the root layout and is given its own `view-transition-name` with its snapshot animations disabled, so it keeps rendering live during DOM transitions; scenes cross-dissolve via uniforms; route-specific assets are disposed after navigation and the likely next route's assets are prefetched when idle.
- **Context loss**: handle `webglcontextlost/restored`; fall back to posters.

### Quality tiers

| Tier | Who | Settings |
|---|---|---|
| 0 | Reduced motion, Save-Data, no WebGL2, blocklisted GPU, repeated context loss | Posters, static SVG logo, CSS only |
| 1 | Low-end Android, iOS Low Power (detected by ~30 fps cadence), battery < 20 % not charging | DPR 1, 30 fps ambient, ≤ 8k dots, no models, no post |
| 2 | Default ceiling for all phones; most laptops | DPR ≤ 1.5, ≤ 30k dots, models ≤ 600 KB, faked bloom |
| 3 | Desktop discrete GPUs, Apple M-series | DPR 2, real bloom, ≤ 100k points, fluid cursor trail |

Initial tier from `detect-gpu` (hint only) + device memory + Save-Data; then **drei `PerformanceMonitor`** adjusts at runtime in order: DPR → post-processing → point counts → poster. Phones are capped at Tier 2.

---

## 4. Motion runtime

- `lib/motion/tokens.ts` → generates CSS custom properties (`--spring-smooth: linear(…)`), GSAP `CustomEase`s, and Motion transition objects from the same numbers.
- `gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Observer, InertiaPlugin, DrawSVGPlugin, MorphSVGPlugin, CustomEase)` once in a client provider; ScrollTrigger dynamically imported after hydration.
- `useGSAP` for every component (automatic cleanup); `gsap.matchMedia()` contexts for breakpoints and reduced motion.
- `ScrollTrigger.config({ ignoreMobileResize: true })`; `ScrollTrigger.normalizeScroll(false)`.
- Pinned chapters use CSS `position: sticky`, not ScrollTrigger pinning (no DOM reparenting, no jump on mobile toolbars); ScrollTrigger only reads progress.
- Cursor: `gsap.quickTo` on transform; one listener; disabled on coarse pointers.

---

## 5. Page transitions

- Each `page.tsx` wraps its content in `<ViewTransition>`; enter/exit/share animations keyed by transition types (`nav-forward`, `nav-back`, `nav-up`) set through `<Link transitionTypes>`.
- `::view-transition { pointer-events: none }` prevents lost clicks.
- Shared-element names: `product-<slug>`, `post-<slug>`, `role-<slug>`, `metric-<id>`.
- The GL fog sweep is triggered from the transition's `onExit/onEnter` callbacks so DOM and WebGL move together.
- Reduced motion: durations 0 → crossfade 150 ms.

---

## 6. Theming implementation

- Tokens defined once (`lib/theme/tokens.ts`) → emitted as CSS variables per `[data-theme]` and as linear-sRGB floats for WebGL.
- Inline bootstrap script in `<head>` (≈ 20 lines): reads `localStorage['cv-theme']` (wrapped in try/catch) or `prefers-color-scheme`, sets `data-theme` + `color-scheme`; `suppressHydrationWarning` on `<html>`; `theme-color` meta per scheme.
- Toggle: `document.startViewTransition` + circular `clip-path` from the click point; WebGL palette lerps over 500 ms.

---

## 7. Content and CMS

- Keep the CMS pipeline already built (Payload → `CoreValleyAI/content` → build-time `lib/content`). Jobs, posts and the careers page render in the new components; schema v1 unchanged.
- Marketing copy lives in typed `content/en/*.ts` (not in the CMS for now) — reviewed in PRs; moving it into the CMS later is possible with new collections.
- `lib/facts.ts` becomes the single source of numbers; existing `catalog.ts`/`gpu-specs.ts` are corrected to H200 NVL values and verified MIG profiles.
- Generative covers are built from slugs at build time (`scripts/build-covers.mjs`).

---

## 8. Fonts

- `next/font/local` (self-hosted, static export-safe): Inter variable (wght + opsz, latin subset), JetBrains Mono variable (latin). `display: swap` with metric-adjusted fallbacks (zero CLS).
- Devanagari font added only to hi/ne layouts later (`unicode-range` scoped).

---

## 9. Media pipeline

| Asset | Pipeline |
|---|---|
| Terrain | Copernicus GLO-30 / SRTM tile → crop to valley → 512² R16 → packed PNG (attribution in footer credits) |
| Dot sources | SVG → rasterise → sample grid → `Float32Array` binary in `public/gl/` |
| 3D parts | Procedural in code; any modelled parts → glTF → `gltf-transform optimize --compress meshopt` → KTX2 (ETC1S/UASTC) only if textures are heavy |
| Posters | Rendered from the actual scenes (headless capture script) in light + dark → AVIF + WebP fallback |
| Video loops | HyperFrames compositions → AV1/HEVC/VP9 with posters; used for Tier 0 enrichment and social only |
| Covers/OG | Generative script → WebP covers + 1200×630 PNG OG |
| Images generally | Build-time responsive variants (AVIF/WebP) via next-image-export-optimizer |

---

## 10. Forms

- react-hook-form + `zod/mini` schemas per step; validate on blur and on step submit.
- Submission: FormSubmit (as today, disclosed) until the in-country form backend exists (CMS server phase). The Ascent posts multipart/JSON; graceful native-POST fallback; JS-disabled path renders a single plain form.
- Drafts: sessionStorage (try/catch), cleared on success.
- Spam: honeypot + minimum fill time; no third-party CAPTCHA.

---

## 11. Hosting and delivery (GitHub Pages — owner decision)

- Production stays on GitHub Pages at corevalley.ai. **Staging**: the existing `deploy.yml` builds the `revamp` branch into `/revamp/` (noindex) exactly as it builds `/preview/` — added in Phase 0.
- Known GitHub Pages limits and mitigations:
  - All files served with `max-age=600` (even hashed chunks) → **a small service worker** caches `/_next/static/*`, `/gl/*`, `/fonts/*` cache-first (immutable, content-hashed) and HTML network-first; scoped to the base path; versioned; kill-switch.
  - gzip only (no brotli) → keep bundles lean; precompress nothing.
  - No custom headers → CSP via `<meta http-equiv>` (no `frame-ancestors` possible), `referrer` meta; COOP not settable (not needed).
  - No 301s → meta-refresh stubs with canonicals.
  - 1 GB site limit → keep media lean (budget ≤ 150 MB total for the revamp).
- If any of these become blocking, revisit Cloudflare Workers static assets (research favoured it); DNS is already on Cloudflare.

---

## 12. Privacy and analytics

- The privacy page promises no analytics/tracking cookies. Keep it that way at launch.
- Optional later: a self-hosted, cookieless metrics beacon (web-vitals + page views) to an endpoint on the CMS server in Nepal — only with a privacy page update.
- No third-party embeds that track (YouTube via `youtube-nocookie` only, click-to-load).

---

## 13. SEO and metadata

- Reuse `lib/seo.ts` `pageMetadata` and `components/seo/json-ld.tsx` (Organization, WebSite, Breadcrumb, Service per product, FAQPage on owner pages, JobPosting, BlogPosting, Person).
- Every page server-renders its text (no canvas-only content); `alt` for every meaningful image; generative OG per page.
- Sitemap/robots as today; staging `noindex`; IndexNow on production deploys.

---

## 14. Testing and CI

| Layer | Tool | Gate |
|---|---|---|
| Types, lint | tsc, eslint | Required |
| Unit | vitest (motion tokens, facts registry, content loaders, generators) | Required |
| E2E | Playwright: navigation, forms (Ascent paths), theme, reduced motion, keyboard | Required |
| Accessibility | @axe-core/playwright on every route, both themes | 0 serious/critical |
| Visual | Playwright screenshots per route × theme × 3 widths (diff threshold) | Review on change |
| Performance | Lighthouse CI (mobile) budgets: LCP ≤ 2.0 s, TBT ≤ 150 ms, CLS ≤ 0.05, JS ≤ 170 KB initial | Required |
| Facts | Build fails on `to-verify` facts in production; confidential values never stored in the repo | Required |
| Devices | Manual matrix each phase (10 §3) | Phase gate |
