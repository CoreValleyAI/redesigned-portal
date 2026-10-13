# 10 · Quality: performance, accessibility, devices, awards

"Hall of fame" is judged on four axes: design, usability, creativity, content — plus a separate developer score. We plan to win on all of them by refusing the usual trade-off between spectacle and function.

---

## 1. Performance budgets

| Metric | Target (p75 mobile, field) | Lab gate (Lighthouse mobile, simulated 4G, 4× CPU) |
|---|---|---|
| LCP | ≤ 2.0 s | ≤ 2.5 s |
| INP | ≤ 150 ms | TBT ≤ 150 ms |
| CLS | ≤ 0.05 | ≤ 0.05 |
| Initial JS (brotli/gzip) | ≤ 170 KB | enforced by bundle check |
| WebGL chunk | ≤ 250 KB, never on the critical path | lazy |
| 3D/scene assets per page | Tier 3 ≤ 1.5 MB, Tier 2 ≤ 600 KB, Tier 0/1 posters only | |
| Fonts | ≤ 110 KB (Inter + JetBrains Mono latin) | |
| Total transfer, first visit, Home | ≤ 1.2 MB Tier 2 | |
| Frame time while scrolling | ≥ 95 % frames under 16.7 ms on mid Android Tier 2; ≥ 95 % under 8.3 ms on 120 Hz desktop | measured with stats-gl + Performance panel |

Rules that protect the budgets:
- The LCP element (hero headline) is server-rendered and visible on first paint; no intro animation hides it.
- WebGL mounts after LCP and an idle callback (`setTimeout` fallback for Safari).
- Shader compilation via `compileAsync`; decoders in workers; init split across frames.
- Everything off-screen pauses; tab hidden pauses everything.
- No layout reads in animation frames; transforms/opacity only.
- Images: AVIF first, explicit sizes, `fetchpriority="high"` only on the hero poster.

### On "120 fps"

- On 120 Hz displays (ProMotion Macs, 120 Hz Android), compositor-driven CSS motion, native scroll and our single-clock WebGL run at display rate when the frame budget (8.3 ms) is met.
- iPhone Safari caps `requestAnimationFrame` near 60 fps; there, the 120 Hz feel comes from native scrolling and compositor animations (Safari 26.4+ runs scroll-driven animations on the compositor). We design for this rather than fight it.

---

## 2. Accessibility (WCAG 2.2 AA, aiming beyond)

- Semantic HTML first; every interactive canvas has a DOM control equivalent; canvases `aria-hidden`.
- Keyboard: full paths for every signature interaction (slice, meter, rim, Ascent, carousels); visible focus everywhere; skip link; focus moves to new content after page transitions (`main` heading).
- Screen readers: live regions for dynamic state (slices, meter, form errors); meaningful alt text; footnotes linked both ways.
- Motion: reduced-motion respected *and* an on-site toggle; pause controls for any auto-advancing content (> 5 s); no flashes > 3/s; no vestibular-trigger camera spins.
- Contrast: body ≥ 7:1, secondary ≥ 4.5:1, UI ≥ 3:1, verified in both themes, including text over WebGL (text never sits on busy WebGL without a solid/scrim backing).
- Targets ≥ 44 px; spacing between touch targets.
- Forms: labels, `autocomplete`, `inputmode`, error identification and suggestion, no time limits.
- Language: `lang` attributes; later `lang="ne"`/`"hi"` per locale.
- Testing: axe on every route and theme in CI; manual NVDA + Chrome, VoiceOver + Safari (macOS and iOS), TalkBack + Chrome passes per phase.

---

## 3. Device matrix (every phase gate)

| Class | Device (examples) | Expectation |
|---|---|---|
| Low-end Android | 4 GB RAM, Mali/Adreno 6xx-class | Tier 1; smooth scroll; all content and interactions work |
| Mid Android | Snapdragon 7-series, 120 Hz | Tier 2 at 60–120 fps |
| iPhone non-Pro | iPhone 13–15 | Tier 2, 60 fps |
| iPhone Pro | ProMotion | Tier 2, native-120 scroll feel |
| Windows laptop iGPU | Intel Iris Xe | Tier 2, Chrome/Edge/Firefox |
| MacBook | M-series | Tier 3, Safari/Chrome |
| Desktop | Discrete GPU, 144 Hz | Tier 3 |
| Tablets | iPad, Android tablet | Tier 2, touch choreography |

Browsers: last two versions of Chrome, Edge, Safari (macOS + iOS), Firefox; Samsung Internet. Conditions: Low Power Mode, Save-Data, slow 4G, offline (graceful), 200 % zoom, high contrast, reduced transparency.

Soak test: 5 minutes of continuous scrolling on Home and Hardware on a mid Android — no thermal throttling-induced tier drops below Tier 1, no memory growth (> 20 %).

---

## 4. Award readiness (Awwwards criteria)

| Criterion | What earns it here |
|---|---|
| Design | Coherent three-idea system; type and space; two complete themes |
| Usability | Clear IA, one owner per fact, fast, accessible, forms that feel effortless |
| Creativity | The valley switching on; dot-morph hand-offs; Two Seasons honesty; Valley Rim; generative covers |
| Content | Verified, dated numbers; Nepal-grounded stories; plain language |
| Developer | Single canvas architecture, tiers, budgets met, a11y scores, clean code |
| Mobile | Its own choreography, not a shrunken desktop |

Submission plan: launch production → collect real-device videos → submit to Awwwards (and CSSDA/FWA) with a short case-study write-up (Phase 8).

---

## 5. QA checklists (per page, before a page is "done")

1. Facts: every number from `lib/facts.ts`, dated, footnoted; no guardrail violations (04 §4).
2. Ownership: no subject owned by another page is repeated (03 §3).
3. Both themes reviewed; no mixed bands.
4. Desktop, tablet, phone choreography reviewed; touch interactions work one-handed.
5. Reduced motion path reviewed.
6. Keyboard-only and screen-reader pass.
7. Lighthouse mobile ≥ 90/100/100/100.
8. Frame budget met on mid Android.
9. Copy proof-read (voice, spelling, length budget).
10. "Does every effect carry a fact?" — remove at least one effect that doesn't.
