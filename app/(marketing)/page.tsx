import Link from "next/link";
import { ButtonLink, Card, Icon } from "@/components/ui";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { SpotlightGroup } from "@/components/marketing/spotlight";
import { SpecTicker } from "@/components/marketing/spec-ticker";
import { ChipGraph } from "@/components/marketing/chip-graph";
import { GpuCompare } from "@/components/marketing/gpu-compare";
import { PinnedStory, type Step } from "@/components/marketing/pinned-story";
import { QuoteLock } from "@/components/marketing/quote-lock";
import { ScrollScrub } from "@/components/fx/scroll-scrub";
import { ScrollRail } from "@/components/fx/scroll-rail";
import { Horizon } from "@/components/fx/horizon";
import { CountUp } from "@/components/fx/count-up";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { DecodeText } from "@/components/fx/decode-text";
import { WipeText } from "@/components/fx/wipe-text";
import { EARLY_ACCESS, FACTS, SOON_GPUS } from "@/lib/availability";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "CoreValley — Nepal's GPU cloud: NVIDIA H200 in Kathmandu",
  absoluteTitle: true,
  description:
    "Nepal's GPU cloud: NVIDIA H200s available now for enterprise early access. Hydro-powered, under 5 ms latency in Kathmandu, billed in NPR, data kept in Nepal.",
  path: "/",
});

/* ── Content ───────────────────────────────────────────────────────────────
   Copy rule for this page: every claim is either a number, a component name,
   or a thing a customer can check. No "seamless", no "unleash", no
   "next-generation". If a line could appear on any other cloud's homepage, it
   has been cut.

   Two more rules on top of it. Plain words first: each block says what the
   reader gets before it says how, and the real component names live in the
   small mono lines for the engineers who want them. And one source of truth
   for status: what is live, what is coming, the latency and the power source
   all come from lib/availability.ts, so no section can contradict another. */

const STEPS: Step[] = [
  {
    n: "01 / slice",
    title: "Start on a slice.",
    body: "Rent a hardware slice of an H200 — 35 GB of its memory — billed by the second. Enough to fine-tune a 7B model tonight and shut it down by morning.",
    cmd: "corevalley pods launch --gpu h200 --slice 2g.35gb",
  },
  {
    n: "02 / card",
    title: "Graduate to whole cards.",
    body: "Same files, same code, same API key — on a full H200 with all 141 GB, then on four or eight of them when the job outgrows one.",
    cmd: "corevalley pods launch --gpu h200 --count 4",
  },
  {
    n: "03 / rack",
    title: "Reserve the rack.",
    body: "Dedicated H200 servers that nobody else touches, reserved by the month — with the same usage meter and audit log you already use.",
    cmd: "corevalley dedicated reserve --nodes 4 --term 1m",
  },
];

const PRODUCTS: {
  title: string;
  href: string;
  body: string;
  meta: string;
  /** The two lead products take the wide cells in the bento. */
  wide?: boolean;
}[] = [
  {
    title: "GPU pods",
    href: "/products/gpu-pods",
    body: "Rent a whole H200 or a slice of one, and pay by the second — from the moment your job starts, never while it waits in the queue.",
    meta: "whole cards · mig + hami slices · per-second billing",
    wide: true,
  },
  {
    title: "Model endpoints",
    href: "/products/model-endpoints",
    body: "Open models served as a ready-made API, priced per token and running inside Nepal. Already use the OpenAI SDK? Change one URL and keep your code.",
    meta: "vllm · litellm · openai-compatible · per-token",
    wide: true,
  },
  {
    title: "JupyterHub",
    href: "/products/jupyterhub",
    body: "Shared notebooks with a fair GPU limit per person, and idle sessions that shut themselves down. Built for the lab that shares two cards between forty students.",
    meta: "multi-user · per-user quotas · idle culling",
  },
  {
    title: "Dedicated & bare metal",
    href: "/products/dedicated",
    body: "Whole H200 servers that only you use, on reserved terms — with private networking and hardware-level access.",
    meta: "bare metal · ipmi · reserved terms",
  },
];

const SOVEREIGN: { term: string; body: string }[] = [
  {
    term: "Data stays here",
    body: `Your datasets, models and every request are stored and processed in ${FACTS.regionLong}, and nothing is copied abroad. Regulated projects block all outbound traffic by default.`,
  },
  {
    term: "Pay in rupees",
    body: "No dollar card and no exchange-rate surprises. Pay by eSewa, Khalti, bank transfer or corporate invoice.",
  },
  {
    term: "Help in Nepal time",
    body: "The engineers who answer you work in Kathmandu, in Nepal time. You talk to the people who run the GPUs, not a ticket queue abroad.",
  },
  {
    term: "Hydro-powered",
    body: "Our datacenter runs on Nepal's hydropower: low-carbon compute, at a power price that isn't tied to gas markets on another continent.",
  },
  {
    term: "Close to your users",
    body: `Network latency in Kathmandu is ${FACTS.latencyLong}, so your apps answer people in Nepal without a round trip abroad.`,
  },
];

