# 04 · Content, facts and voice

Accuracy is a design requirement. This chapter is the contract for every word and number on the site.

---

## 1. The facts registry

All facts live in **one typed module** (`lib/facts.ts`, generated from the existing `lib/catalog.ts`, `lib/availability.ts`, `lib/gpu-specs.ts`). Every entry carries:

```ts
{
  id: "h200nvl.memory",
  value: "141 GB HBM3e",
  status: "confirmed" | "to-verify",
  source: "https://www.nvidia.com/en-us/data-center/h200/",
  asOf: "2026-10-13",
  owner: "hardware",          // the page that owns it (see 03 §3)
  footnote?: "…",
}
```

Rules:
- A component may only render a fact through this registry (no numbers typed into JSX).
- `to-verify` facts render only on staging, with a visible amber marker; production builds **fail** if a page references a `to-verify` fact.
- **Internal-only facts never enter the repository.** The repo is public, so confidential values (from the HPE briefing or anywhere else) are not stored in code, docs or commit history — not even marked as hidden.
- Every rendered number gets an `asOf` date somewhere on its page (footnote or caption).

---

## 2. What runs now (owner-confirmed, from the HPE briefing of 9 Oct 2026)

**Owner ruling (13 Oct 2026): the HPE briefing is the source of truth. The current site's technical claims may not be true — any claim not backed by the briefing or an explicit owner statement is removed, not reworded.**

Public-safe facts, approved for naming HPE and NVIDIA:

| Fact | Value | Status |
|---|---|---|
| Platform | **HPE Private Cloud AI** (Gen2, "Medium"), co-engineered by HPE and NVIDIA | confirmed |
| GPUs | **8 × NVIDIA H200 NVL** (PCIe) | confirmed by owner |
| GPU servers | **2 × HPE ProLiant DL380a Gen12**, 4 × H200 NVL each | confirmed |
| Per-server | 2 × Intel Xeon 6 processors, 1 TB memory, local NVMe | confirmed (publish the processor family only) |
| GPU interconnect | **Not in the briefing → the site makes no NVLink claims at all** | ruled |
| Data network | **400 Gb/s NVIDIA Spectrum Ethernet** | confirmed (no switch models, port maps or topology) |
| Storage | **62 TB usable all-flash**, S3-compatible object + file (HPE Alletra Storage MP X10000) | confirmed (publish usable capacity only) |
| Customer software | Customers use **HPE's software: HPE AI Essentials** on HPE Private Cloud AI, with **NVIDIA AI Enterprise** (incl. NIM microservices) | confirmed by owner |
| Frameworks in HPE AI Essentials | JupyterLab, Kubeflow (incl. Katib, Kale), Ray, Spark, Airflow, MLflow, KServe, Presto, Superset, TensorFlow | confirmed (briefing) |
| Power | **The datacentre runs on Nepal's hydropower** | confirmed by owner; footnote: Nepal's grid ≈ 95 % hydro by installed capacity (3,905 of 4,120 MW, NRB FY2025/26) |
| Facility uptime | **99.99 % uptime commitment from our datacentre** | confirmed by owner; worded as the *facility's* commitment (see Q15 — Terms currently state a 99.5 % service target) |
| Latency | **< 5 ms inside the Kathmandu Valley** | kept by owner, with disclaimer (§2a) |
| Ready-made AI accelerators (from the platform) | Enterprise virtual assistant (cited answers), knowledge-base Q&A, document summariser, document generator, data copilot (plain-English to SQL) | **ask owner** whether CoreValley offers these to customers (Q4) |

### 2a. Required disclaimers

- **Latency:** "< 5 ms round-trip within the Kathmandu Valley. Typical figure for connections inside the valley; your latency depends on your network and location."
- **Uptime:** "99.99 % is our datacentre facility's availability commitment (power, cooling and building infrastructure). Service-level terms for CoreValley services are set out in your agreement."
- **Hydropower:** "Our datacentre runs on Nepal's hydro-dominated grid (≈ 95 % hydro by installed capacity, NRB FY2025/26)." Avoid certificate-style wording ("certified 100 % renewable", "carbon-neutral") unless a certificate exists.

**Never publish (confidential):** presenter names, recording times, part numbers (PDUs, transceivers), network topology/VLAN/uplink design, licensing and activation steps, GreenLake onboarding details, support model terms ("managed by the customer"), the internal handover schedule.

