# 06 · Motion system

Motion is a brand asset with tokens, rules and reviews — the same as colour. The goal the owner described ("Siri-like fluid", "120 fps", "no lag between elements", "cursor is fluid") translates into four engineering commitments:

1. **One clock.** DOM motion, scroll and WebGL advance on the same frame from one ticker — nothing drifts.
2. **Compositor first.** Animate `transform`, `opacity`, `clip-path`, `filter` (sparingly) — never layout. On iPhone Safari, where `requestAnimationFrame` is capped near 60 fps, compositor-driven CSS and native scrolling are what feel 120 Hz.
3. **Springs and interruption.** Anything the user can touch is spring-driven, starts from its current on-screen value and can be grabbed mid-flight.
4. **Budgets.** At most one hero-scale motion and two supporting motions on screen at once; everything else is still.

---

## 1. Tokens

### 1.1 Durations

| Token | ms | Use |
|---|---|---|
| `instant` | 0 | Reduced-motion substitutions |
| `micro` | 120 | Press, hover tints, toggles |
| `short` | 220 | Small UI (chips, menus items) |
| `base` | 380 | Panels, cards, reveals |
| `long` | 640 | Section entrances, page transitions (DOM) |
| `cinematic` | 1100–1600 | Hero assembly, chapter scenes (scroll-scrubbed ones have no duration) |

### 1.2 Springs (bounce 0 by default — no overshoot)

| Token | Duration · bounce | CSS `linear()` generated | Use |
|---|---|---|---|
| `spring.snappy` | 0.30 s · 0 | yes | Buttons, toggles, tabs indicator |
| `spring.smooth` | 0.45 s · 0 | yes | Panels, sheets, card lift |
| `spring.gentle` | 0.70 s · 0 | yes | Large surfaces, page-level moves |
| `spring.throw` | 0.40 s · 0.18 | — (JS only) | Only after a flick/drag release (slices, dataset token, carousels) |

Springs are generated once at build into CSS `linear()` strings and GSAP `CustomEase` curves from the same parameters, so CSS, GSAP and Motion agree.

### 1.3 Easing (for non-spring tweens)

