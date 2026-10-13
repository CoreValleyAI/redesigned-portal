# 05 · Design system

Two complete themes, one sans, one mono, one accent, a 4-px rhythm, and a dot. Everything is a token; tokens are shared by CSS, GSAP and WebGL so a theme change re-colours the DOM and the 3D world in the same frame.

---

## 1. Colour

### 1.1 Principles

- **One accent: hydro green.** Used to point (links, focus, the one primary action, "live" states, the dot that is switched on). Never as a large fill behind text.
- **Lots of neutral.** Each theme has a tuned neutral ramp; hierarchy comes from luminance steps, not borders.
- **Glow colours exist only for the Glow.** Glacier cyan and dusk violet appear *only* inside the "machine is working" gradient and generative art, never as UI colours.
- **OKLCH everywhere**, with sRGB fallbacks generated at build; P3 boosts inside `@media (color-gamut: p3)`.
- **Contrast is non-negotiable**: body text ≥ 7:1, secondary ≥ 4.5:1, UI boundaries ≥ 3:1 in both themes.

### 1.2 Theme "Night Valley" (dark)

| Token | OKLCH | ≈ Hex | Use |
|---|---|---|---|
| `--bg` | `oklch(0.145 0.012 250)` | #0B0F14 | Page |
| `--bg-raised` | `oklch(0.185 0.012 250)` | #13181F | Cards, panels |
| `--bg-sunken` | `oklch(0.115 0.010 250)` | #070A0E | Terminals, code |
| `--line` | `oklch(0.30 0.012 250 / 0.6)` | | Hairlines |
| `--ink` | `oklch(0.96 0.005 250)` | #EEF1F4 | Primary text |
| `--ink-2` | `oklch(0.78 0.010 250)` | #B4BCC6 | Secondary text |
| `--ink-3` | `oklch(0.62 0.012 250)` | #858F9B | Captions, footnotes |
| `--hydro` | `oklch(0.84 0.19 150)` | #4ADE80 | Accent (brand, unchanged) |
| `--hydro-ink` | `oklch(0.88 0.15 150)` | | Accent text on dark |
| `--dot-off` | `oklch(0.42 0.02 250)` | | Unlit dots |
| `--dot-on` | `= --hydro` | | Lit dots |

### 1.3 Theme "Glacier" (light)

| Token | OKLCH | ≈ Hex | Use |
|---|---|---|---|
| `--bg` | `oklch(0.985 0.004 240)` | #F7F9FB | Page (cool paper, not pure white) |
| `--bg-raised` | `oklch(1 0 0)` | #FFFFFF | Cards |
| `--bg-sunken` | `oklch(0.955 0.006 240)` | #EDF0F3 | Wells, code (light terminals) |
| `--line` | `oklch(0.86 0.008 240)` | | Hairlines |
| `--ink` | `oklch(0.20 0.015 250)` | #141A21 | Primary text |
| `--ink-2` | `oklch(0.42 0.015 250)` | #4D5763 | Secondary |
| `--ink-3` | `oklch(0.55 0.014 250)` | #6E7884 | Captions |
| `--hydro` | `oklch(0.52 0.14 152)` | #12773A | Accent (brand dark green from live site) |
| `--hydro-ink` | `oklch(0.47 0.13 152)` | | Accent text on light (AA) |
| `--dot-off` | `oklch(0.80 0.01 240)` | | Unlit dots |
| `--dot-on` | `= --hydro` | | Lit dots |

### 1.4 The Glow palette (state colour, both themes)

`--glow-1: hydro`, `--glow-2: oklch(0.84 0.11 205)` glacier cyan, `--glow-3: oklch(0.66 0.17 295)` dusk violet, `--glow-4: oklch(0.83 0.13 75)` sunrise amber (only for warnings inside the glow). Rendered additively on dark, multiplied/soft-light on light.

### 1.5 Theme behaviour

