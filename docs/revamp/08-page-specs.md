# 08 · Page specifications

Section-by-section blueprint for every page. Copy here is direction, not final text (final copy lives in `content/en/*` and is reviewed against 04). "S#" refers to signature experiences in 07.

Legend: **[pin]** pinned chapter · **[GL]** uses the persistent canvas · **[DOM]** HTML/CSS/SVG only.

---

## 1. Home `/` — "The valley is coming online"

Purpose: feel it, then know the five things that matter. Only teasers; every chapter links to its owner page.

| # | Chapter | Content | Visual / interaction | Links to |
|---|---|---|---|---|
| 1 | **Valley Online** | Kicker (decode): KATHMANDU VALLEY · NVIDIA H200 · COMING SOON. H1: "The valley is coming online." Lead: Nepal's GPU cloud, built on NVIDIA H200 NVL with HPE, in the Kathmandu Valley. Buttons: Request access · See how it works. Fact strip (3). | S1 [GL] [pin 150svh] | Contact |
| 2 | **From snow to token** | 5 beats, one number each; ends on a real terminal line. | S4 short [GL] [pin] | /infrastructure |
| 3 | **One GPU, seven ways** | "An H200 has 141 GB of memory. Most jobs need a fraction of it." Slice teaser; "141 GB read in ~29 ms — a ninth of a blink." | S7 teaser [GL/DOM] [pin on desktop] | /products/mig-slicing, /hardware |
| 4 | **Your data stays in the valley** | Inside the rim, under Nepal's law; what leaves and what doesn't (one line). | S9 teaser | /infrastructure#residency, /trust |
| 5 | **Pay for the seconds you use** | Per-second, 60 s minimum, in rupees; quote in one working day. | S8 teaser [DOM] | /pricing |
| 6 | **Six ways to run** | The six products as a horizontal "valley" of six dot-glyph cards (snap carousel on phone). | Cards morph into product heroes on click (view transition) | /products/[slug] |
| 7 | **Built for Nepal** | Three rotating stories (Language AI, Banking, Hazard science) with real facts. | S14 covers; auto-advance with pause | /use-cases |
| 8 | **Built with HPE and NVIDIA** | One quiet line + partner names (logos only if approved). | Static | /hardware |
| 9 | **Start the climb** | Ascent step 1 inline. | S11 step 1 | /contact |
| — | Footer | Reservoir + Valley Time | S3, S12 | |

Mobile: chapters 2–4 pin as sticky stages with captions below; chapter 6 becomes a snap carousel; total home length ≤ 12 screens on a phone.

---

## 2. Products `/products`

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "Six ways to run AI in Nepal." One-line lead; Status component | Six dot glyphs assembling into a row [DOM/SVG] |
| 2 | The six | Card per product: name, promise, "best for", billing line | Cards with live dot glyph; view-transition names |
| 3 | Which one fits | Compare table (billing · commitment · best for) | Sticky first column; engineer mode adds columns |
| 4 | Not sure? | Three questions → recommendation (Training? Serving? Teaching?) | Tiny decision widget [DOM] |
| 5 | CTA | Request access | |

No hardware table here (moved to /hardware).

## 3. Product detail `/products/[slug]` (×6)

Shared template, unique hero visual per product:

| Product | Hero visual (dot language) |
|---|---|
| Reserved GPUs | A dot-server whose slots fill and lock (a padlock dot glyph forms) |
| On-demand GPUs | Dots switch on/off with a ticking second counter |
| Inferencing | Tokens (dots) streaming into a real API response |
| MIG slicing | S7 full |
| Storage | A dot reservoir with datasets settling into layers |
| Services & engineering | Dots forming a route with "camps" (people helping you climb) |

Sections: Hero (name, promise, Status, Request access pre-filled) → How it works (3 steps, pinned on desktop) → What you get (features, ≤ 6) → Under the hood (≤ 3 key specs, "Full specs →" /hardware; engineer mode expands) → Billing line (→ /pricing) → Product FAQ (2–4) → CTA (Ascent step 1 pre-filled) → Other products (row).

Copy corrections required (see 04 §2): no "8× NVLink", no SXM numbers, only software that will exist at launch.

