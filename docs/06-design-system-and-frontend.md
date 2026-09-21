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
live scene. Four ranges of pyramidal peaks at increasing depth (a folded-noise
skyline with a low-frequency swell so each range has a dominant summit, a concave
cross-section for the slopes), fractal-noise dunes in the foreground, a river of
light threading through gaps in the ranges, aerial fog, and a per-dot flicker.

The terrain is drawn twice: first as an opaque mesh that writes depth, whose
fragment shader paints a world-space dot grid onto every face (crest bright,
base dim), then as depth-tested additive point sprites for the crest lines, the
river and the pointer light. Near ridges hide the dots of the ridges behind them,
so crests cut real silhouettes. The pointer lifts and lights the ground under it.

Raw WebGL with no dependency: react-three-fiber would add the three.js runtime
to the LCP-critical homepage for one effect. Sleeps out of view and when the tab
is hidden; DPR capped at 2; `prefers-reduced-motion` renders one frame and
stops; no WebGL renders nothing over the Carbon ground.
</details>

<details>
<summary><b>Reactive dot matrix — the mark and the ridgeline as live fields</b></summary>

<br>

`components/marketing/dot-matrix.tsx`. Any image becomes a field of Hydro dots:
the source is rasterised at grid resolution (progressive halving, so every source
pixel is averaged into its cell), coverage is normalised to the brightest cell
and shaped by an optional gamma, and each cell above the threshold becomes a dot
blitted from one pre-rendered glow sprite. The dots assemble out of a scatter the
first time they scroll into view, part around the pointer and light where it
passes, and flicker on their own phase. Used for the combined mark in the footer.
Canvas 2D; sleeps out of view; static
under `prefers-reduced-motion` and on coarse pointers.
</details>

<details>
<summary><b>The ground — grid floor (aurora removed)</b></summary>

<br>

There is one fixed canvas behind the marketing pages: `components/fx/grid-floor.tsx`
(described below). The earlier aurora shader gradient was removed on request —
the moving green haze was not wanted — and with it the last full-screen fragment
shader on the page. The body is transparent so the floor shows through; the
html element paints Carbon.
</details>

<details>
<summary><b>Stagger wipe, GPU chip graph, rack graphic, beam</b></summary>

<br>

- `components/fx/wipe-text.tsx` + `.wipe` in glass.css: each word rises out of
  its own clipped line when the enclosing Reveal shows, staggered by `--i`.
- `components/marketing/chip-graph.tsx`: an H200 die at the centre of dotted
  traces that bend once and end at labelled nodes; packets flow outward, the
  pointer lights the nearest trace and tilts the die. Canvas 2D.
- `components/marketing/rack-graphic.tsx` + `.rack` CSS: a rack elevation whose
  GPU cells rise and fall like utilisation and whose LEDs blink, all CSS.
- `components/marketing/rack-row-3d.tsx` + `.rack3d` CSS: three glass racks in
  CSS perspective with top and side faces, node trays with LEDs and live
  utilisation, a stage that leans toward the pointer, a rack that pulls out with its
  trays fanning open like drawers on hover, and a wave of load that follows
  the cursor across all cells. Takes `lit` to hold one rack pulled out and
  lit from outside (the pinned story drives it).
- `components/marketing/pinned-story.tsx`: the Platform section's pinned
  story. The rack row sits in a `position: sticky` column while three copy
  steps (slice, card, rack) scroll past; an IntersectionObserver with a band
  across the middle of the viewport picks the active step, which sets the
  row's yaw (`data-lit` in `.rack3d` CSS) and pulls that rack out. No
  scroll-jacking.
- `.beam` (glass.css): an arc of Hydro travelling a pane's border, driven by a
  registered `--beam` angle property. Used on the home CTA.
</details>

<details>
<summary><b>Scroll choreography</b></summary>

<br>

Four scroll-linked behaviours, all plain CSS driven by one custom property
or one data attribute, all resting at their static values without JS and
under `prefers-reduced-motion`. No animation library.

- `components/fx/scroll-scrub.tsx` — writes `--sp` (0 → 1) on its parent:
  `mode="exit"` is how far the parent has scrolled away (hero), `mode="view"`
  is its passage through the viewport (anything mid-page). One passive scroll
  listener, one rAF, only while the parent is on screen.
  - Hero parallax: `.hero-copy`, `.hero-term`, `.hero-stats` (glass.css)
    translate at different rates against `--sp`, and `DotTerrain` reads
    `scrollY / canvas height` each frame to pitch the camera down and pull it
    back, so the range moves against the copy. Scrubbed and reversible.
  - Architecture spine: `.trace::before` fills to `--sp` as the section passes.