/** What the chip graphic fans out to, in plain words — kept short, because
    the labels sit at the edge of a 390px-wide graphic on a phone. */
const CHIP_LABELS = [
  "data in nepal",
  "own cluster",
  "own network",
  "npr invoices",
  "usage meter",
  "support · npt",
  "audit log",
  "hydropower",
];

/** What happens after someone asks for access, so nobody has to guess. */
const HOW: { title: string; when: string; body: string }[] = [
  {
    title: "Tell us the workload",
    when: "about two minutes",
    body: "The model, the data size and the GPU hours you expect. Set them on the console below, or say it in your own words.",
  },
  {
    title: "Get a plan and a firm quote",
    when: "within one working day",
    body: "A capacity plan and a firm price in rupees, from our team in Kathmandu. No sales call needed.",
  },
  {
    title: "Launch on H200",
    when: "billed by the second",
    body: "Start on a slice or on whole cards. The meter starts when your job runs and stops the moment you stop it.",
  },
];

/** A short Hydro rule that leads a status line. The status is said in words,
    set as an editorial kicker — never a pill, never a pulsing dot. */
function Rule({ wideOnly = false }: { wideOnly?: boolean }) {
  // wideOnly: dropped on phones, where two rules would squeeze the status
  // line onto two lines.
  return (
    <span
      aria-hidden="true"
      className={`h-px w-6 shrink-0 bg-hydro sm:w-10 ${wideOnly ? "hidden sm:block" : ""}`}
    />
  );
}

const textLink =
  "group inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100";

