# 06 — Design System & Frontend

**Owner:** Kaustuv · **Support:** Abhigyan

**Status:** ✅ **Implemented** — the design-system bridge, the primitive library
and the determinism rules are complete and in production use across all 24 routes.

---

## 1. The bridge — `app/globals.css`

This is the load-bearing file of the entire frontend. The design-system token
files under `design_system/tokens/` are the **single source of truth**; no value
is ever restated in application code.

### 1.1 Import order is the mechanism

```css
/* 1 — Tailwind first. It declares @layer theme, base, components, utilities. */
@import "tailwindcss" source(none);

/* 2 — Design-system tokens into layer(theme) AFTER Tailwind, so same-named
       tokens win by source order. */
@import "../design_system/tokens/colors.css"     layer(theme);
@import "../design_system/tokens/typography.css" layer(theme);
@import "../design_system/tokens/spacing.css"    layer(theme);

/* 3 — Element defaults into layer(base) so utilities still beat them. */
@import "../design_system/tokens/base.css" layer(base);

/* 4 — Explicit class sources. */
@source "../app";
@source "../components";
@source "../lib";
```

Because the token files land in `layer(theme)` *after* Tailwind's own theme
declarations, same-named custom properties win by source order. `rounded-md`
becomes 6 px and `text-sm` becomes 13 px for free — no per-utility overrides, no
`!important`.

### 1.2 Five rules that break silently if changed

These are documented in the repository README and reproduced here because each one
fails **without an error** — the build succeeds and the page is subtly wrong.

| # | Rule | Failure mode if broken |
|---|---|---|
| 1 | `base.css` is imported into `layer(base)`, **never unlayered** | Unlayered CSS beats every cascade layer, so an unlayered `body { background }` would defeat `bg-carbon-800` on the body |
| 2 | `--container-*: initial` deletes Tailwind's container namespace | The design system's 640/960/1200/1400 px would redefine `max-w-sm..xl` and make the scale non-monotonic. Page widths use `max-w-page-*` |
| 3 | Token files are **never** placed inside `@theme` | `--text-primary` is a *colour* that shares Tailwind's font-size namespace; registering it would generate `.text-primary { font-size: <a colour> }` |
| 4 | Semantic aliases are renamed on the bridge | `fg-*` for text roles (not `text-*`, which yields `text-text-muted`) and `line-*` for hairlines |
| 5 | `tokens/fonts.css` is **not** imported | `next/font` self-hosts both faces; importing the CDN copy would double-download and reintroduce layout shift |

### 1.3 Font binding

Both faces are variable fonts loaded through `next/font`, then rebound onto the
design-system variable names:

```css
:root {
  --font-body: var(--font-manrope);
  --font-mono: var(--font-jetbrains-mono);
}
```

```tsx
// app/layout.tsx — omitting `weight` ships one woff2 per family covering
// the whole 300-800 range instead of nine static instances.
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});
```

`fallback` carries the stack `tokens/typography.css` declares; `next/font`
prepends a metric-adjusted local fallback, which holds CLS at zero.

### 1.4 Custom utilities

`@utility` blocks fill gaps where a design-system name has no Tailwind namespace
slot: `text-2xs`, `text-md`, `tracking-label`, `rounded-pill`, `font-body`,
`font-display`, `ease-standard`, `duration-fast|normal|slow`,
`border-subtle|default|strong|hydro`, `cv-label`.

---

## 2. Colour system

Dark-mode-first. Carbon grounds everything; Hydro green is a signal, never a wash.

| Token | Value | Role |
|---|---|---|
| `--hydro` | `#4ADE80` | Primary accent / action |
| `--hydro-dark` | `#16A34A` | Hover / secondary green |
| `--carbon` | `#05080D` | Ground |
| `--ink` | `#E8ECEF` | Primary text on dark |
| `--mute` | `#6B7280` | Secondary text |

Derived scales: `--hydro-100…900` plus `--hydro-glow`; `--carbon-900` (ground) →
`--carbon-800` (sunken) → `--carbon-700` (card) → `--carbon-600` (raised /
popover); `--ink-*` for text steps.