### H200 NVL datasheet values (verify each against nvidia.com/h200 before launch)

| Spec | H200 NVL | Note |
|---|---|---|
| Memory | 141 GB HBM3e | same as SXM |
| Memory bandwidth | 4.8 TB/s | same as SXM |
| FP8 Tensor | 3,341 TFLOPS* | *with sparsity; SXM is 3,958 — the current site uses the SXM figure and must change |
| BF16 / FP16 Tensor | 1,671 TFLOPS* | |
| TF32 Tensor | 835 TFLOPS* | |
| FP64 / FP64 Tensor | 30 / 60 TFLOPS | |
| Max power | up to 600 W (configurable) | |
| Interconnect | 2- or 4-way NVLink bridge, 900 GB/s per GPU; PCIe Gen5 128 GB/s | bridge presence to confirm |
| MIG | up to 7 instances @ ~16.5 GB | **SXM is 7 @ 18 GB** — verify actual profile names with `nvidia-smi mig -lgip` on our hardware before publishing slice sizes |
| Decoders | 7 NVDEC, 7 JPEG | |
| Confidential computing | supported | |
| NVIDIA AI Enterprise | included with H200 NVL | |

### Corrections the new site must make (vs today's preview)

1. "1× or 8× NVLink", "8 GPUs joined by NVLink in one server", "4 or 8 GPUs per server" → the real servers hold **4 GPUs each**; **no NVLink claims anywhere** (not in the briefing).
2. H200 FP8 "3,958 TFLOPS" (SXM) → NVL value, or drop TFLOPS entirely from marketing copy.
3. MIG slice names `1g.18gb / 2g.35gb / 3g.71gb` are SXM profiles → replace with verified NVL profiles.
4. Software claims (Cilium, vcluster, HAMi shared slices, LiteLLM, vLLM/SGLang, `api.corevalley.ai`, a `corevalley` CLI, terminals showing those commands) → **removed**. Customers use HPE AI Essentials with NVIDIA AI Enterprise; describe only those (owner, 13 Oct).
5. Storage claims ("replicated network SSD", "ephemeral local NVMe scratch", "buckets") → replace with the briefing's facts: 62 TB usable all-flash HPE Alletra Storage MP X10000 with S3 object + file; local NVMe in each GPU server.
6. Reserved-server claims (bare metal or KVM VM, IPMI, Cilium private network, 6/12/36-month terms) → keep only business terms the owner confirms; remove technical claims not in the briefing.
5. "Region `np-ktm-1` live" while all GPUs are "coming soon" → present the region as "being commissioned" until the first GPU is available.
6. "100% of your data" → "100% of your workload data" (forms, website and email are processed abroad — see data-residency page).
7. Stale legal lines (theme toggle wording, "Dedicated and Sovereign tiers") → update with the new site.

---

## 3. Availability language (single source)

`lib/availability.ts` stays the only place availability is worded. Current state (owner instruction, Oct 2026): **all GPUs, including the H200, are "coming soon"**; enterprises can join early access.

| Thing | Wording |
|---|---|
| H200 NVL | "Coming soon · enterprise early access" |
| RTX PRO 6000 Blackwell | "Next" (no date) |
| Future generations (e.g. Vera Rubin) | Only in Company → Vision, as ambition: "We'll add new generations as they ship." Never a date, never "coming". |
| Region | "Kathmandu Valley · being commissioned" until the first GPU is live |
| Reply promise | "We reply within one working day" — Contact and Pricing only |

---

## 4. Claims guardrails — never say