- Default follows the OS (`prefers-color-scheme`); a toggle overrides and is remembered (`cv-theme`, local only — privacy page updated accordingly).
- No flash: a ~20-line inline script in `<head>` sets `data-theme` and `color-scheme` before paint (no next-themes).
- The switch animates as a circular reveal from the toggle (View Transitions); the WebGL palette lerps over the same 500 ms. Instant under reduced motion.
- **No mixed bands.** A page is one theme. Each page may have *one* "night chapter" in light theme (e.g. the hero valley at dusk) — deliberate, not alternating.

---

## 2. Typography

### 2.1 Families

| Role | Family | Why | Files |
|---|---|---|---|
| Everything (display, UI, body, numbers) | **Inter** variable (wght 300–700, opsz 14–32) | Closest licensed match to SF Pro's optical behaviour; superb numerals; huge language coverage | woff2, latin subset ≈ 71 KB (with opsz) |
| Data, code, spec readouts, kickers | **JetBrains Mono** variable (wght 400–700) | Already the brand's mono; tabular and legible | ≈ 40 KB latin |
| Devanagari (later) | **Noto Sans Devanagari** variable | Quality, weight range, OFL | ≈ 118 KB, hi/ne routes only |

SF Pro cannot be self-hosted (licence); `system-ui` is not used as primary so all platforms see the same brand.

### 2.2 Scale (fluid, `clamp()`), weights and tracking