The base palette is taken verbatim from Brand Guidelines v1.0 (§06 Color). Surface,
border and state tokens are derived extensions.

`app/layout.tsx` also declares the UA-level colour scheme, without which the page
renders with a white scrollbar against a `#05080D` ground:

```ts
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05080D",
};
```

---

## 3. Glassmorphism

A **deliberate deviation** from the design system's "transparency and blur,
sparingly", made on explicit client direction. Ground, accent, motion, corners and
the no-emoji rule are unchanged.

Four sanctioned recipes live in `app/glass.css` as selector aliases over one
liquid-glass recipe — native SVG refraction (`backdrop-filter: url(#…)`, from
`components/fx/liquid-filter.tsx`) on Chromium, plain blur + saturation on
Safari and Firefox. They are selectors, not `@utility` blocks, because
Tailwind v4's `@apply` resolves only Tailwind utilities:

| Class | Used by |
|---|---|
| `glass-card` | Marketing feature cards |
| `glass-nav` | Sticky site header, portal topbar |
| `glass-modal` | The auth dialog |
| `glass-panel` | Portal data surfaces — denser, because tables and logs are read for hours |

Each has a **mandatory** solid fallback:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  /* solid surfaces — without this these panels render as transparent voids */
}
```

---

## 4. Component library

### 4.1 UI primitives — 11 total, 9 server / 2 client

`components/ui/`: `Badge`, `Button`, `Card`, `Icon`, `IconButton`, `Input`,
`StatBlock`, `Switch`, `Tabs`, `Tag`, `Terminal`. All exported from
`components/ui/index.ts`.

Only `Tabs` and `Switch` are client components.

**Why the ratio matters.** The design-system originals drove hover and press
through `useState`, which forced `"use client"` on 7 of 11 components. That
dragged icon path data into the client bundle, broke hover for keyboard users, and
latched the hover state on touch devices. Moving interaction state into CSS
(`hover:`, `active:`, `focus-visible:`) inverted the ratio to **9 server, 2
client**.

Variants are `class-variance-authority`; class conflicts are resolved by
`clsx` + `tailwind-merge` through `lib/cn.ts`.

### 4.2 Icons

`components/ui/icon.tsx` wraps Phosphor behind a **closed** name union:

```ts
const ICONS = { activity: Pulse, "arrow-right": ArrowRight, /* … */ } as const;
export type IconName = keyof typeof ICONS;
```

- A typo is a **type error**, not a runtime blank.
- Swapping icon libraries is a change to one file.
- Imports come from `@phosphor-icons/react/dist/ssr` — the package's default entry
  uses React context and would force `"use client"` on every consumer.
- Every glyph sets `style={{ flex: "none", display: "block" }}` so flex parents
  cannot squash it.

**Documented deviation:** the design system hand-rolls a 30-glyph Lucide subset
with no glyphs for API keys, invoices, certificates, clusters or charts. Phosphor
(MIT, no attribution) covers all of them and ships six weights, which lets
active/inactive states differ by stroke weight rather than only by colour. This
mirrors the design system's own precedent of documenting Lucide as a substitution.

### 4.3 Portal components

`components/portal/`:

| Component | Kind | Purpose |
|---|---|---|
| `primitives.tsx` | Server | `PodStatusPill`, `UtilBar`, `PortalPageHeader`, `MetricTile`, `PlaceholderPricingBadge`, `EmptyState`, `TableScroll`, `Th` |
| `launch-form.tsx` | Client | Pod launch wizard |
| `pod-live.tsx` | Client | Live status + telemetry panel |
| `usage-chart.tsx` | **Server** | `UsageChart` (inline SVG area chart) and `Sparkline` |

**`UsageChart` is a server component with no charting dependency.** The series is
already deterministic, so the SVG path is byte-identical on the server and after
hydration. This is the reason no charting library is installed: every library in
that category is client-only.

```tsx
const coords = points.map((p, i) => {
  const x = pad + i * stepX;
  const y = H - pad - (p.v / max) * (H - pad * 2);
  return `${x.toFixed(2)},${y.toFixed(2)}`;   // fixed precision ⇒ stable string
});
```

`toFixed(2)` is not cosmetic — it pins float formatting so the path string cannot
differ between two JavaScript engines.

Status tone mapping is exhaustive over the union, so adding a `PodStatus` without
a tone is a compile error:

```ts
const POD_TONE: Record<PodStatus, { tone: …; dot: boolean }> = { … };
```

`TableScroll` wraps every dense table in `overflow-x-auto`, so a wide table
scrolls inside its own container and the page body never scrolls horizontally.

---

## 5. Hydration determinism

The single most important frontend invariant. A server render and the client
render that hydrates it must produce **byte-identical** markup.

### 5.1 Rules

| Rule | Enforced by |
|---|---|
| No `Math.random()` in render | `makeRng(seed)` — mulberry32, seeded from a stable FNV-1a string hash |
| No unquantised `Date.now()` | `now()` floors to the hour |
| No relative timestamps in SSR output | `formatDateTime()` renders absolute UTC |
| Fixed float precision in generated strings | `toFixed(2)` in chart path generation |
| Live drift only after mount | Applied solely by the mock's `subscribe*` timers |

```ts
/** Current time, floored to the hour so SSR and hydration agree. */
export function now(): number {
  const HOUR = 3600_000;
  return Math.floor(Date.now() / HOUR) * HOUR;
}
```

```ts
/**
 * Absolute UTC timestamp. Deliberately not "3 minutes ago": relative times
 * computed during SSR disagree with the client render and cause hydration
 * mismatches.
 */