- `ease.out` = `cubic-bezier(0, 0, 0.5, 1)` (Apple's) — entrances.
- `ease.inOut` = `cubic-bezier(0.65, 0, 0.35, 1)` — morphs.
- `ease.expo` = `cubic-bezier(0.16, 1, 0.3, 1)` — the hero's word rises.
- Exits are 20–30 % shorter than entrances; reversible transitions mirror their curve.

### 1.4 Distances

Entrance offsets are small: 12 px (UI), 24 px (cards), 48 px (section headlines). Scale entrances from 0.98, never from 0.

---

## 2. Choreography rules

1. **Order by meaning**: headline → supporting line → visual → controls. Stagger 60–90 ms between siblings, never more than 6 staggered items (group the rest).
2. **Lead with the cause.** If a button starts something, the button responds first (press), then the thing it caused moves.
3. **Spatial consistency.** Things leave the way they came; menus grow from their trigger (`transform-origin` at the trigger).
4. **One focal motion.** When a chapter's main visual is animating, surrounding UI holds still.
5. **Idle breath.** After 2 s of no scroll/pointer, hero visuals drift slowly (≤ 0.1 Hz amplitude-limited, avoiding the 0.2 Hz vestibular zone) — and stop entirely when off-screen or the tab is hidden.
6. **No preloaders.** First paint shows the final content; motion enhances what is already there. If the hero intro runs, it is ≤ 1.2 s, skippable by any input, and never replays for returning visitors in the same session.

---

## 3. Scroll system

| Context | Behaviour |
|---|---|
| Desktop with mouse wheel | **Lenis** smoothing (lerp ≈ 0.1), driven by `gsap.ticker`; ScrollTrigger reads Lenis |
| Trackpads on macOS/Safari | Native (ProMotion momentum beats any smoothing); Lenis disabled on Safari |
| Touch devices | **Native scroll**, always. No `syncTouch`, no ScrollSmoother, no scroll-jacking |
| Reduced motion | Native scroll; no scrubbing; chapters become static sequences |

**Pinned chapters**: a chapter is a tall section (`height: 300–500svh`) with a `position: sticky` stage (`100svh`). Both DOM and WebGL inside the stage stay still while scroll progress (0→1) drives the story. Because nothing moves *with* the scroll in a pinned stage, native asynchronous scrolling on phones cannot make DOM and WebGL drift apart.

**Damped read**: scroll progress used for continuous transforms is read through a damper (critically damped spring) so motion feels liquid even with stepped wheel input — but the page's actual scroll position is never altered.

**Progressive enhancement**: simple reveals and parallax use CSS `animation-timeline: view()` inside `@supports`; Firefox (still flagged in 2026) gets the finished state.

---

## 4. Text effects

| Effect | Where | How | Reduced motion |
|---|---|---|---|
| **Word rise (wipe)** | Hero, chapter headlines | SplitText words with `mask: "words"`, rise from 100 % → 0 with `ease.expo`, 70 ms stagger. **The LCP headline is visible at paint** (the rise is a clip from 100 % visible bounds — implemented so Chrome still counts it as painted) | Instant |
| **Decode / scramble** | Kickers, spec values when they enter, the Status line | ScrambleText with a mono charset (`0123456789ABCDEF·`), 600 ms, settles left→right | Instant |
| **Online glow** | The word *online* in the hero, live states | Text-shadow bloom + a 1-shot sweep of the Glow gradient through the letters (background-clip) once on load, then a slow 8 s breathe | Static subtle glow |
| **Line reveal** | Long leads | SplitText lines with mask, 40 ms stagger | Fade |
| **Number flow** | Metrics | NumberFlow digits roll, tied to scroll progress (reverses on scroll up), tabular | Final value |
| **Character dots** | Section numbers, 404 | Glyphs drawn as dot-matrix (canvas or SVG circles) that light up | Static |

Devanagari: split by words/lines only (never characters); scramble uses a per-locale charset.

---

## 5. Cursor system ("Dew")

Fine pointers only (`(hover: hover) and (pointer: fine)`), never when reduced motion is on.

- **Base**: the native cursor stays visible everywhere (no hidden cursors over text). A small soft dot (8 px, `--ink` at 60 %) follows with `gsap.quickTo` (0.25 s), plus a faint trailing ring.
- **Over interactive elements**: the dot grows into a ring that hugs the target (magnetic pull ≤ 8 px on buttons, ≤ 4 px on links).
- **Contextual labels**: on draggable or explorable things the ring shows a short verb in mono ("Drag", "Slice", "Explore", "Play").
- **In WebGL scenes**: the cursor becomes a light source (valley), a force (dot logo), or a probe (rack), via shared uniforms — not a DOM overlay.
- **On text inputs**: the custom layer hides; native caret only.
- Implementation: one rAF via the shared ticker; `mix-blend-mode: difference` only on the dot; no layout reads per frame.

---

## 6. Touch and mobile choreography

Phones get their own interactions instead of "desktop minus hover":

| Desktop | Phone equivalent |
|---|---|
| Cursor light on the valley | Touch-and-hold lights the valley under the finger; tap sends a ripple |
| Cursor pushes logo dots | Tap/drag pushes dots; a slow ambient light drifts when idle |
| Hover reveals | Content visible by default; press-and-hold previews where useful |
| Wheel-smoothed scroll | Native scroll + **scroll-velocity** effects (dots stretch slightly with fast flicks; settles on stop) |
| Parallax on pointer | **Opt-in tilt** ("Tilt to explore" toggle → DeviceOrientation permission on iOS) |
| Drag to slice | Same drag, with larger handles and snap haptics on Android (8–15 ms) |

Pinned chapters keep working on phones (sticky stage); horizontal sub-sequences become snap carousels (`scroll-snap`) with momentum.

---

## 7. The Glow (state motion)

The Glow is shown only while a real process runs:
- form submission in flight;
- a live demo request streaming (if/when a public demo endpoint exists);
- the hero terminal "typing" a real command (labelled as a demo).

Implementation: one full-screen fragment shader in the persistent canvas (SDF rounded-rect mask, OKLab hue field warped by noise, exponential falloff — no post-processing), rendered at 0.5× resolution. Inputs: time, pointer, scroll velocity, `energy` (rises while work runs, decays on completion). CSS fallback: a rotating oversized conic gradient behind a mask. Max two glows on screen.

---

## 8. Page transitions ("Fog pass")

- React 19.3 `<ViewTransition>` in each page, transition types set by navigation direction (`nav-forward`, `nav-back`, `nav-up`).
- **Default**: the old page's content lifts and fades (120 ms out), a soft fog band sweeps across the persistent WebGL canvas (driven by the same transition), the new page's headline rises (380 ms). Total ≤ 600 ms, interruptible; clicks during a transition are not lost.
- **Shared elements**: product card ↔ product hero, post card ↔ post hero, role row ↔ role hero, metric ↔ metric — matching `view-transition-name` morphs.
- **The canvas persists** across routes (mounted in the root layout, excluded from the DOM snapshot) so WebGL never blinks; scenes cross-dissolve by uniform.
- **Theme switch**: circular reveal from the toggle.
- Reduced motion: crossfade 150 ms, or instant.

---

## 9. Micro-interactions catalogue

| Element | Interaction |
|---|---|
| Buttons | Press scale .97 on pointer-down; release spring; magnetic on fine pointers; loading → inline Glow |
| Links | Underline draws from left on hover, retracts to right on leave |
| Nav items | Indicator slides between items (spring.snappy); mega panel grows from the trigger |
| Toggle (theme, engineer mode) | Real `<input type="checkbox" switch>` for iOS haptics; knob spring |
| Cards | Luminance lift + dot glyph animates (its dots "switch on") |
| Copy buttons | Icon morphs to check (MorphSVG), toast with dot progress |
| Accordions | Height via grid 0fr→1fr, chevron rotates, content fades in 60 ms after open |
| Form fields | Label floats and condenses into a mono kicker; valid state lights a dot; error shakes ≤ 2 px horizontally once (no wobble loops) |
| Scroll progress | A 1-px hydro line under the header on long pages (reading progress) |
| Footnote markers | Hover/focus previews the footnote in a popover; click scrolls with a highlight |

---

## 10. Reduced motion and comfort

When `prefers-reduced-motion: reduce` **or** the site's own "Reduce motion" toggle (footer + menu, remembered) is on:

- No Lenis, no scrubbing, no parallax, no cursor layer, no tilt, no idle breath.
- Pinned chapters become a vertical sequence of static frames with short crossfades between states triggered by intersection.
- WebGL renders a single still frame per scene (or a poster), updates only on theme change.
- Text effects resolve instantly; NumberFlow shows final values.
- Page transitions: 150 ms crossfade.

Always (regardless of setting): no flashing more than 3 times per second; no full-viewport camera spins; large moving objects fade while travelling; a visible pause control on any motion longer than 5 s (WCAG 2.2.2).

---

## 11. Motion review ritual

Every scene is reviewed:
1. At full speed, then at 0.25× (GSAP `globalTimeline.timeScale(0.25)` via `?slowmo`).
2. Frame-by-frame for the first 300 ms (does it respond on the first frame?).
3. On a low-end Android with 4× CPU throttling.
4. With reduced motion on.
5. With keyboard only.
6. Against the "does it carry a fact?" question — if not, cut it.
