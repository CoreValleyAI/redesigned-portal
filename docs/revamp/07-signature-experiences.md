# 07 · Signature experiences

The moments people will remember and talk about. Each one encodes a fact, works on a phone, has a reduced-motion form, and has a performance budget. Built once as reusable modules (`components/signature/*`), registered with the Scene Manager.

Format for each: **Fact** · **Where** · **Desktop** · **Phone** · **Reduced motion / Tier 0** · **Build** · **Budget** · **Done when**.

---

## S1 · Valley Online (the hero)

- **Fact:** CoreValley is a GPU cloud in the Kathmandu Valley, and it is switching on.
- **Where:** Home hero.
- **Desktop:**
  - Centred headline **"The valley is / coming online."** — per-word rise; *online* sweeps with the Glow once, then breathes softly. Kicker above (decode effect): `KATHMANDU VALLEY · NVIDIA H200 · COMING SOON`.
  - Behind it, the **Contour Valley**: the real valley floor and rim from public elevation data, drawn as ~40–60k dots in a dot-matrix terrain (evolved from the live site's DotTerrain). On load the dots are "off"; a pulse of light travels along the Bagmati river line from the south, and the valley's dots switch on outward from the river — power arriving.
  - The cursor is a soft light source: dots brighten and lift slightly under it, with a gentle wake.
  - Scroll (0 → 1 over the first 150 svh): the camera tilts down and pushes into the valley floor; the headline drifts up and fades; at the end the dots converge into the H200 silhouette that opens chapter 2 (a dot-morph handoff).
  - Below the headline: one sentence lead, two buttons (Request access · See how it works), and a three-fact strip (8× H200 NVL · billed per second in NPR · your data stays in the valley).
- **Phone:** same composition, portrait framing with a taller field of view; touch-and-hold lights the dots under the finger; tap sends a ripple; scroll pushes the camera; tilt only if the visitor enables it.
- **Reduced motion / Tier 0:** a pre-rendered still of the lit valley (AVIF, light and dark versions), headline static, no camera move.
- **Build:** R3F `<View>` in the persistent canvas; terrain as instanced points with a height texture (DEM → 512×512 R16 PNG → packed); river path as a spline texture; lighting computed in the vertex shader; damped uniforms (`maath/easing`). Headline is DOM (it is the LCP element and must be painted at first frame).
- **Budget:** WebGL chunk loads after LCP; ≤ 60k points Tier 3, 25k Tier 2, 8k Tier 1; terrain data ≤ 180 KB; hero still ≤ 90 KB AVIF.
- **Done when:** LCP ≤ 2.0 s on mid Android; 60 fps steady on mid Android Tier 2; the river-to-rim light-up reads instantly as "power arriving" to five people who have not been told.

---

## S2 · Living Mark (the logo that is alive)

- **Fact:** the brand is made of dots — countable, sliceable compute.
- **Where:** Header (small), footer (large), 404, page-transition hand-offs.
- **Desktop:** the CoreValley mark sampled into a dot grid. On first view the dots fly in and assemble (spring, staggered by distance from centre). The cursor pushes dots aside with a water-like ripple; they spring home. In the header the mark is tiny and only "breathes"; hovering it ripples once.
- **Phone:** tap and drag push dots; when idle a slow light drifts in a figure-eight (as on the live site).
- **Reduced motion:** the static SVG mark.
- **Build:** port and modernise `dot-matrix.tsx` from the live site into the persistent canvas: dot positions sampled **at build time** from the SVG into a binary array; one instanced draw call; ripple simulated in the vertex shader (height-field) rather than CPU springs; theme-aware palette (additive on dark, normal blend on light). Real SVG logo stays in the DOM for accessibility.
- **Budget:** ≤ 4k dots footer, ≤ 600 header; < 0.5 ms GPU per frame.
- **Done when:** it feels like water, not particles; no frame drops while scrolling past it.

---

## S3 · Reservoir footer

- **Fact:** the valley's reservoir — what powers everything — fills as you go.
- **Where:** Every page's footer.
- **Desktop/phone:** a giant dot-matrix **COREVALLEY** wordmark spanning the width. As the visitor approaches the end of the page, the dots fill from the bottom like water rising (scroll progress = water level); at the very end a ripple crosses the surface. The Living Mark sits beside it and reacts to cursor or touch. Beneath: link columns, **Valley Time** (S12), legal row.
- **Reduced motion:** the wordmark fully filled, static.
- **Build:** shares S2's engine (different dot source); not initialised until within 1.5 viewports; CSS scroll-driven fallback for the fill where WebGL is off.
- **Budget:** shares S2.

---

## S4 · Snow → Token (the journey)

- **Fact:** the honest chain from Himalayan snow to an answer in your terminal: water → hydropower → the grid → our datacentre in the valley → an H200 → a token.
- **Where:** Home chapter 2 (short, ~5 beats) and `/infrastructure` (full, ~9 beats).
- **Desktop:** a pinned stage. One continuous dot-world camera move: snowfield (dots like snow) → meltwater flowing (Flow particles) → a turbine abstraction spinning up → transmission line pulses into the valley → the datacentre as a dot-volume → zoom into one GPU → a token emerges and types into a real terminal line. Each beat carries one number in HTML (with footnote), e.g. "Nepal's grid is hydro-dominated: ~3,905 of 4,120 MW installed capacity (FY2025/26)" and the honest dry-season caveat on `/infrastructure`.
- **Phone:** the same beats as a pinned stage; captions stack below the visual; swipe/scroll advances; beats snap.
- **Reduced motion:** five illustrated stills (generated from the same scene) with captions.
- **Build:** one R3F scene with a scripted camera path (Catmull-Rom through authored points), GSAP timeline scrubbed by ScrollTrigger; dot-morph between formations via precomputed target buffers (GPU lerp). No external 3D software required; formations generated procedurally.
- **Budget:** scene chunk ≤ 120 KB; ≤ 80k points Tier 3, 30k Tier 2; posters ≤ 5 × 60 KB.
- **Done when:** a visitor can retell the chain afterwards; every number is footnoted; the energy caveat is visible, not hidden.

---

## S5 · The River (optional, after launch)

*Re-scoped 13 Oct: the owner confirmed the datacentre runs on hydropower, so this is no longer an "energy honesty" device. Kept as an optional delight.*

- **Fact:** the valley's compute runs on Nepal's hydropower.
- **Where:** `/infrastructure#power` (optional).
- **Interaction:** a **Monsoon ↔ Dry** switch changes the river's flow and the colour of the light — atmosphere only; the copy states the confirmed hydro fact and the grid footnote, nothing about seasons' power balance.
- **Phone:** same switch (native `switch` input for iOS haptic).
- **Reduced motion:** two stills.

---

## S6 · The Machine (exploded server)

- **Fact:** what actually runs: an HPE ProLiant DL380a Gen12 with four NVIDIA H200 NVL GPUs; two of them in our first cluster.
- **Where:** `/hardware`.
- **Desktop:** a pinned stage with a stylised (not photoreal, not branded-render) 3D server built procedurally to the real layout. Scroll explodes it in layers: chassis → GPU bay with four H200 NVL cards → NVLink bridges (only if fitted) → memory (HBM3e stacks visualised) → network (400 Gb/s ports) → storage (link to the Alletra tier). Each layer has one big metric and a human comparison (e.g. "141 GB read in ~29 ms — a ninth of a blink").
- **Phone:** the same sequence with fewer parts animated; swipe between layers.
- **Reduced motion:** four labelled cutaway stills.
- **Build:** geometry generated in code (boxes, bevels, instanced fins/cards) + a few hand-made glTF parts (meshopt-compressed) if needed; materials: matte metals with baked AO; no logos unless partner-approved.
- **Budget:** ≤ 600 KB assets Tier 2, ≤ 1.5 MB Tier 3.
- **Done when:** an engineer recognises the configuration as correct; nothing claims more GPUs per NVLink domain than exists.

---

## S7 · Slice the GPU (MIG)

- **Fact:** one H200 can be split into up to seven hardware-isolated slices.
- **Where:** `/products/mig-slicing` (full) and Home chapter 3 (teaser).
- **Interaction:** a GPU drawn as a block of dots (memory as a 141 GB field). Drag a divider or tap a layout chip to split it into verified profiles (exact NVL profile names from `nvidia-smi` on our hardware). Slices spring apart (`spring.throw` after a flick), each labelled with memory and compute share; a line suggests "good for…" (team-validated examples). A "7 students" mode fills each slice with a tiny notebook icon.
- **Phone:** chips are primary; drag works too; Android haptic tick on snap.
- **Reduced motion:** chips switch layouts instantly.
- **Accessibility:** arrow keys move between layouts; live region announces "Split into 7 slices of 16.5 GB each".
- **Done when:** profiles match real hardware output exactly.

---

## S8 · The Meter (per-second billing)

- **Fact:** you pay for the seconds a job runs (60-second minimum), in rupees.
- **Where:** `/pricing` (full), Home chapter 5 (teaser).
- **Interaction:** an electricity-meter abstraction: a dot disc spins and digits count only while a demo job "runs". Press **Stop** — it halts on the same frame. A ghost "hour-rounded" bar keeps filling to 3,600 s to show the difference ("a 90-second job: 90 s billed vs 3,600 s rounded — 40×"). No rupee prices until rates are published; the button leads to a quote.
- **Phone:** identical; big Stop button.
- **Reduced motion:** numbers only.
- **Build:** DOM + SVG (no WebGL needed) with GSAP; NumberFlow digits.

---

## S9 · The Valley Rim (sovereignty)

- **Fact:** your workload data stays inside the valley, under Nepal's law; here is exactly who can touch it.
- **Where:** `/infrastructure#residency` (full), Home chapter 4 (teaser).
- **Interaction:** drag a glowing "dataset" token toward the edge of the valley map (the rim, a natural boundary — never national borders). As it reaches the rim it meets increasing resistance (rubber-band) and springs back; a panel states where it is stored, who can access it, which law applies, and what *does* leave Nepal (website, form relay, email — honestly).
- **Phone:** drag with the thumb; or tap "Try to take it out".
- **Reduced motion:** a static diagram with the same text.
- **Done when:** every sentence is approved; keyboard alternative works.

---

## S10 · Blink scale (latency)

- **Fact:** latency inside the valley is under 5 ms — about fifty times shorter than a blink (~260 ms). Owner-confirmed claim, shown with the §2a disclaimer from 04.
- **Where:** `/infrastructure#network`; teaser on Home.
- **Interaction:** a blink drawn as a long dot bar (260 ms); a pulse crosses the valley in < 5 ms on a slowed clock (1 ms = 100 ms), so ~50 pulses fit inside one blink. No comparisons with other cities or clouds (no published measurements).
- **Reduced motion:** the static bar with "≈ 50 round trips per blink".

---

## S11 · The Ascent (request access)

- **Fact:** starting is a short conversation, and we reply within one working day with a capacity plan and a firm NPR quote.
- **Where:** `/contact` (full); step 1 inline at the end of Home, product pages and use-case pages.
- **Flow (one question per step):**
  1. *What are you here for?* — cards: Run AI workloads · Partner with us · Press · Careers (→ jobs) · Support. (Routes immediately; only "Run AI workloads" continues the Ascent.)
  2. *What do you want to run?* — chips (Training · Fine-tuning · Inference/API · Notebooks/teaching · Something else) + optional sentence.
  3. *Which GPUs, how many, how long?* — pre-filled from the quote console/product page; dial controls (GPU · count · duration) with an instant plain-English readout.
  4. *Your data* — any residency/compliance needs (switches: "must stay in Nepal", "regulated (bank/health/government)", "contains personal data").
  5. *Who should we talk to?* — name, work email, organisation, phone (optional), preferred time on Nepal time.
  6. *Check your answers* — editable summary.
- **Motion:** progress is a thin altitude line with camps (one per step); steps slide with `spring.smooth` along one axis (forward up, back down — spatially consistent); the active field's label condenses into a kicker; valid answers light a dot; on submit the **Glow** wraps the card while the request is in flight.
- **Finish:** the **Plan Card** (S13) assembles from the answers; "We reply within one working day" with Valley Time showing whether engineers are online now.
- **Friction removal:** Enter advances; autofill tokens (`autocomplete`), correct mobile keyboards (`inputmode`), drafts saved in sessionStorage, back never loses answers, errors explain how to fix, no CAPTCHA (honeypot + timing), FormSubmit disclosure in one quiet line (until the in-country form backend exists).
- **Accessibility:** each step is a `<fieldset>` with `<legend>`; focus moves to the step heading; errors announced via `aria-live`; full keyboard path.
- **Done when:** median completion ≤ 90 s in hallway tests; zero dead ends; works with JS disabled (falls back to a single plain form).

---

## S12 · Valley Time

- **Fact:** Nepal keeps its own time (UTC+05:45); our engineers work on it.
- **Where:** footer, Contact, Ascent finish.
- **Display:** a small dot-matrix clock (hours:minutes) with "Kathmandu · NPT", and "Engineers online" / "Back at 09:00 NPT" based on support hours (owner to confirm hours). Rendered on the server with the build time, hydrated to live; no layout shift.

---

## S13 · Plan Card

- **Fact:** your request, summarised — what you'll get and when.
- **Where:** Ascent finish; Pricing quote console.
- **Design:** a card that assembles from dots into: organisation, workload, GPU × count × duration, data requirements, "Firm NPR quote within one working day", a reference code. Flips to show what happens next (three steps). Export as PNG/PDF; share via Web Share API; a link reopens the quote console with the same settings.

---

## S14 · Generative covers ("contour prints")

- **Fact:** every post and use case is its own place in the valley.
- **Where:** blog posts, use-case stories, OG images.
- **Design:** deterministic generative art seeded by the slug: a contour map or dot field with a category palette (Engineering = hydro on night, Company = warm paper, Research = glacier…). Same algorithm renders the hero (live, subtly reactive to cursor/touch) and a build-time PNG for OG and cards.
- **Build:** a small TypeScript generator shared by a Node build script (writes `/og/*.png`, `/covers/*.webp`) and the client (canvas/WebGL live version).
- **Done when:** every post looks unique yet unmistakably part of the site; no stock images anywhere.

---

## S15 · Engineer mode

- **Fact:** the details are all here, for those who want them.
- **Where:** Hardware, Platform, Products, Pricing.
- **Interaction:** a switch in the page header ("Engineer mode") changes density: story copy collapses, raw spec tables, `nvidia-smi`-style readouts, CLI/API snippets and datasheet downloads expand. Remembered locally. Server-rendered both ways (CSS attribute), so no layout jump.

---

## S16 · Use-case atlas

- **Fact:** what people in Nepal can build, each grounded in a real number.
- **Where:** `/use-cases`.
- **Design:** the valley's contour map as an index; each use case is a "station" placed on a stylised route (not geography). Scrolling travels the route; each station opens into a story card (problem fact → what AI does → why in Nepal → who → runs on). Filter by sector or product (chips). Each station has its generative cover (S14).
- **Phone:** a vertical route with snap; filters as a horizontal chip bar.
- **Reduced motion:** a grid of story cards.

---

## S17 · Fog pass (page transitions)

See 06 §8. Signature because it makes the whole site feel like one continuous place.

---

## S18 · Off the map (404)

- "This trail goes off the map." The Living Mark scatters into dots that drift like snow; the cursor (or touch) gathers them back into the logo; a short list of real destinations (Products, Pricing, Contact, Docs).