export function formatDateTime(iso: string): string { … }
```

### 5.2 Why the mock is a PRNG and not a fixture file

Two reasons, both structural:

1. **Hydration.** A fixture file would work too, but a PRNG lets the data respond
   to inputs (a newly launched pod gets a usage curve immediately) while staying
   reproducible.
2. **Chart stability.** `usageAt(subjectId, meterId, bucketIndex)` is a pure
   function of its inputs, so a usage chart does not change shape every time a
   screen re-renders.

---

## 6. Layout composition

```
app/layout.tsx                     fonts · metadata · viewport · <AuthProvider>
├── app/(marketing)/layout.tsx     <SiteHeader> · <main> · <SiteFooter>
└── app/(portal)/portal/layout.tsx <PortalShell>  + robots: noindex, nofollow
```

`AuthProvider` is mounted at the **root**, not per group, so `useSession()` works
on marketing pages too — that is what lets the header swap Sign In / Sign Up for a
**Console** link.

### `PortalShell`

`components/layout/portal-shell.tsx` owns the fixed sidebar, the glass topbar and
the scrolling content area. Navigation is a static three-group structure:

| Group | Items |
|---|---|
| `compute` | overview · pods · notebooks · models · dedicated |
| `platform` | vclusters · network · api keys |
| `account` | usage · billing · audit log · security · settings |

Active-route marking uses an exact match for `/portal` and a prefix match
elsewhere, so `/portal` does not light up on `/portal/pods`:

```ts
function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname.startsWith(href);
}
```

Identity rendering (added with the Keycloak integration):

```tsx
const { data: session, status } = useSession();
const user = session?.user;
const loading = status === "loading";
const displayName = user?.name ?? user?.email ?? (loading ? "…" : "Account");
```

The `Avatar` component renders the Keycloak profile picture when the realm
supplies one and two-letter initials otherwise. A plain `<img>` is used rather
than `next/image` because the URL is an arbitrary IdP origin and `next.config.ts`
runs images unoptimized anyway.

`initials()` is written against `noUncheckedIndexedAccess`, so every index access
is guarded:

```ts
function initials(name?: string | null): string {
  const source = name?.trim();
  if (!source) return "cv";
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0];
  const last = parts.length >= 2 ? parts[parts.length - 1]?.[0] : undefined;
  if (first && last) return (first + last).toLowerCase();
  return source.slice(0, 2).toLowerCase();
}
```

---

## 7. Accessibility

Patterns applied consistently across the codebase:

| Pattern | Where |
|---|---|
| Native `<dialog>` with `showModal()` | `auth-modal.tsx` — focus trap, Escape and inertness come from the platform, not a hand-rolled implementation |
| `aria-current="page"` | Sidebar navigation |
| `aria-pressed` | Slice-profile and image selectors in the launch wizard |
| `aria-label` | Every icon-only control |
| `role="img"` + `aria-label` | `UsageChart`; `Sparkline` is `aria-hidden` (decorative) |
| `focus-visible:` rings | All interactive primitives — keyboard-only, not on mouse click |
| `prefers-reduced-motion` | Hero canvas renders one static frame and never starts the loop |
| `role="alert"` | Auth error banner |

---

## 8. Marketing surfaces of note

<details>
<summary><b>Hero terrain — the ridgeline in motion</b></summary>

<br>

`components/marketing/dot-terrain.tsx`. The brand's dot-matrix ridgeline as a
live scene: a 360 × 200 grid of Hydro points displaced in a vertex shader —
fractal-noise dunes in the foreground, ridged-noise peaks rising with depth, a
valley carved along a sinusoidal river whose dots glow, exponential fog toward
the horizon, and a per-dot flicker. Two additive passes (a wide faint halo under
a crisp core) turn overlapping dots into glow. The pointer is cast onto the
ground plane and lifts and lights the dots around it.

Raw WebGL with no dependency: react-three-fiber would add the three.js runtime
to the LCP-critical homepage for one effect. Sleeps out of view and when the tab
is hidden; DPR capped at 2; `prefers-reduced-motion` renders one frame and
stops; no WebGL renders nothing over the Carbon ground.
</details>

<details>
<summary><b>Sovereign latency mesh — real regional basemap</b></summary>

<br>

`components/marketing/sovereign-mesh.tsx`. Country outlines come from Natural Earth
via `world-atlas`, clipped to a South Asia window and projected into a 0–1 unit box
**at build time**:

```bash
npm run generate:basemap    # rewrites lib/mesh-basemap.ts
```

`lib/mesh-basemap.ts` is **generated and committed — do not edit it by hand**.
`world-atlas` and `topojson-client` are devDependencies only; nothing geo ships to
the browser, just 67 path strings (~8 KB gzipped) and the projection function.

Cities are plotted at their real coordinates through the same `projectToUnit` used
to generate the paths — that is what keeps a marker on the right piece of
coastline. Radius carries no meaning; latency lives in the label, the particle
speed and the curve opacity.

Label collisions are handled by per-city anchors in `lib/mesh-nodes.ts` — Kolkata
and Dhaka are only ~25 px apart at desktop size. If you add a city, check its
spacing before trusting the default.
</details>

<details>
<summary><b>Ridgeline asset — 5,439 circles</b></summary>

<br>

`public/brand/ridgeline.v1.svg` holds 5,439 `<circle>` elements. It is served as an
`<img>` or a CSS background, **never inlined** — inlining would put all 5,439 nodes
in the main DOM and ~273 KB of uncompressed markup into the RSC payload on every
render. 23 KB gzipped on the wire, with an immutable cache header configured in
`next.config.ts`. Use `object-cover`, never `100% 100%`: the brandbook forbids
stretching the aspect ratio.
</details>

---

## 9. Carried-over off-scale values

Preserved verbatim from the design system rather than silently "fixed". **Worth
raising with the designer** — these are inconsistencies in the source, not in the
implementation.

| Value | Issue |
|---|---|
| `Button` size `md` = 14 px | The type scale has 13 and 15, not 14 |
| `Terminal` body text = 13.5 px | Also off-scale |
| `Terminal` window dots = `#2A2F38` | No token exists for this colour |
| `Button` hover glow = `rgba(74,222,128,0.30)` | `--glow-hydro-md` is `0.40` |

---

## 10. Boundaries

| Boundary | Enforced by |
|---|---|
| `app/` and `components/` must not import from `design_system/` | ESLint rule |
| `design_system/` must not move | Carries `SKILL.md` frontmatter; moving it breaks skill discovery |
| `lib/mesh-basemap.ts` is generated | Regenerate with `npm run generate:basemap` |
| No CSS-in-JS, no animation library, no charting library | Convention — canvas, CSS and inline SVG only |