| Token | Size (mobile → desktop) | Line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-1` | 52 → 128 px | 0.95 | 600 | −0.035em | Home hero only |
| `display-2` | 40 → 88 px | 1.0 | 600 | −0.03em | Page heroes |
| `title-1` | 32 → 56 px | 1.05 | 600 | −0.022em | Chapter headlines |
| `title-2` | 24 → 36 px | 1.12 | 600 | −0.015em | Section headlines |
| `title-3` | 20 → 24 px | 1.25 | 600 | −0.01em | Card titles |
| `lead` | 18 → 22 px | 1.45 | 400 | −0.011em | Intros |
| `body` | 16 → 17 px | 1.55 | 400 | −0.006em | Body |
| `small` | 14 px | 1.5 | 400 | 0 | Secondary |
| `caption` | 12.5 px | 1.4 | 450 | +0.005em | Footnotes |
| `kicker` (mono) | 11 → 12 px | 1.3 | 500 | +0.14em, uppercase | Eyebrows, labels |
| `metric` | 64 → 160 px | 0.9 | 600 | −0.04em, tabular | The one big number per moment |

Rules: headlines weight 600, never 700+; no Light/Thin below 20 px; numbers always `font-variant-numeric: tabular-nums`; max line length 68ch for body; balance headlines (`text-wrap: balance`), pretty paragraphs (`text-wrap: pretty`).

---

## 3. Space, grid, shape

- **Rhythm:** 4-px base. Spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.
- **Section rhythm:** 128–192 px vertical on desktop, 72–96 px on phones. One idea per section.
- **Grid:** 12 columns, max content 1280 px, gutters 24 px (desktop) / 16 px (phone), page margins `clamp(16px, 5vw, 64px)`. Full-bleed chapters break out of the grid deliberately.
- **Radii:** 8 (inputs, chips), 16 (cards), 28 (feature panels), 999 (pills). The big 2.5rem slab radius of the preview retires.
- **Elevation:** almost none. Separation by luminance and space. One shadow token for floating chrome (header, sheets, menus).
- **Hairlines:** 1 px `--line`; scroll-edge fades instead of borders under floating chrome.

---

## 4. Materials

- **Liquid glass on floating surfaces** (owner, 13 Oct 2026: "incorporate liquid glass throughout the site"). One material (`app/styles/glass.css`): a tint that holds text contrast on any backdrop (white ≥ 0.50, night ≥ 0.57), backdrop blur and saturation with literal values (WebKit 297620), a rim lit from the top-left, a soft lift. Used on the header bar (with a 200 % backdrop masked back to the bar, so nothing pops in under it), the mobile menu sheet, the mega panels, the hero's fact strip and the carousel's controls. Over our own WebGL scenes the scene draws the glass itself (`lib/gl/glass.ts`): its own pixels blurred (dual Kawase) and refracted at a convex-squircle bezel by Snell's law, with a per-pixel scrim that keeps the text at 4.5:1 — exact in every browser, unlike `backdrop-filter: url()` refraction, which only Chromium paints. No glass library: the snapshot libraries go stale on dynamic pages, and the SVG ones refract only in Chromium. Respect `prefers-reduced-transparency` and `prefers-contrast: more` (solid), and `forced-colors`.
- **Content surfaces are solid**: `--bg-raised` cards with hairline or no border.
- **No grain, no noise overlays, no glow on cards.**

---

## 5. Iconography

- One icon set: **Phosphor** (already in the project) in *regular* weight at 20/24 px, *duotone* only inside product chips.
- Custom pictograms for the six products built **from dots** (a 7×7 dot glyph per product) — they double as the mega-menu micro-visuals and favicons for product pages.

---

## 6. Imagery policy

| Allowed | Not allowed |
|---|---|
| Generative dot-matrix and contour art made by us (deterministic, seeded) | Stock photography (all five Unsplash images retire) |
| Procedural/stylised 3D hardware drawn by us, faithful in layout to the HPE DL380a Gen12 + H200 NVL | Real NVIDIA/HPE product renders without licence |
| Terrain from public elevation data (Copernicus GLO-30 or SRTM, with attribution) | Real coordinates or recognisable images of the facility |
| Commissioned photography of our real people and real places (later), with consent | AI-generated "people" or fake offices |
| Real console/API UI rendered as live components | Fake dashboards with invented numbers |
| HyperFrames-rendered video loops as posters/fallbacks | Autoplaying sound |

Cultural care: no prayer flags, Buddha eyes, Everest/Sherpa clichés as decoration; Devanagari typeset properly when used.

---

## 7. Components (inventory)

| Component | Notes |
|---|---|
| **Button** | Primary (hydro on dark ink / ink on light), secondary (outline), ghost, icon. Press = scale .97 on pointer-down; magnetic on fine pointers only; loading state hands off to the Glow |
| **Link** | Underline that draws in on hover (DrawSVG-style), ↗ for external |
| **Header / mega panel / mobile sheet** | See 03 §2 |
| **Status** | The one way to show availability: mono kicker + rule + text; reads from `lib/availability.ts` |
| **Metric** | The one-big-number component: value, unit, comparator line, footnote, scroll-linked NumberFlow |
| **SpecTable** | Server-rendered table; engineer-mode density; copy-as-text |
| **Terminal** | Real commands only; typed-out playback; copy button; light and dark variants |
| **Chip** | Product chips (dot glyph + name) |
| **Card** | Solid; hover = luminance lift + dot glyph animates |
| **Tabs / Segmented** | Spring indicator |
| **Accordion / FAQ** | Native `<details>`; height via grid 0fr→1fr |
| **Form field family** | Text, email, select-as-cards, range-as-dial, file drop, consent switch (see 07 §11) |
| **Footnote** | Superscript marker ↔ footnote list at the bottom of the page, keyboard-navigable both ways |
| **Toast** | Bottom-centre, spring, auto-dismiss with progress dot |
| **Breadcrumb** | Quiet, mono separators |
| **GLView** | DOM box that hosts a WebGL view in the persistent canvas; shows its poster until the first frame |

---

## 8. Accessibility baked into the system

- Focus ring: 2 px `--hydro` + 2 px offset, never removed; visible on every interactive element including canvas proxies.
- Targets ≥ 44×44 px on touch.
- Every canvas has a DOM equivalent (text, controls) and is `aria-hidden`.
- Colour never carries meaning alone (status has text; charts have labels).
- Motion tokens all have reduced-motion equivalents (see 06).
- Text resizes to 200 % without loss; layouts use `rem`.