## 4. Hardware `/hardware` *(new)*

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "The machines." What runs now: 8 × NVIDIA H200 NVL on HPE Private Cloud AI. Status | The cluster as a dot-volume, slowly rotating [GL] |
| 2 | The Machine | DL380a Gen12 exploded, layer by layer | S6 [GL] [pin] |
| 3 | The H200 NVL | Spec sheet: memory, bandwidth, tensor throughput (NVL values, footnoted), MIG (no NVLink claims — not in the briefing) | Spec readouts with decode on enter; engineer mode = full datasheet table |
| 4 | Memory you can feel | "141 GB read in ~29 ms." Blink comparison | Metric + blink animation [DOM] |
| 5 | The cluster | 2 GPU servers · 3 control-plane nodes · 400 Gb/s NVIDIA Spectrum · 62 TB usable all-flash (S3) · NVIDIA AI Enterprise | Topology as a calm dot diagram (no confidential wiring) |
| 6 | Roadmap | Now: H200 NVL (coming soon). Next: RTX PRO 6000 Blackwell. Later: "new generations as they ship." | Timeline of dots; future items outlined, not filled |
| 7 | FAQ | NVL vs SXM; MIG profiles; NVLink domains; Blackwell timing | |
| 8 | CTA | Request access (H200) | |

## 5. Infrastructure `/infrastructure` *(new)*

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "The place." Kathmandu Valley; runs on Nepal's hydropower; data residency | Point-cloud descent into the valley [GL] |
| 2 | Snow → Token (full) | 9 beats with honest numbers | S4 full [GL] [pin] |
| 3 | Power | Runs on Nepal's hydropower (footnoted); 99.99 % facility uptime commitment (disclaimer) | Metric + Flow; S5 optional later |
| 4 | The datacentre | What we can say publicly (no coordinates, no security details): commissioning status, hydropower, 99.99 % facility uptime | Dot-volume of a rack hall |
| 5 | Network | 400 Gb/s NVIDIA Spectrum inside the cluster; < 5 ms inside the valley (disclaimer) | S10 |
| 6 | Residency | Valley Rim + exact list of what stays and what leaves | S9 full |
| 7 | FAQ | Where is the data; outages & backup; latency; power |  |
| 8 | CTA | Trust → / Request access | |

## 6. Platform `/platform`

