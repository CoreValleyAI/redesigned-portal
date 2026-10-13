# 02 · Research digest

What the market, the award juries and the best studios tell us, condensed into decisions. Researched October 2026. Full source links are kept inline; numbers marked † must be re-checked before they appear on the site.

---

## 1. The award landscape

Infrastructure and GPU-cloud sites are winning Awwwards right now, which means the jury knows the category and the bar is real.

| Site | Award | What to learn |
|---|---|---|
| [Cerebrium](https://www.awwwards.com/sites/cerebrium) (serverless GPU cloud) | SOTD 10 Sep 2026 | A GPU cloud can win; WebGL intro, globe with a force field, a crafted pricing calculator |
| [Hut 8](https://www.awwwards.com/sites/hut-8) (power + AI datacentres) | SOTD 28 Oct 2025 | Explain the business as layers: power → infrastructure → compute |
| [ON Energy](https://www.awwwards.com/sites/on-energy) | SOTD 9 Mar 2026 | An energy stream that reacts to the cursor |
| [NRG Build Your Data Center](https://www.awwwards.com/sites/nrg-build-your-data-center) | SOTD 30 Jun 2026 | A datacentre built phase by phase as you scroll |
| [Igloo Inc](https://igloo.inc) | SOTY + Developer SOTY 2024 | One procedural material (ice) carried through everything; text scramble without reflow; particle footer |
| [Lando Norris](https://landonorris.com) | SOTY 2025 (8.18) | Two colours, one hero object, transitions treated as brand |
| [Oryzo AI](https://oryzo.ai) (Lusion) | SOTM Apr 2026 | A 3D product with weight that morphs into flat UI and back |
| [Shopify Live Globe](https://bfcm.shop) | SOTD Jan 2026 | Dot-matrix display shader for live numbers |
| [Stripe BFCM Machine](https://bfcm.stripe.com) | SOTD Jan 2025 | A physical machine as the metaphor for live numbers |
| [Explore Primland](https://explore.ownprimland.com) | SOTD Feb 2026 | Mountain terrain fly-through with fog and a *seasons* toggle |
| [Lidar Drone Scanning](https://drone.riotters.com) | SOTD Oct 2026 | Terrain as a live point cloud |
| [Terminal Industries](https://terminal-industries.com) | SOTM Sep 2025 | Speed (performance 8.2) plus a *Technical Index* for engineers |
| [Why Zero](https://why.zero.university) | SOTM Sep 2026 | A personal reward at the end of a form |
| [Razorpay Sprint 26](https://razorpay.com/sprint/26) | SOTD May 2026 | A South Asian in-house team can win |
| [Microsoft AI](https://microsoft.ai) | SOTD Nov 2025 | Warmth and real people instead of cold "AI factory" |

**Score reality.** SOTD sites land around 7.3–7.7; Sites of the Year 7.9–8.2. The weakest category for almost every winner is **accessibility (6.4–7.0)** — that is where we can out-score them while matching their spectacle.

**What the winners share:** one material or idea carried through the whole site; one hero object; transitions treated as part of the brand; motion that encodes the product; ruthless restraint in palette and type.

**What none of them do:** tell a *verifiable story about a place*. That is our opening.

---

## 2. Competitors: how AI-infrastructure companies present themselves

| Company | Hero promise | How hardware appears | Pricing | Sovereignty / energy | Weakness we can beat |
|---|---|---|---|---|---|
| CoreWeave | "The Essential Cloud for AI" | Named GPUs, no spec table on home | Hourly tables per instance | Regions buried; India entry with AdaniConneX announced 7 Oct 2026 (240 MW, Vera Rubin, first phase mid-2028)† | Generic hero; specs and regions hidden |
| Lambda | "Supercomputers for training and inference" | Image gallery | Clear per-GPU-hour tables | No regions/energy | Buzzwords |
| Nebius | "The Ultimate AI Cloud" | Inside customer stories | Per-GPU-hour | Trust centre | Long news feed |
| Crusoe | "The AI factory company" | GPU cards | Tabbed tables | Energy-first stack, but qualitative | No hard energy data |
| Nscale | "Engine of superintelligence" | "Thousands of GPUs" | Reserve CTA | **A page per datacentre** (Glomfjord: 100% hydro, place story) | Little product detail |
| Modal / RunPod | Developer clouds | Live dashboard samples | Per-second | Data-residency controls | — (strong UX, learn from them) |
| Yotta Shakti (India) | "India's sovereign AI cloud" | "8,000+ H100s" | INR hourly/monthly | "Built and hosted in India" | Dated visuals, claim overload |
| Tata Communications Vayu | "Speed. Simplicity. Security." | H100/H200/L40S with CPU/RAM | INR per hour on page | "Fully sovereign… DPDPA" | Stock visuals |
| E2E Networks | "GPU infrastructure for serious AI" | Spec cards | USD per hour on home | MeitY empanelled | Looks like a console |
| AdaniConneX | "Grow faster…" | Colocation | — | 1 GW+, globe | Corporate template |
| **YetiCloud.AI** (Nepal) | "Nepal's first GPU-as-a-Service" (launched 3 Jul 2026) | H200 NVL early access, H100, RTX PRO 6000, L40S | NPR, eSewa/Khalti | "Your data never leaves Nepal" | **Direct competitor.** We cannot claim "first"; we must win on craft, honesty, partners and service |

**Shared formula of the category:** buzzword hero → logo wall → 3–4 pillars → product tiers → hardware cards → numbers → testimonials → news. Everyone looks the same.

**Gaps CoreValley can own:**
1. A **place-based story you can verify**, told from snow to token.
2. **Pricing mechanics explained beautifully** even before rates are published (per-second, slices, one-day NPR quote).
3. **Honest numbers with dates and footnotes** — including the energy story by season.
4. **Sovereignty you can see**: where data lives, who can touch it, which law applies, support on Nepal time.
5. **Small-to-large craft**: a seventh of a GPU for a student, a reserved server for a bank.
6. **Mobile excellence** — the category is desktop-first with heavy mega-menus.
7. **Named, credible partners** (HPE, NVIDIA) — most local competitors do not show who built their stack.

---

## 3. How Apple builds product pages (what we borrow)

1. **One idea per section**, full-bleed, huge whitespace; type does the work, not chrome.
2. **Sticky storytelling**: a visual stays pinned while copy scrolls; state changes on intersection; page scroll is never hijacked.
3. **Scroll-scrubbed media**: video with dense keyframes, or a canvas image sequence (90–120 frames, WebP, pre-decoded with `createImageBitmap`) — with a still poster for slow connections and reduced motion.
4. **Big numbers with a comparator and a footnote** ("up to N× faster than…", method at the bottom of the page).
5. **The Siri / Apple Intelligence glow** means "listening" — a state, not decoration. We keep that meaning: our Glow means "a machine is working".
6. **Springs, not easing curves**: duration + bounce, interruptible, velocity carried through. Bounce only when the user threw something.
7. **Light by default; dark as a purposeful moment.** We go further: two complete themes, but each page still has *one* dramatic chapter rather than alternating bands.
8. **Product as hero**: Apple always shows the real thing. Our "real thing" is the hardware (drawn by us, faithfully), the console/API (real UI), and the valley itself.

Apple's HIG principles to reason with: purpose, agency, responsibility, familiarity, flexibility, simplicity (not minimalism), craft, delight. Materials (blur/translucency) only on floating chrome — nav, sheets — never on content cards.

---

## 4. Studio signatures worth stealing (ethically)

| Studio / brand | Signature | Our version |
|---|---|---|
| Linear | Product shown as live UI, not screenshots | Console and CLI as live components (pods launching, GPUs being sliced) |
| Vercel | Engineering-notebook precision; device-adaptive shader quality | Hairline grid, 4-px rhythm, quality tiers |
| Stripe | WebGL gradient hero; globe of 60k dots; numbers always with a time window | Dot language; every metric dated |
| Raycast | The product's way of working *is* the hero visual | Slice / scale / stop as hero interactions |
| Arc | A ritual onboarding ending in a personal card | The Ascent form ending in a Plan Card |
| Lusion | Objects with weight; 3D ↔ flat UI morphs | The H200 settles into the spec card |
| Active Theory | In-house engine + designer tooling | Our Scene Manager with a debug panel for tuning |
| Immersive Garden | One "room" per idea | One chapter per idea, pinned |
| Resn (Zentry) | `clip-path` chapter transitions | Valley-rim mask transitions |
| Locomotive | Parallax that switches off on touch | Touch gets its own choreography instead |

---

## 5. Making numbers memorable (the method)

1. **State the window and the source** ("as of Oct 2026", "measured on …").
2. **Frame around the user, not the asset** ("data travels under 5 ms inside the valley"†).
3. **Use physical comparisons** — Nancy Duarte's four anchors: size, distance, time, speed. Our anchor is **the blink (~260 ms)**:
   - The H200 can read its entire 141 GB memory in ~29 ms at 4.8 TB/s — *about a ninth of a blink*.
   - Per-second billing: a 90-second job is billed 90 seconds; hour-rounding would bill 3,600 — *40× more*.
   - One H200 split seven ways: seven students on one card.
4. **Make scroll the unit of measure** (neal.fun "The Deep Sea") — e.g. scrolling the length of the Bagmati to the datacentre.
5. **One number per screen on phones.**
6. **Render the final value in HTML**, then animate *to* it, scroll-linked so it reverses.
7. **Live beats static only when it is really live.** No fake counters.

---

## 6. Forms that convert (and feel effortless)

- **One question per step** (GOV.UK "one thing per page") outperforms long forms, especially on mobile and for less confident users.
- **Validate on leaving a field**, not on every keystroke (Baymard).
- **Route people explicitly**: early access / partnership / press / careers / support (CoreWeave's "skip the form" and routing).
- **Say what happens next**: "we reply within one working day with a capacity plan and a firm NPR quote".
- **Reward the finish**: a personal plan card (Arc, Why Zero).
- **Pre-fill from earlier choices** (the quote console → the form).
- **Instant scheduling** lifts booked meetings dramatically (vendor data, treat as directional).

---

## 7. Technology verdicts (summary — details in 09)

| Use | Verdict |
|---|---|
| Framework | Next.js **16.4** + React **19.3** (stable `<ViewTransition>`), static export |
| Motion backbone | **GSAP 3.15** (all plugins free: ScrollTrigger, SplitText, ScrambleText, Flip, Observer, Inertia, DrawSVG, MorphSVG, CustomEase) |
| React UI motion | **Motion 14** (forms, menus, layout), LazyMotion |
| Smooth scroll | **Lenis 1.3** — desktop mouse-wheel only; native scroll on touch; never ScrollSmoother |
| 3D | **three 0.186** + **R3F 9.8** + **drei 10.7**, one persistent canvas; WebGL2 now, WebGPU later |
| Page transitions | React `<ViewTransition>` + a WebGL fog layer in the persistent canvas |
| Numbers | `@number-flow/react` |
| Forms | react-hook-form + `zod/mini` |
| Shader prototyping | Paper Shaders (port into our canvas) |
| Avoid | ScrollSmoother, Barba/Swup/Taxi/Highway, Theatre.js, Spline/Unicorn runtimes, Lottie, PixiJS/Babylon, phone-side fluid sims, next-themes as-is, COEP |
| Video assets | HyperFrames for rendered films/loops only (launch film, social cuts, hero poster loops) |

---

## 8. Nepal and India context (what shapes the copy)

- Census 2021: **124 mother tongues**; Nepali is the mother tongue of 44.86% — language AI is a national need.
- Banking: ~30 million mobile-banking accounts (mid-May 2026)†; Nepal is on the FATF grey list (since Feb 2025)†.
- Rules that make *in-country* compute matter: **Data Centre & Cloud Service Directive 2081** (listed providers, Tier III for government data); **NRB Payment-System Unified Directive 2081** (DoIT-listed data centres); **National AI Policy 2082** (local languages, domestic data ownership); **NRB forex ceilings** that make paying foreign clouds hard.
- Power: ~4,120 MW installed, ~3,905 MW hydro (FY2025/26)†; imports in the dry season; the August 2026 floods took 400+ MW offline†. Honest wording: *hydro-dominated grid*.
- India: IndiaAI offers subsidised GPUs (~₹65/GPU-hour)† — **we do not compete on price in India**; we offer non-regulated workloads, Nepali/Maithili/Bhojpuri language work, cross-basin science and reserved capacity with engineering help. The DPDP Act has no blanket localisation; RBI/SEBI/government data must stay in India — we never offer to host it.

Full use-case catalogue with sources: [04-content-and-facts.md §6](04-content-and-facts.md).