export default function HomePage() {
  // The RTX PRO 6000 has its own card in the comparison, so the roadmap row
  // lists the rest of what is coming.
  const soon = SOON_GPUS.filter((s) => !s.id.startsWith("rtx-pro-6000"));

  return (
    <>
      <ScrollRail />

      {/* ══ HERO ══════════════════════════════════════════════════════════
          The dot-terrain canvas fills the whole section: the brand ridgeline
          in motion. The headline says the payoff in plain words — build here,
          keep it here — and the status line above it says what is live. */}
      <section id="start" data-rail="start" className="relative isolate overflow-hidden">
        {/* Writes --sp as the hero scrolls away: the copy and the stats panel
            drift apart at different rates (see .hero-copy / .hero-stats). */}
        <ScrollScrub mode="exit" />
        <div className="absolute inset-0 -z-10">
          <DotTerrain />
          {/* Mist: the range settles into the ground colour at the bottom of
              the hero, so the stats sit on calm ground. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent via-bg-base/70 to-bg-base"
          />
        </div>

        <div className="mx-auto max-w-page-xl px-5 pt-12 pb-8 md:px-10 md:pt-16 md:pb-10">
          <div className="hero-copy mx-auto flex max-w-[60rem] flex-col items-center text-center">
            <Reveal>
              {/* What is live, as a kicker between two short rules: static
                  type, no container, no dot. The call to action is the
                  button below, so this line is plain text, not a link. */}
              <p className="flex items-center justify-center gap-3 font-mono text-[11.5px] tracking-label text-ink-300 uppercase">
                <Rule wideOnly />
                <span className="whitespace-nowrap">
                  <span className="text-hydro light:text-hydro-dark">{EARLY_ACCESS.pill}</span>
                  <span aria-hidden="true" className="px-2 text-ink-500">
                    ·
                  </span>
                  <span className="hidden sm:inline">enterprise </span>early access
                </span>
                <Rule wideOnly />
              </p>
            </Reveal>

            <Reveal delay={70}>
              {/* The brand line, now in the present tense: the launch film's
                  "coming online" has happened. Being a line rather than a
                  description, it leans on the sub below to say plainly what
                  CoreValley is. */}
              <h1 className="display mt-8 text-[clamp(3rem,8.4vw,6.5rem)] leading-[0.98] tracking-[-0.035em]">
                <WipeText text="The valley is" />
                <br />
                <span className="online-glow text-hydro">
                  <WipeText text="online." start={3} />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-8 max-w-[42ch] text-[clamp(1.125rem,1.7vw,1.375rem)] leading-relaxed text-balance text-ink-200">
                Nepal&rsquo;s own GPU cloud: NVIDIA H200s, rented by the second
                from a <span className="whitespace-nowrap">hydro-powered</span>{" "}
                Kathmandu datacenter.
              </p>
              <p className="mx-auto mt-3 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-300 md:text-base">
                Pay in rupees, get help in Nepal time, and keep every byte of
                your data in the country.
              </p>
            </Reveal>

            <Reveal delay={230}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
                <ButtonLink
                  href="/contact"
                  variant="primary"
                  size="lg"
                  iconRight={<Icon name="arrow-right" size={17} />}
                >
                  Get early access
                </ButtonLink>
                <a href="#how" className={textLink}>
                  How early access works
                  <Icon
                    name="caret-down"
                    size={14}
                    className="transition-transform duration-normal ease-out group-hover:translate-y-0.5"
                  />
                </a>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-400">
                We reply within one working day with a capacity plan and a
                rupee quote.
              </p>
            </Reveal>

            <Reveal delay={300}>
              {/* One left-aligned column on phones (a ragged centred wrap reads
                  as a typesetting accident), one centred row from sm up. */}
              <ul className="hero-chips mx-auto mt-10 grid w-fit grid-cols-1 gap-y-2.5 text-left sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-3">
                {[
                  "Billed in NPR",
                  "Data stays in Nepal",
                  "Support in Nepal time",
                  `${FACTS.latency} in Kathmandu`,
                  "Hydro-powered",
                ].map((chip) => (
                  <li
                    key={chip}
                    className="flex items-center gap-2 font-mono text-[12.5px] font-medium tracking-wide whitespace-nowrap text-ink-300"
                  >
                    <Icon name="check" size={12} className="shrink-0 text-hydro" />
                    {chip}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ── Stats ────────────────────────────────────────────────────
              Four figures on a calm plate, so the terrain never runs through
              a label. Numbers count up on entry but the server renders the
              final value, so this is still correct with JavaScript off. */}
          <RevealGroup
            step={80}
            start={120}
            className="hero-stats mt-16 grid grid-cols-2 gap-x-6 gap-y-9 rounded-2xl border border-line-subtle bg-bg-base/80 px-6 py-8 backdrop-blur-sm md:mt-20 md:grid-cols-4 md:px-10 md:py-10"
          >
            {[
              {
                value: <CountUp value={141} suffix=" GB" />,
                label: "memory per H200",
                sub: "room for big models on one card",
                accent: false,
              },
              {
                value: FACTS.latency,
                label: FACTS.latencyLabel,
                sub: "served in-country, not overseas",
                accent: false,
              },
              {
                value: <CountUp value={100} suffix="%" />,
                label: "of your data stays in Nepal",
                sub: "stored and processed in Kathmandu",
                accent: true,
              },
              {
                value: "NPR",
                label: "billed in rupees",
                sub: "eSewa · Khalti · bank · invoice",
                accent: false,
              },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className={`nums font-mono text-[clamp(1.75rem,3.4vw,2.35rem)] leading-none font-medium tracking-tight ${
                    s.accent
                      ? "text-hydro [text-shadow:0_0_30px_rgb(var(--hydro-rgb)/0.28)]"
                      : "text-ink-100"
                  }`}
                >
                  {s.value}
                </div>
                <p className="cv-label mt-3">{s.label}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-ink-500">{s.sub}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════════ */}
      <SpecTicker />

      {/* ══ WHY ═══════════════════════════════════════════════════════════
          The argument first, in plain words: a bracketed lead, a "+" list —
          and beside it the die with its traces fanning out to the things the
          list names. */}
      <section id="sovereign" data-rail="why nepal" className="relative py-20 md:py-28">
        <Horizon index="02" label="why nepal" />
        <div className="mx-auto grid max-w-page-xl gap-14 px-5 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="cv-label">Why CoreValley</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="Sovereign by construction," />
                <br />
                <WipeText text="not by contract." start={3} />
              </h2>
            </Reveal>

            {/* The bracket: a drafting mark that ties the lead back to the
                heading, drawn as two hairlines rather than an image. */}
            <Reveal delay={120}>
              <div className="relative mt-8 pl-7 sm:pl-10">
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-6 w-4 border-b border-l border-line-strong sm:h-8 sm:w-8"
                />
                <p className="text-md leading-relaxed text-ink-300">
                  Your data, your money and your support all stay in Nepal.
                  Not because a contract says so, but because the GPUs, the
                  billing and the people are all in Kathmandu.
                </p>
              </div>
            </Reveal>

            <ul className="mt-8 flex flex-col gap-5 pl-7 sm:pl-10">
              {SOVEREIGN.map((s, i) => (
                <Reveal as="li" key={s.term} delay={180 + i * 70}>
                  <div className="flex gap-3.5 text-[15px] leading-relaxed">
                    <span aria-hidden="true" className="mt-px shrink-0 font-mono text-hydro">
                      +
                    </span>
                    <p className="text-ink-400">
                      <span className="font-semibold text-ink-100">{s.term}.</span>{" "}
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={560}>
              <Link href="/company" className={`${textLink} mt-10 ml-7 sm:ml-10`}>
                why we built this
                <Icon
                  name="arrow-right"
                  size={14}
                  className="transition-transform duration-normal ease-out group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
          </div>

          <Reveal kind="scale" delay={200} className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-lg">
              <ChipGraph labels={CHIP_LABELS} />
            </div>
            <p className="mt-3 text-center font-mono text-[10.5px] tracking-label text-ink-500 uppercase">
              one h200 · everything it touches stays in kathmandu
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ EARLY ACCESS BAND ═════════════════════════════════════════════
          The page's second chance to act, for the reader the argument above
          has already convinced — so nobody has to scroll back to the hero. */}
      <section aria-labelledby="ea-band" className="relative pb-6 md:pb-10">
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <Reveal>
            {/* One message, one action: the claim on the left, the button
                and its promise stacked on the right, both centred on the
                band's midline. */}
            <div className="flex flex-col gap-6 rounded-xl border border-line bg-carbon-800/60 px-6 py-7 md:flex-row md:items-center md:justify-between md:gap-12 md:px-10 md:py-9">
              <div className="max-w-[46ch]">
                <p className="flex items-center gap-3 font-mono text-[11.5px] tracking-label text-hydro uppercase light:text-hydro-dark">
                  <Rule />
                  Early access
                </p>
                <h2
                  id="ea-band"
                  className="mt-3 text-[clamp(1.4rem,2.4vw,1.85rem)] leading-tight font-semibold tracking-tight text-balance text-ink-100"
                >
                  H200s are available now for enterprises.
                </h2>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-400">
                  More GPUs, and access for more teams, are coming soon.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2.5 md:items-center">
                <ButtonLink
                  href="/contact"
                  variant="primary"
                  size="lg"
                  className="w-full md:w-auto"
                  iconRight={<Icon name="arrow-right" size={17} />}
                >
                  Get early access
                </ButtonLink>
                <p className="text-center text-[12.5px] text-ink-500">
                  We reply {EARLY_ACCESS.replyTime}.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ PLATFORM ══════════════════════════════════════════════════════
          The growth path — slice, card, rack — then a bento, not three equal
          columns: the two lead products get the wide cells, the asymmetry
          says which products most customers start with. */}
      <section id="platform" data-rail="platform" className="relative py-20 md:py-28">
        <Horizon index="03" label="platform" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          {/* The heading gets its own, wider measure: squeezed into the
              paragraph's 56ch it rags into three lines beside empty space. */}
          <div className="max-w-[46rem]">
            <Reveal>
              <p className="cv-label">The platform</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="Rent a slice. Rent a rack." />
                <br />
                <WipeText text="Never switch clouds." start={5} />
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 max-w-[56ch] leading-relaxed text-ink-400">
                Start on a slice of an H200, move to whole cards, then reserve
                dedicated servers. One account, one rupee invoice and one
                country the whole way.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <Link href="/products" className={`${textLink} mt-7`}>
                all products
                <Icon
                  name="arrow-right"
                  size={14}
                  className="transition-transform duration-normal ease-out group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
          </div>

          {/* The pinned story: the racks stay put while slice, card and rack
              scroll past; each step pulls its rack out. */}
          <PinnedStory steps={STEPS} className="mt-14" />

          <SpotlightGroup className="mt-14">
            <RevealGroup
              kind="tilt"
              step={90}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {PRODUCTS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`group block h-full ${p.wide ? "lg:col-span-2" : ""}`}
                >
                  <Card
                    padding={0}
                    className="cv-spotlight lg-hover flex h-full flex-col"
                  >
                    <div className="flex flex-1 flex-col p-7">
                      {/* No icon tile: the product is named the way the CLI names it. */}
                      <span className="cv-label flex items-center gap-2 text-hydro">
                        <span aria-hidden="true">&gt;</span>
                        {p.href.split("/").pop()}
                      </span>
                      <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink-100">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 max-w-[46ch] text-sm leading-relaxed text-ink-400">
                        {p.body}
                      </p>
                      <p className="mt-auto pt-8 font-mono text-[11px] tracking-wide text-ink-500">
                        {p.meta}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-line-subtle px-7 py-4">
                      <span className="font-mono text-[11px] tracking-label text-ink-500 uppercase">
                        explore
                      </span>
                      <Icon
                        name="arrow-right"
                        size={14}
                        className="text-ink-500 transition-transform duration-normal ease-out group-hover:translate-x-1"
                      />
                    </div>
                  </Card>
                </Link>
              ))}
            </RevealGroup>
          </SpotlightGroup>
        </div>
      </section>

      {/* ══ HARDWARE ══════════════════════════════════════════════════════
          What runs today and what comes next, labelled as such: the
          comparison carries a status on each card, the roadmap row says
          "coming soon" in words. */}
      <section id="hardware" data-rail="hardware" className="relative isolate py-20 md:py-28">
        <Horizon index="04" label="hardware" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_55%_at_50%_50%,rgb(var(--ink-rgb)/0.02),transparent_72%)]"
        />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[58ch]">
            <Reveal>
              <p className="cv-label">Hardware</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="The H200 today." />
                <br />
                <WipeText text="Blackwell next." start={3} />
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 leading-relaxed text-ink-400">
                <span className="font-semibold text-ink-200">Available now:</span>{" "}
                the NVIDIA H200 — 141 GB of memory on one card, built for
                training and serving the largest models.{" "}
                <span className="font-semibold text-ink-200">Coming soon:</span>{" "}
                the RTX PRO 6000 Blackwell for fast, affordable inference and
                visual AI.
              </p>
            </Reveal>
          </div>

          <SpotlightGroup className="mt-14">
            <GpuCompare />
          </SpotlightGroup>

          {soon.length ? (
            <>
              <Reveal delay={80}>
                <p className="cv-label mt-12">Also coming soon</p>
              </Reveal>
              <RevealGroup
                step={60}
                start={120}
                className={`mt-4 grid gap-4 ${soon.length > 1 ? "sm:grid-cols-2" : "max-w-[30rem]"}`}
              >
                {soon.map((sku) => (
                  <div
                    key={sku.id}
                    className="flex h-full items-center justify-between gap-3 rounded-lg border border-dashed border-line px-5 py-4"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-ink-200">
                        {sku.name}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] text-ink-500">
                        {sku.memoryGb} GB {sku.memoryType} · {sku.architecture}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10.5px] tracking-label text-ink-500 uppercase">
                      coming soon
                    </span>
                  </div>
                ))}
              </RevealGroup>
            </>
          ) : null}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════
          The page ends on the ask: what happens next in three steps, then the
          quote console that carries a configuration to the form. */}
      <section id="contact" data-rail="early access" className="relative overflow-hidden py-20 md:py-28">
        <Horizon index="05" label="early access" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <Reveal kind="scale">
            <div className="relative text-center">
              <p className="relative font-mono text-[11.5px] tracking-label text-hydro uppercase">
                <DecodeText text="h200 · available now · enterprise early access" speed={22} />
              </p>
              <h2 className="display relative mx-auto mt-5 max-w-[20ch] text-[clamp(2rem,4.4vw,3.2rem)]">
                <WipeText text="Your next training run, on Himalayan hydro." />
              </h2>
              <p className="relative mx-auto mt-6 max-w-[54ch] text-md leading-relaxed text-ink-400">
                Tell us the model, the dataset size and the GPU hours you
                expect. Within one working day you get a capacity plan and a
                firm rupee price — not a sales call.
              </p>
            </div>
          </Reveal>

          <RevealGroup
            id="how"
            step={80}
            start={100}
            className="mx-auto mt-12 grid max-w-[64rem] scroll-mt-28 gap-4 md:grid-cols-3"
          >
            {HOW.map((s, i) => (
              <div
                key={s.title}
                className="flex h-full flex-col rounded-lg border border-line bg-carbon-800/50 px-5 py-5 text-left"
              >
                <p className="font-mono text-[11px] tracking-label text-hydro uppercase">
                  0{i + 1} · {s.when}
                </p>
                <h3 className="mt-2.5 text-base font-semibold tracking-tight text-ink-100">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-400">{s.body}</p>
              </div>
            ))}
          </RevealGroup>

          {/* The quote console: set GPU, count and hours, and the button
              carries the plan to the form. */}
          <Reveal delay={120} className="relative mt-10">
            <QuoteLock />
          </Reveal>
        </div>
      </section>
    </>
  );
}