Purpose: what you'll actually touch. **Owner-confirmed (13 Oct): customers use HPE's software — HPE AI Essentials on HPE Private Cloud AI — with NVIDIA AI Enterprise.** Only that stack is described.

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "From silicon to your notebook." HPE Private Cloud AI, co-engineered by HPE and NVIDIA | The iceberg evolved: a vertical dot-strata descent (keeps the live site's iceberg idea, re-skinned in dots) [GL] |
| 2 | The layers | NVIDIA H200 NVL → 400 Gb/s NVIDIA Spectrum networking → HPE Alletra all-flash storage (S3) → NVIDIA AI Enterprise (incl. NIM) → **HPE AI Essentials** | Strata with one line each; engineer mode shows component names |
| 3 | What you work in | HPE AI Essentials: notebooks (JupyterLab), pipelines (Kubeflow, Airflow), distributed compute (Ray, Spark), experiment tracking (MLflow), model serving (KServe, NVIDIA NIM), data (Presto, Superset) | Each tool as a dot-glyph tile; one line on what it is for |
| 4 | A day on the platform | Four real workflows from the briefing, as a "metro map": data operations, ML model operations, ML predictions, LLM prompt engineering → serving | Animated line map (Flow) — lines are pipelines, stops are tools |
| 5 | Ready-made AI *(if offered — Q4)* | Cited-answer assistant, knowledge-base Q&A, document summariser/generator, data copilot | Five dot-glyph cards |
| 6 | Security & isolation | Only what the platform really provides (to confirm with HPE docs): workload isolation, access control, MIG hardware isolation on H200 NVL | → /trust |
| 7 | CTA | Read the docs ↗ · Request access | |

## 7. Use cases `/use-cases`

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "Work that belongs in Nepal." 124 mother tongues, one valley | Dots forming Devanagari and Latin letterforms morphing [GL/SVG] |
| 2 | Atlas | 15 Nepal stations (04 §6), filter by sector/product | S16 |
| 3 | Across the border | India section, framed carefully | Separate, quieter route |
| 4 | Your idea | Ascent step 1 pre-filled "Use case" | |

Optional Phase 5: `/use-cases/[slug]` long-form stories with sources.

## 8. Pricing `/pricing`

| # | Section | Content | Visual |
|---|---|---|---|
| 1 | Hero | "Billed by the second, in rupees." Rates being finalised; firm quote in one working day | Meter idle [DOM] |
| 2 | The Meter | Per-second vs hour-rounded | S8 |
| 3 | What you pay for | GPU time · tokens · reserved terms · storage (mechanics, no rates until published) | Four calm cards |
| 4 | What you never pay for | Queue time, time after stop, hourly rounding, FX spread | |
| 5 | How you pay | eSewa, Khalti, bank transfer, invoice (NPR) | Logos only if permitted; otherwise text |
| 6 | Quote console | GPU · count · duration dials → Plan Card → Ascent | Evolved QuoteLock + S13 |
| 7 | FAQ | Pricing topics only | |
| 8 | CTA | Get an NPR quote | |

Rate tables stay hidden while `pricingIsPlaceholder` is true (existing guard).

## 9. Trust `/trust` *(new)*

Sections: Security approach (plain words) → Compliance status table (each item: status, date; "in progress" allowed, never "certified" unless true) → Data handling (what we store, where, who can access) → Subprocessors (GitHub Pages, FormSubmit, Zoho Mail, Cloudflare DNS — honest) → Responsible disclosure (security.txt) → Status page (when live) → Request the security pack (contact). Visual: restrained; a single Valley Rim motif.

## 10. Company `/company`

No product or pricing content.

| # | Section | Content |
|---|---|---|
| 1 | Hero | "Built in the valley, for the valley." |
| 2 | Why we exist | The story (why Nepal needs its own compute) — 3 short paragraphs |
| 3 | Principles | 4–6 principles (say what's true; own the whole thing; build for Nepal; …) |
| 4 | Team | Real people (photos when commissioned; until then names/roles with dot-portrait generative avatars, consent required) |
| 5 | Timeline | Founding → partners → first cluster commissioning → (future items outlined) |
| 6 | Where we're going | Vision as ambition: new GPU generations, larger clusters, one day our own datacentre — clearly labelled as plans |
| 7 | Press & partners | Press contact, partner names (approved) |
| 8 | Careers | Open-role count → /jobs |

## 11. Contact `/contact`

The Ascent (S11) full, with routes. Side rail (desktop) / collapsible (phone): email, Valley Time, what happens next (three steps), FormSubmit disclosure. FAQ: what to include, how fast we reply, what happens after.

## 12. Careers `/jobs` and `/jobs/[slug]`

Keep the CMS-driven board (search, filters, grouped by team) and role pages; re-skin:
- Hero: "Build Nepal's AI infrastructure." with a "basecamp" dot-route visual (generative).
- Role pages: hero gets the role's generative cover (seeded by slug); application form becomes a short Ascent variant (name → email → CV drop zone with a dot-fill progress → links → note → consent).
- Culture blocks from the CMS careers page render in the new components.

## 13. Blog `/blog` and posts

- Index: featured post as a large generative cover; category tabs; search (⌘K or /); grid.
- Post: generative hero cover (live, reactive), title, byline with dot-avatar, reading time; body typography tuned for long reading (Inter 18–19 px, 1.65 leading, 68ch); code blocks with copy; callouts; video embeds by ID; table of contents rail; reading progress line; share; related posts; next/previous. Each post's palette tints its page subtly ("own artistry, coherent theme").
- Category-specific accents: Engineering (hydro/night), Company (paper/warm), Research (glacier).

## 14. Legal `/legal/*`

Calm reading layout; section index rail; "last updated"; plain-language summary box. Update privacy for theme storage and any new local storage (reduce-motion preference, form drafts in sessionStorage).

## 15. 404

S18.

## 16. Global elements on every page

Header (03 §2) · Fog-pass transitions · Dew cursor (desktop) · Reduce-motion toggle · theme toggle · Reservoir footer · Valley Time · skip link · reading-progress line on long pages.
