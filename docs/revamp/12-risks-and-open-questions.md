# 12 · Risks and open questions

## 1. Open questions for the owner

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q1 | Written confirmation that the GPUs are **H200 NVL** (PCIe) | Every spec figure and MIG profile depends on it | Hardware, Products |
| Q2 | Are **NVLink bridges** fitted (2-way or 4-way)? | Whether we may say "GPUs linked by NVLink" at all | Hardware, Reserved |
| Q3 | What **software do customers actually use** — HPE AI Essentials directly, a CoreValley portal, an API, notebooks? Which of today's claims (Cilium, vcluster, HAMi, LiteLLM, vLLM/SGLang, a CLI, `api.corevalley.ai`) will be true at launch? | Platform page and product pages must only describe what exists | Platform, Products |
| Q4 | Will CoreValley offer the **ready-made AI solutions** (assistant with citations, knowledge Q&A, summariser, generator, data copilot)? | Possible product/section | Platform |
| Q5 | **Power arrangement**: grid connection, any dedicated hydro contract, UPS/generator backup | The Two Seasons copy and any "hydro" wording | Infrastructure |
| Q6 | **Datacentre facts** we may publish (valley only? commissioning date? Tier design target?) | Infrastructure and Trust; security | Infrastructure, Trust |
| Q7 | **Latency**: any measurements (method/date)? If none, we remove "< 5 ms" | Guardrail 5 | Infrastructure |
| Q8 | **Compliance status**: DoIT listing, ISO 27001/20000 plans, Tier certification | Trust page; guardrail 2 | Trust |
| Q9 | Partner **logo** approval from HPE / NVIDIA partner programmes | Logos vs text names | Home, Hardware |
| Q10 | **Support hours** (Nepal time) | Valley Time "engineers online" | Footer, Contact |
| Q11 | **Team** names, roles, photo consent; founding timeline | Company page | Company |
| Q12 | Inboxes for routes (sales, partners, press, support, careers) | Ascent routing | Contact |
| Q13 | When will **rates** be published (to show prices in the Meter and console)? | Pricing | Pricing |
| Q14 | Is the "**region being commissioned**" wording acceptable until the first GPU is live? | Status wording everywhere | All |
| Q15 | The datacentre's **99.99 % facility uptime** vs the Terms' **99.5 % service target** — keep both (facility vs service), or update the Terms? | Never contradict the Terms | Infrastructure, Trust, Legal |
| Q16 | The **MIG profiles** exactly as `nvidia-smi mig -lgip` lists them on our H200 NVL GPUs | The full slicer (S7) shows only real profiles; until then it shows the two documented states | Products (MIG) |
| Q17 | What the **HPE GreenLake cloud** connection carries in our deployment: do customer users sign in through it, and what telemetry does it receive? | The privacy and residency pages say only what the HPE briefing states (sign-in and updates need it; no customer data stored there) | Legal, Trust |
| Q18 | The **business terms** the Terms summary now leaves to "your agreement": payment terms, notice before suspension, time to retrieve data after closing, maintenance notice | The summary must not invent numbers | Legal |

### Answered on 13 Oct 2026

| # | Answer |
|---|---|
| Q1 | H200 NVL. The HPE briefing is the source of truth; current-site technical claims not backed by it are removed |
| Q2 | Not in the briefing → no NVLink claims anywhere |
| Q3 | Customers use HPE's proprietary software: HPE AI Essentials on HPE Private Cloud AI (with NVIDIA AI Enterprise) |
| Q5 | The datacentre runs on hydropower — claim allowed, footnoted |
| Q7 | Keep "< 5 ms inside the Kathmandu Valley" with a disclaimer |
| Q10 | Support hours to come from the owner later |
| — | New fact: 99.99 % uptime commitment from the datacentre (facility) |
| Q15 | Resolved in the rewrite of the legal pages: the Terms state the facility's 99.99 % commitment and leave CoreValley's service levels to the agreement; the 99.5 % / 99.9 % tiers are gone |

## 2. Risks register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Ambition outruns performance on low-end phones | Medium | High | Tiers, budgets, device gates every phase; posters always designed, not leftovers |
| Inaccurate or overreaching claims | Medium | High | Facts registry with build guard; guardrails list; owner review gates |
| Competitor claims ("first", "sovereign") create comparison pressure | High | Medium | Win on craft, honesty, partners, service; never contest "first" |
| Energy story backfires (dry-season imports, floods) | Medium | High | Two Seasons honesty; owner-approved wording; no disaster imagery |
| GitHub Pages limits (caching, headers) | High | Low–Medium | Service worker for immutable assets; meta CSP; revisit Cloudflare if needed |
| Library churn (Next 16.x, R3F v10, three r187) | Medium | Medium | Pin versions; upgrade only between phases; R3F v10/WebGPU after launch |
| WebGL context loss / iOS memory pressure | Medium | Medium | One context; dispose per route; context-loss fallback to posters; ≤ 150 MB GPU memory |
| Motion sickness / accessibility complaints | Low–Medium | High | Reduced-motion paths, on-site toggle, no camera spins, pause controls |
| Scope creep ("one more effect") | High | Medium | Three-idea rule; "carries a fact" test; restraint pass per page |
| Privacy contradiction (forms via FormSubmit abroad) | High | Medium | Disclose clearly now; in-country backend later |
| Merging revamp into main repeats the Oct 8 incident | Low | High | Owner-triggered launch only; explicit merge plan; rollback commit ready |
| Partner brand misuse | Low | Medium | Text names only until logo approval; follow guidelines |
| Map/border politics | Low | High | Valley rim and city points only; no national borders in visuals |

## 3. Decisions log

| Date | Decision | By |
|---|---|---|
| 2026-10-13 | Full redesign in a new folder "CoreValley Revamped", separate from preview; preview backed up | Owner |
| 2026-10-13 | GPUs are H200 NVL (to be confirmed in writing) | Owner |
| 2026-10-13 | Name HPE and NVIDIA and show cluster headline specs | Owner |
| 2026-10-13 | Stay on GitHub Pages | Owner |
| 2026-10-13 | Keep logo + hydro green; evolve everything else | Owner |
| 2026-10-13 | English first, i18n-ready | Owner |
| 2026-10-13 | No sound | Owner |
| 2026-10-13 | Build our own 3D (procedural/stylised), no licensed renders | Owner |
| 2026-10-13 | Code in redesigned-portal on a new `revamp` branch (worktree in the new folder) | Owner |
| 2026-10-13 | All GPUs "coming soon"; no "available now" | Owner (12 Oct) |
| 2026-10-13 | No stock imagery; generative + own 3D; real photography later | Owner |
| 2026-10-13 | Proper light and dark themes (no mixed bands) | Owner |
| 2026-10-13 | HPE briefing = source of truth; unbacked current-site claims removed | Owner |
| 2026-10-13 | Customers use HPE AI Essentials (HPE's software) | Owner |
| 2026-10-13 | Hydropower claim allowed; "< 5 ms" kept with disclaimer; 99.99 % facility uptime added | Owner |