- Entrance choreography: `Reveal kind="tilt"` lies a pane back 5° and brings
  it flat on entry (card grids use it); `.rack__fill` boots from empty the
  first time its `[data-reveal]` ancestor is shown (`cv-boot`, paused until
  then); the latency map draws its links outward from Kathmandu over about
  1.6 s on its first frame and holds packets until their link reaches them.
- `components/fx/scroll-rail.tsx` — a fixed hairline rail on the right with a
  Hydro fill tracking page progress and one dot per `[data-rail="label"]`
  section; the active one lights, clicking scrolls to it. Rendered from `xl`;
  labels appear on hover/focus and always from 1720px, where the page column
  leaves room for them. It is a nav of in-page links for assistive tech.
- Hero pointer. The cursor is ray-marched against a CPU port of the
  terrain height field (kept in step with the vertex shader, minus the
  pointer lift and dune breathing) from the scroll-adjusted camera, refined
  by bisection, so the light lands on the surface actually under the cursor
  — a far peak included — and a cursor over the sky lights nothing. It used
  to drop onto a flat ground plane, which put the light behind the far
  ranges and refused rays that pointed slightly upward.
- Touch. Every reactive graphic used to gate on `(pointer: fine)` and so
  sat still on phones. Each now answers a tap: the hero terrain lights the
  ground under the finger for a second; the chip graph lights the nearest
  trace; the policy grid sends a burst and lights the pods around the tap;
  the 3D racks pull out the tapped rack (`data-tap` carries the hover pose)
  and light the cells around the finger; the footer mark pushes its dots
  aside at the tap and springs back; the floor lays its pool of light where
  the finger landed. Continuous pointer-follow stays mouse-only, so page
  scrolling is never fought. The quote dials already turn by drag.
- Small screens. The pinned story keeps its pin: under `lg` the rack row
  rides above the steps, scaled to the column (`.rack3d-fit`) and stuck
  under the header, and the steps drop their viewport-height spacing. The
  console's three dials become a two-column grid under 40rem (GPU on its
  own row), and the screen stacks beneath them.
- The Fabric (latency map) section is currently switched off by the
  `SHOW_FABRIC` flag at the top of the home page; the code stays in place and
  the horizon section numbers renumber automatically.
- Latency map overlays are docked: the node detail card sits fixed in the
  frame's top-right corner (a hint when nothing is active) rather than
  floating beside the node, so nothing moves over the centre of the map.
- `components/fx/horizon.tsx` + `.horizon*` CSS — every section's opening
  rule. On reveal a head of Hydro light sweeps the rule left to right,
  drawing it, and the section's index and name clip in at the right end.
  Replaces the plain `.rule-fade` at section tops on the home page.
- Rail packet: the progress rail's fill ends in a glowing packet
  (`.rail__packet`); the active section's dot pulses (`.rail__land`, keyed on
  the active index so it restarts) when the packet lands on it.
- `components/marketing/quote-lock.tsx` + `.console*` / `.drum*` / `.odo*`
  CSS — the CTA's quote console, replacing the buttons. Three dials (GPU with ten
  options, weakest family first with size variants grouped, count, hours), each a machined metal block (solid Carbon-600, brushed grain, top-lit bevel, four corner screws) around a recessed window with a
  CSS-3D cylinder of options, knurled grips and chevrons, turned by wheel,
  drag, click or arrow keys (each is a spinbutton). Beside them a recessed
  screen: NPR per hour with digits rolling on 0–9 strips, then rows for the
  total, an illustrative US-cloud figure and the capacity state, and a
  "Request this plan" button carrying gpu/count/hours/npr as query params
  to the contact page. Rates are the catalogue's on-demand list prices;
  eight full cards bill as a node. The GPU list's middle rung (the h100 2g slice) is the default the
  intro settles on;
  every card is offered as available (the `soon` flag on a GPU still
  switches the capacity row to "quoted on request" if needed). The drum
  cylinder has 12 slots at 100px radius so ten options never share an angle. Intro: the dials sit two to four turns off
  until the console is 40% in view, then spin home in alternating
  directions on a long ease-out, staggered 160 ms apart, while the price
  rolls up from zeros; then the user has them. Static under reduced motion.
  Odometer columns are keyed by distance from the right, so a price that
  gains a digit keeps rolling its existing digits and grows the new leading
  column in from zero width. The console plate is a board: a raised Carbon
  surface with a seamless 96px PCB-trace tile in Hydro at 9%, a soft Hydro
  ambient glow around it, and a pulse of current (the same tile, brighter,
  under a travelling band mask) running toward the screen continuously: the band mask repeats every
  140% of the pane, so the next band enters as the last one leaves. Hidden under reduced motion. (A cost meter and a decoding CLI line
  were tried and removed at the user's request.)
- `components/marketing/policy-grid.tsx` — the Architecture graphic. A canvas
  dot grid of pods split by the Cilium boundary; packets inside a tenant
  arrive and light their pod, packets that try to cross are stopped at the
  line with a red flash; the pointer lights the nearest pod and sends packets
  as it moves, a click sends a burst; allowed/denied counters tick in the DOM.
- `components/fx/grid-floor.tsx` — the ground behind every marketing page,
  mounted in the marketing layout: a perspective grid in Hydro receding to a
  horizon at 44% of the viewport, mirrored above it as a fainter ceiling so
  the grid and the pointer's pool of light cover the whole viewport. It
  starts at the Platform section: fully out (and not drawn) under the hero,
  fading in as that section's top rises through the lower half of the
  viewport. Rows flow toward
  the viewer with scroll and drift slowly when the page is still; the pointer
  parallaxes the vanishing point and lays a pool of light on the floor; the
  brand's dots sit at the intersections. Canvas 2D, pauses when hidden. (A
  full-page reactive dot field was tried first and rejected as ugly.)