1. **"Nepal's first / only GPU cloud", "first sovereign AI cloud"** — YetiCloud.AI launched with those claims on 3 Jul 2026. Also avoid implying a link to the government's planned Sovereign AI Compute Centre.
2. **"DoIT-listed", "Tier III", "ISO 27001/20000", "NRB-approved/compliant"** — only once held, with certificate dates on `/trust`.
3. **"Nepali law requires all data to stay in Nepal"** — false as a blanket statement. State the exact rule (Data Centre & Cloud Service Directive 2081; NRB Payment-System Directive 2081) or say "built for organisations that need data to stay in Nepal".
4. **Certificate-style energy claims** ("certified 100 % renewable", "carbon-neutral") without a certificate. *Allowed (owner-confirmed 13 Oct):* "runs on Nepal's hydropower", "hydro-powered", with the §2a footnote.
5. **Latency comparisons** ("faster than Mumbai", "faster than any other cloud") without published measurements. *Allowed (owner, 13 Oct):* "< 5 ms inside the Kathmandu Valley" with the §2a disclaimer.
5a. **Service SLAs** — never present the datacentre's 99.99 % facility commitment as a CoreValley service SLA; never contradict the Terms.
6. **"AI predicts earthquakes"**, "AI would have prevented the 2026 floods" — and no disaster casualty figures as marketing hooks.
7. **Clinical claims** ("AI diagnoses TB", "replaces radiologists") — triage and decision support only.
8. **Named customers or partners** (NTC, Ncell, NRB, NEA, ICIMOD, TU, KU, hospitals, Bhashini…) unless signed. Use "built for" wording.
9. **Government endorsement** or "the AI Policy mandates local compute" — it is soft law.
10. **Cheaper than IndiaAI**; "DPDP requires localisation"; any offer to host Indian payment, securities or government data.
11. **"Available now"** for any GPU.
12. **"123 languages"** (it is 124 mother tongues); hundi percentages; wallet "users" (they are accounts).
13. **Tax advantage over foreign clouds** — 13 % VAT applies locally too.
14. **Buzzwords**: "AI factory", "superintelligence", "revolutionary", "world-class", "cutting-edge", "seamless", "unleash".
15. **HPE/NVIDIA logos** — the owner approved using both logos on 13 Oct 2026. Use the official artwork unaltered (`components/brand/partner-logos.tsx`, from the launch film's `assets/partners`): only the neutral parts follow the theme, NVIDIA green and HPE green stay fixed. Show them to say what the cloud is built on ("Built on"); never claim a partner designation ("NVIDIA Cloud Partner", "Preferred Partner") unless one is held.

---

## 5. Voice and tone

**Voice:** calm, exact, local, warm. Engineers talking to engineers, in plain English that a bank's procurement officer also understands.

| Do | Don't |
|---|---|
| Short sentences. One idea each. | Stacked adjectives and slogans |
| Concrete nouns: "eight H200 GPUs", "Kathmandu", "rupees", "per second" | "Next-gen infrastructure", "scalable solutions" |
| Say what's true now and what's coming, separately | Blur the two |
| Explain jargon once, gently (MIG = "a hardware slice of one GPU") | Assume everyone knows MIG, NVLink, NIM |
| Numbers with a comparison and a date | Bare numbers |
| "We" = CoreValley; "you" = the visitor | Third-person corporate voice |
| British-leaning English already used on the site (organisation, colour) | Mixed spellings |

**Headline pattern:** a short declarative line (≤ 6 words), optionally followed by a grey continuation clause — Apple style ("Your data stays in the valley. *Inside the rim, under Nepal's law.*").

**Microcopy:** buttons say exactly what happens ("Request access", "Slice the GPU", "Stop the meter", "Send application"). No "Submit", no "Learn more" without a noun.

**Copy length budget per section:** headline ≤ 8 words, lead ≤ 30 words, body ≤ 60 words; more detail goes one click deeper (engineer mode, docs, FAQ).

---

## 6. Use cases — Nepal (ranked by impact and credibility)

Each card on `/use-cases` uses this template: **The problem (one sourced fact)** → **What AI does** → **Why it belongs in Nepal** → **Who builds it** → **Runs on** (product chips). Sources must appear as footnotes. Figures marked † are secondary-sourced and need re-checking before publishing.

| # | Use case | Key fact (source) | Product fit |
|---|---|---|---|
| 1 | **Language AI for 124 mother tongues** — Nepali, Maithili, Bhojpuri, Tamang, Nepal Bhasa LLMs, speech, translation, Devanagari OCR | Census 2021: 124 mother tongues; Nepali is the mother tongue of 44.86 % ([source](https://en.wikipedia.org/wiki/Languages_of_Nepal)); KU's NLLB fine-tune on 100k+ Nepali–Tamang–English pairs ([Techpana](https://techpana.com/2026/157326/ku-completes-google-funded-trilingual-ai-translation-project-for-nepali-tamang-and-english)) | Reserved (training) → Inferencing; MIG for speech; Storage; Services |
| 2 | **Fraud, AML and KYC** for banks, wallets, remittance | ~30M mobile-banking and ~28M wallet accounts (NRB, mid-May 2026)†; FATF grey list since Feb 2025†; 20,526 cyber-crime complaints FY2025/26† | Reserved (private cluster), Inferencing, Storage, Services |
| 3 | **Government services and records** — Devanagari OCR/handwriting, Nagarik App assistants, circular search | AI Policy 9.52 (Nagarik App); 2023 data loss of 85,000+ PSC records† | Reserved, Inferencing, Storage, Services — realistic first step: non-sensitive/public data until Tier III |
| 4 | **Hydropower and grid forecasting** — inflow, demand, trade prices, sediment, inspection | 3,905 of 4,120 MW hydro (NRB, Aug 2026)†; 430+ MW off-grid after the Aug 2026 flood† | Reserved, Inferencing, Storage, Services |
| 5 | **Himalayan hazard science** — InSAR, glacial lakes, landslides, flood simulation | ICIMOD: 21 potentially dangerous glacial lakes in Nepal (2020); HKH glaciers vanished 65 % faster in 2011–20 | On-demand bursts, Reserved for seasons, Storage |
| 6 | **Healthcare triage** — chest-X-ray TB screening support, imaging triage, clinical NLP | WHO: ~67,000 TB cases (2024), ~28,000 missed† | MIG (inference), On-demand (validation), Storage |
| 7 | **Universities and AI skills** | 633,053 higher-education students; TU 77.6 % (UGC 2023/24); AI Policy target: 5,000 AI professionals | MIG slicing, notebooks, On-demand |
| 8 | **Startups and IT exporters** | IT exports ~USD 1bn/yr (NAS-IT estimate)†; non-exporters capped at USD 3,000/yr card spend on foreign software (NRB 6 Apr 2026) | On-demand, Inferencing, MIG, Reserved |
| 9 | **Agriculture** — crop disease, yield, Nepali voice advice | Agriculture 24 % of GDP (FY2025/26 prelim.)†; 62 % of households farm | On-demand, Inferencing, MIG |
| 10 | **Remittances and migrant workers** — contract checks in many languages, fake-job detection | Remittances Rs 2,363bn (USD 16.19bn) FY2025/26, roughly a third of GDP† | Inferencing, Reserved, Storage |
| 11 | **Telecom** — Nepali voice/chat care, network anomaly detection, scam filtering | 30.99M broadband subscriptions† | Inferencing, Reserved |
| 12 | **Courts and legal research** — OCR, Nepali legal search, summaries (never deciding cases) | 357,023 cases handled FY2025/26† ; precedents only in Nepali | Private Inferencing, Storage, Services (neutral wording about 2025 losses) |
| 13 | **Media and information integrity** — transcription, archive search, synthetic-media detection | 600+ AI-disinformation referrals around the Mar 2026 election† | Inferencing, On-demand |
| 14 | **Cultural heritage** — manuscripts (Devanagari, Newar, Tibetan scripts), 3D monuments | ~180,000 manuscripts microfilmed (NGMPP) | On-demand, Storage, Services |
| 15 | **Tourism** — multilingual trek and heritage assistants | 1.16M visitors in 2025; record Everest spring 2026† | Inferencing, On-demand (weakest residency case — present honestly as cost/locality) |

### India (later expansion — framed carefully)

1. Nepali, Maithili and Bhojpuri language models across the border (train in Nepal on Nepal-origin data; hand over weights).
2. Shared-basin flood and glacial-lake science (Koshi, Teesta) as research compute.
3. Cross-border power-trade forecasting (Nepal-side and public market data).
4. Indian companies' Nepal subsidiaries (their Nepal data).
5. Shared manuscript heritage (research partnerships).
6. Reserved overflow capacity for non-personal workloads (open data, synthetic data, simulation, rendering) — sold on guaranteed capacity and engineering help, never on price.
7. Nepal-side analytics for UPI/QR payments acquired in Nepal (Indian side stays in India).

State plainly on the India section: *we do not host Indian payment, securities or government data*.

---

## 7. Page copy inventory (to write in Phase 0)

Copy is written per page in `content/en/<page>.ts` before the page is built, reviewed against this chapter, then frozen for the build. Every page's copy file contains: meta title/description, section headlines/leads/bodies, microcopy, alt text, footnotes, FAQ (if owned), CTA.

Owner inputs needed before final copy: see [12-risks-and-open-questions.md](12-risks-and-open-questions.md).
