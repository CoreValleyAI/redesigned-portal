# CoreValley Revamped — master plan

The plan for a complete redesign of corevalley.ai: an award-calibre, Apple-level, alive website for Nepal's GPU cloud that stays fast, accessible, honest and useful.

- **Folder:** `C:\corevalley\CoreValley Revamped` (git worktree of `redesigned-portal`, branch `revamp`, started from `preview` @ 001a032).
- **Backups:** `C:\corevalley\backups\preview-site-2026-10-13\` (files) and `C:\corevalley\backups\preview-branch-2026-10-13.bundle` (git history of `preview`).
- **Staging (Phase 0):** `corevalley.ai/revamp/` (noindex). Live site and `/preview/` are untouched until launch.

## Read in this order

| # | Chapter | What it decides |
|---|---|---|
| 01 | [Vision and story](01-vision-and-story.md) | The concept ("The valley is coming online"), three visual ideas, principles, emotional arc, audiences, brand evolution, definition of done |
| 02 | [Research digest](02-research-digest.md) | Award winners, competitors (incl. YetiCloud.AI), Apple techniques, studio signatures, number storytelling, forms, tech verdicts, Nepal/India context |
| 03 | [Information architecture](03-information-architecture.md) | Sitemap, navigation, one-home-per-subject ownership table, FAQ ownership, URLs, i18n readiness, SEO scope |
| 04 | [Content, facts and voice](04-content-and-facts.md) | Facts registry, what runs now (HPE PCAI, 8× H200 NVL), corrections, availability language, never-say guardrails, voice, 15 Nepal use cases + India |
| 05 | [Design system](05-design-system.md) | Two themes in OKLCH, Inter + JetBrains Mono scale, grid, materials, icons, imagery policy, components |
| 06 | [Motion system](06-motion-system.md) | Tokens, springs, choreography, scroll, text effects, cursor, touch, Glow, page transitions, reduced motion, review ritual |
| 07 | [Signature experiences](07-signature-experiences.md) | S1–S18: Valley Online, Living Mark, Reservoir, Snow → Token, Two Seasons, The Machine, Slice the GPU, The Meter, Valley Rim, The Ascent, Valley Time, Plan Card, generative covers, Atlas, 404… |
| 08 | [Page specifications](08-page-specs.md) | Every page, section by section |
| 09 | [Technical architecture](09-technical-architecture.md) | Stack and versions, repo layout, persistent canvas and tiers, motion runtime, transitions, theming, CMS, fonts, media, forms, GitHub Pages delivery, privacy, SEO, testing |
| 10 | [Quality](10-quality-performance-accessibility.md) | Performance budgets, "120 fps" reality, WCAG 2.2 AA, device matrix, award criteria, per-page QA |
| 11 | [Roadmap and phases](11-roadmap-and-phases.md) | Phases 0–8 with demos and gates; owner dependencies |
| 12 | [Risks and open questions](12-risks-and-open-questions.md) | 14 questions for the owner, risks register, decisions log |

## The plan in one paragraph

We tell one story — *the Kathmandu Valley is switching on* — with three visual ideas only: **the Dot** (a dot-matrix language for terrain, the logo, numbers and art), **the Flow** (energy becoming compute becoming tokens) and **the Glow** (a Siri-like edge light shown only while a machine is really working). Every animation carries a true, dated fact. Each subject lives on exactly one page. Two complete themes (Night Valley and Glacier), Apple's typographic and motion discipline, one persistent WebGL canvas with quality tiers so it runs on a ₹15,000 phone, and phone-native touch choreography. We build it in nine phases on the `revamp` branch, demo each on a staging URL, and go live only when the owner says so.

## Tools and skills used for the design work

User-level design skills installed for this project (outside the repo): Apple design (fluid interfaces, springs, typography, materials), Apple web (apple.com page formula, scrollytelling), Apple motion (springs, gestures, micro-interactions), animation performance, and animation review — plus the existing frontend-design guidance and the page-capture screenshot tool. HyperFrames is used only for rendered video assets (films, poster loops, social cuts), never as a web runtime.