- Liquid glass (`.lg-liquid`, and every `.glass-card`): a lit rim (inset top
  and left glints), an inner haze that follows `--mx/--my`, and a fixed
  diagonal band of light. Cards are blur-only (14px); the SVG refraction map
  (`cv-lg-md`, scale 22) applies only to panes carrying `.lg-refract` — nav,
  CTA, footer. The footer is one such slab, floated off the page edge.

<details>
<summary><b>Rendering budget — what was cut, and why</b></summary>

<br>

One fixed canvas (the floor) moves behind every glass pane, and a
backdrop-filter pane has to re-filter on every frame its backdrop changes.
So the budget is: keep the ground cheap and slow, keep per-pane filters
cheap, and never animate layout. Concretely:

- The floor renders at 30 fps at ≤1.5 DPR with its gradients built once per resize, not per frame. The
  hero terrain caps at 1.5 DPR.
- Cards: blur only. The SVG displacement pass (`url(#cv-lg-md)`) is limited
  to `.lg-refract` panes, of which at most three are ever on screen.
- Nothing animates per card continuously. The liquid "caustic" drift (an
  animated custom property on every card) was removed for that reason.
- Rack cells: utilisation animates `transform: scaleY`, never `height`;
  the boot animation lives on the cell so the two never fight over
  `transform`. The 3D racks are solid Carbon-800, not glass — a
  backdrop-filter inside a preserve-3d stage re-reads its backdrop per
  rack per frame.
- The scroll rail writes its fill height straight to the DOM; no React
  render per scroll frame.
- A DOM cell field (330 animated elements over the CTA's backdrop-filter)
  and a full-page reactive dot canvas were both tried and removed as too
  slow or too busy.
- The floor runs to the very end of the page. (A switch that turned it off
  from the CTA down was tried and removed once the footer mark moved to
  WebGL and no longer needed protecting.)
- The dot-matrix mark (`components/marketing/dot-matrix.tsx`) renders as
  WebGL point sprites: one interleaved buffer (position, size, alpha per
  dot), one `bufferSubData` and one `drawArrays(POINTS)` per frame, glow in
  the fragment shader, additive blend. The spring physics stays on the CPU.
  It sleeps once settled with the pointer away. Without WebGL the finished
  mark is drawn once in 2D. (The Canvas 2D version — a sprite blit per dot
  with `lighter` — was the footer's lag.)
- The CTA has no slab: its copy and the quote console sit straight on the
  floor. The footer is `.lg-clear` — the most transparent glass weight: a 3%
  white tint over a 3px blur (more would erase the 1px floor lines) with the liquid rim and sheen, no refraction
  — so the floor reads straight through it.
</details>
</details>

<details>
<summary><b>Decode text — the terminal applied to a headline</b></summary>

<br>

`components/fx/decode-text.tsx`. A line resolves left to right with a block
cursor on the frontier and the next few characters cycling through mono glyphs
before they lock. Every character is rendered from the first paint (resolved,
scrambled, or invisible-but-sized) so layout never shifts, and the server
renders the finished string. The hero headline is three chained segments; the
last, "online.", keeps a blinking cursor and a slow Hydro glow (`online-glow`).
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
