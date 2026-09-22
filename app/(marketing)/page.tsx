import Link from "next/link";
import { Badge, Button, Card, Icon, Terminal } from "@/components/ui";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { SovereignMesh } from "@/components/marketing/sovereign-mesh";
import { SpotlightGroup } from "@/components/marketing/spotlight";
import { SpecTicker } from "@/components/marketing/spec-ticker";
import { ChipGraph } from "@/components/marketing/chip-graph";
import { RackGraphic } from "@/components/marketing/rack-graphic";
import { PinnedStory, type Step } from "@/components/marketing/pinned-story";
import { ScrollScrub } from "@/components/fx/scroll-scrub";
import { ScrollRail } from "@/components/fx/scroll-rail";
import { Horizon } from "@/components/fx/horizon";
import { PolicyGrid } from "@/components/marketing/policy-grid";
import { QuoteLock } from "@/components/marketing/quote-lock";
import { CountUp } from "@/components/fx/count-up";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { DecodeText } from "@/components/fx/decode-text";
import { WipeText } from "@/components/fx/wipe-text";
import { GPU_SKUS } from "@/lib/catalog";
import { docsHref } from "@/lib/docs/href";

export const metadata = {
  title: "CoreValley — sovereign AI compute, hosted in Kathmandu",
  description:
    "NVIDIA H100 and H200 capacity inside Nepal. Per-second GPU pods, JupyterHub for research teams, and OpenAI-compatible model endpoints — billed in NPR, with data that never crosses the border.",
};

/* ── Content ───────────────────────────────────────────────────────────────
   Copy rule for this page: every claim is either a number, a component name,
   or a thing a customer can check. No "seamless", no "unleash", no
   "next-generation". If a line could appear on any other cloud's homepage, it
   has been cut. */

/* The Fabric (latency map) section is switched off for now. Everything it
   needs stays in the tree; flip this to bring it back. The section numbers
   on the horizon rules follow. */
const SHOW_FABRIC = false;
const SEC = SHOW_FABRIC
  ? { fabric: "04", hardware: "05", architecture: "06", contact: "07" }
  : { fabric: "04", hardware: "04", architecture: "05", contact: "06" };

const STEPS: Step[] = [
  {
    n: "01 / slice",
    title: "Start on a slice.",
    body: "A MIG partition of an H200 — 2g.35gb, 35 GB of HBM3e — billed by the second. Enough to fine-tune a 7B model tonight and shut it down by morning.",
    cmd: "corevalley pods launch --gpu h200 --slice 2g.35gb",
  },
  {
    n: "02 / card",
    title: "Graduate to whole cards.",
    body: "The same image, the same volume, the same API key — on a full H100 or H200, and on four of them when the job outgrows one.",
    cmd: "corevalley pods launch --gpu h100 --count 4",
  },
  {
    n: "03 / rack",
    title: "Reserve the rack.",
    body: "Dedicated nodes on a private vcluster, reserved by the month, with the same meter and the same audit log you were already reading.",
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
    body: "Whole H100 and H200 cards, or a fourteenth of one. MIG and HAMi slicing, billed by the second from the moment the container is running — nothing charged while it queues.",
    meta: "mig · hami · per-second billing",
    wide: true,
  },
  {
    title: "Model endpoints",
    href: "/products/model-endpoints",
    body: "Open-weight models behind vLLM and a LiteLLM gateway, priced per token and served from inside Nepal. Point an OpenAI client at a new base URL and keep everything else.",
    meta: "vllm · litellm · per-token",
    wide: true,
  },
  {
    title: "JupyterHub",
    href: "/products/jupyterhub",
    body: "Multi-user notebooks with GPU spawner profiles, per-user quotas and idle culling. Built for the lab that shares two cards between forty students.",
    meta: "multi-user · idle culling",
  },
  {
    title: "Dedicated & bare metal",
    href: "/products/dedicated",
    body: "Whole nodes with no neighbours. Reserved terms, IPMI access, private tenant networking, your own Cilium policy.",
    meta: "bare metal · reserved terms",
  },
];

const SOVEREIGN: { term: string; body: string }[] = [
  {
    term: "Data residency",
    body: "Datasets, checkpoints and inference requests live their whole lifecycle in np-ktm-1. Egress is default-deny, and it takes a written change request to open it.",
  },
  {
    term: "Rupee invoicing",
    body: "No USD billing, no FX spread, no NRB approval to pay for compute. Settle by eSewa, Khalti, bank transfer or a 30-day corporate invoice.",
  },
  {
    term: "Support in NPT",
    body: "Engineers on your clock. A run that dies at 02:00 NPT is answered from Kathmandu, not from a queue eleven time zones away.",
  },
  {
    term: "Himalayan hydro",
    body: "A grid that is overwhelmingly hydroelectric: near-zero carbon per GPU-hour, and a power price that is not indexed to a gas market on another continent.",
  },
];

/** The systems the chip graphic fans out to — the same names the portal uses. */
const CHIP_LABELS = [
  "data residency",
  "vcluster",
  "cilium policy",
  "npr invoicing",
  "metering",
  "support · npt",
  "audit log",
  "hydro grid",
];

const ARCHITECTURE: { title: string; body: string }[] = [
  {
    title: "vCluster isolation",
    body: "Every customer gets a virtual Kubernetes cluster with its own API server and control plane. Your namespaces, your CRDs, your RBAC — not a shared cluster with a namespace label.",
  },
  {
    title: "Cilium tenant networking",
    body: "eBPF-enforced policy between tenants, default-deny on regulated projects, and flow visibility down to the individual pod.",
  },
  {
    title: "Metering you can reconcile",
    body: "Every GPU-second and every token is a metered event. The number on the usage dashboard and the number on the invoice come from the same ledger.",
  },
  {
    title: "Append-only audit trail",
    body: "Hash-chained logs covering every control-plane action, exportable as evidence for your own compliance review.",
  },
];

export default function HomePage() {
  const live = GPU_SKUS.filter((s) => s.status === "available");
  const soon = GPU_SKUS.filter((s) => s.status === "coming-soon");

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════════════════
          The dot-terrain canvas fills the whole section: the brand ridgeline
          in motion. It is masked so the sky fades to Carbon at the top and
          the field softens under the headline column. */}
      <ScrollRail />

      <section id="start" data-rail="start" className="relative isolate overflow-hidden">
        {/* Writes --sp as the hero scrolls away: the copy, the terminal and
            the stats strip drift apart at different rates, and the terrain
            camera pitches down (see DotTerrain). */}
        <ScrollScrub mode="exit" />
        <div className="absolute inset-0 -z-10">
          <DotTerrain />
        </div>

        <div className="mx-auto max-w-page-xl px-5 pt-24 pb-16 md:px-10 md:pt-28 md:pb-20">
          <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="hero-copy">
              <Reveal>
                <Badge tone="hydro" dot>
                  np-ktm-1 · live in kathmandu
                </Badge>
              </Reveal>

              {/* The headline lands like a line in a terminal: decoded left to right
                  with a block cursor on the frontier. "online." is the one Hydro
                  figure in this cluster, and it glows once the status flips. */}
              <Reveal delay={70}>
                <h1 className="display mt-7 text-[clamp(2.35rem,5.2vw,4rem)]">
                  <DecodeText text="The valley is" delay={350} />
                  <br />
                  <DecodeText text="coming " delay={350 + 14 * 34} />
                  <span className="online-glow text-hydro">
                    <DecodeText text="online." delay={350 + 21 * 34} cursor />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-7 max-w-[54ch] text-md leading-relaxed text-ink-300">
                  Green-energy GPU compute, launched on Himalayan hydropower.
                </p>
                <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-ink-500">
                  NVIDIA H100 and H200 capacity by the second, inside Nepal.
                  Train, fine-tune and serve — and never move the data, or the
                  invoice, across a border.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Link href="/contact">
                    <Button
                      variant="primary"
                      size="lg"
                      iconRight={<Icon name="arrow-right" size={17} />}
                    >
                      Talk to sales
                    </Button>
                  </Link>
                  <Link href={docsHref("guides/quickstart")}>
                    <Button
                      variant="secondary"
                      size="lg"
                      mono
                      iconLeft={<Icon name="terminal" size={15} />}
                    >
                      read the quickstart
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
                  {[
                    "Billed in NPR",
                    "Data residency in Nepal",
                    "Support in NPT",
                    "H100 / H200",
                  ].map((chip) => (
                    <li
                      key={chip}
                      className="flex items-center gap-2 font-mono text-[11.5px] tracking-wide text-ink-500"
                    >
                      <Icon name="check" size={12} className="text-hydro" />
                      {chip}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* The terminal is pulled down and right so it breaks the grid
                and overlaps the stats strip below — depth from overlap rather
                than from another shadow. */}
            <div className="hero-term lg:translate-y-6">
            <Reveal kind="scale" delay={180}>
              <Terminal
                title="np-ktm-1.corevalley.ai"
                className="lg:justify-self-end"
                lines={[
                  {
                    prompt: "$",
                    text: "corevalley pods launch --gpu h200 --slice 2g.35gb \\",
                  },
                  { out: "        --image pytorch:2.5-cu124 --region np-ktm-1" },
                  { out: "→ matched np-ktm-1 · kathmandu · hydro grid" },
                  { out: "→ h200 mig 2g.35gb · 35 GB · vcluster cv-himal" },
                  { out: "→ data residency: nepal · egress: default-deny" },
                  { comment: "pod cv-9f3a21 running in 11s · NPR 132/hr" },
                  { prompt: "$", text: "" },
                ]}
              />
            </Reveal>
            </div>
          </div>

          {/* ── Stats ────────────────────────────────────────────────────
              Four figures, one of them accented. Numbers count up on entry
              but the server renders the final value, so this is still
              correct with JavaScript switched off. */}
          <Reveal delay={120}>
            <hr className="rule-fade mt-20" />
          </Reveal>

          <RevealGroup
            step={80}
            className="hero-stats grid grid-cols-2 gap-y-10 pt-12 md:grid-cols-4"
          >
            {[
              {
                value: <CountUp value={141} suffix=" GB" />,
                label: "HBM3e per H200",
                sub: "4.8 TB/s of bandwidth",
                accent: false,
              },
              {
                value: <CountUp value={100} suffix="%" />,
                label: "of data stays in Nepal",
                sub: "egress is default-deny",
                accent: true,
              },
              {
                value: "NPR",
                label: "billed locally",
                sub: "eSewa · Khalti · invoice",
                accent: false,
              },
              {
                value: <CountUp value={11} suffix="s" />,
                label: "cold start to running",
                sub: "measured on a 2g.35gb slice",
                accent: false,
              },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className={`nums font-mono text-[clamp(1.75rem,3.4vw,2.35rem)] leading-none font-medium tracking-tight ${
                    s.accent
                      ? "text-hydro [text-shadow:0_0_30px_rgba(74,222,128,0.28)]"
                      : "text-ink-100"
                  }`}
                >
                  {s.value}
                </div>
                <p className="cv-label mt-3">{s.label}</p>
                <p className="mt-2 text-[12.5px] text-ink-500">{s.sub}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════════ */}
      <SpecTicker />

      {/* ══ PLATFORM ══════════════════════════════════════════════════════
          A bento, not three equal columns: the two lead products get the wide
          cells, the two supporting ones get half-width. The asymmetry is the
          information — it says which products most customers start with. */}
      <section id="platform" data-rail="platform" className="relative py-20 md:py-28">
        <Horizon index="02" label="platform" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
            <div className="max-w-[54ch]">
              <Reveal>
                <p className="cv-label">The platform</p>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                  <WipeText text="Rent a slice. Rent a rack." />
                  <br />
                  <WipeText text="Same control plane." start={5} />
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-5 leading-relaxed text-ink-400">
                  Start on a shared H200 slice, graduate to whole cards, then
                  serve production traffic — without changing provider,
                  currency or jurisdiction on the way.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <Link
                  href="/products"
                  className="group mt-7 inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100"
                >
                  all products
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="transition-transform duration-normal ease-out group-hover:translate-x-1"
                  />
                </Link>
              </Reveal>
            </div>


          {/* The pinned story: the three racks stay put on the right while
              slice, card and rack scroll past on the left; each step turns
              the row and pulls its rack out. */}
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
                      <p className="mt-auto pt-8 font-mono text-[11px] tracking-wide text-ink-600">
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

      {/* ══ SOVEREIGNTY ═══════════════════════════════════════════════════
          The argument, set the way an engineering spec is set: a bracketed
          heading, a mono lead, a "+" list — and beside it the die with its
          traces fanning out to the systems the list names. */}
      <section id="sovereign" data-rail="sovereign" className="relative py-20 md:py-28">
        <Horizon index="03" label="why sovereign" />
        <div className="mx-auto grid max-w-page-xl gap-14 px-5 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="cv-label">Why sovereign</p>
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
              <div className="relative mt-8 pl-10">
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-auto left-0 h-8 w-8 border-b border-l border-line-strong"
                />
                <p className="font-mono text-[13.5px] leading-[1.85] text-ink-300">
                  Every path a byte can take — into a GPU, out to an invoice,
                  up to a support engineer — stays inside Nepal. Not because a
                  policy says so, but because the hardware, the meter and the
                  people are all in Kathmandu:
                </p>
              </div>
            </Reveal>

            <ul className="mt-8 flex flex-col gap-5 pl-10">
              {SOVEREIGN.map((s, i) => (
                <Reveal as="li" key={s.term} delay={180 + i * 80}>
                  <div className="group flex gap-4 font-mono text-[13.5px] leading-[1.85]">
                    <span
                      aria-hidden="true"
                      className="mt-px shrink-0 text-hydro transition-transform duration-normal ease-out group-hover:rotate-90"
                    >
                      +
                    </span>
                    <p className="text-ink-400">
                      <span className="font-semibold text-ink-100">{s.term}:</span>{" "}
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={560}>
              <Link
                href="/company"
                className="group mt-10 ml-10 inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100"
              >
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
            <p className="mt-3 text-center font-mono text-[10.5px] tracking-label text-ink-600 uppercase">
              one h200 · everything it touches stays in np-ktm-1
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ LATENCY (the fabric) — disabled via SHOW_FABRIC ═══════════════ */}
      {SHOW_FABRIC ? (
      <section id="latency" data-rail="latency" className="relative py-20 md:py-28">
        <Horizon index={SEC.fabric} label="the fabric" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[60ch]">
            <Reveal>
              <p className="cv-label">The fabric</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="Every millisecond, measured from Kathmandu." />
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 leading-relaxed text-ink-400">
                Serving a model from inside Nepal is not a compliance checkbox.
                It is the difference between a 14&nbsp;ms hop and a
                285&nbsp;ms round trip through someone else&rsquo;s
                jurisdiction. Switch modes to see it in tokens per second.
              </p>
            </Reveal>
          </div>

          <Reveal kind="scale" delay={140}>
            <SovereignMesh className="mt-14" />
          </Reveal>
        </div>
      </section>
      ) : null}

      {/* ══ FLEET ═════════════════════════════════════════════════════════
          The rack on the left is the thing itself; the cards on the right
          are its spec sheet. */}
      <section id="hardware" data-rail="hardware" className="relative isolate py-20 md:py-28">
        <Horizon index={SEC.hardware} label="hardware" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_55%_at_50%_50%,rgb(232_236_239_/_0.02),transparent_72%)]"
        />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[54ch]">
            <Reveal>
              <p className="cv-label">Hardware</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="The fleet, rack by rack." />
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 leading-relaxed text-ink-400">
                Two accelerators today, two more on the roadmap. Every card
                sits in a rack an engineer can walk to, on a feed that comes
                off a river.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal kind="left" delay={100}>
              <RackGraphic className="h-full" />
            </Reveal>

            <SpotlightGroup>
              <RevealGroup kind="tilt" step={100} className="grid gap-4">
                {live.map((sku) => (
                  <Card
                    key={sku.id}
                    padding={28}
                    accent
                    className="cv-spotlight h-full"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[1.4rem] font-semibold tracking-tight text-ink-100">
                        {sku.name}
                      </h3>
                      <p className="font-mono text-xs text-ink-500">
                        {sku.architecture} · {sku.memoryGb} GB {sku.memoryType}
                      </p>
                    </div>

                    <dl className="mt-6 grid grid-cols-3 gap-y-4 border-t border-line-subtle pt-5">
                      <div>
                        <dt className="cv-label text-[10px]">Bandwidth</dt>
                        <dd className="nums mt-1.5 font-mono text-sm text-ink-200">
                          {sku.bandwidth}
                        </dd>
                      </div>
                      <div>
                        <dt className="cv-label text-[10px]">FP8</dt>
                        <dd className="nums mt-1.5 font-mono text-sm text-ink-200">
                          {sku.fp8Tflops ? `${sku.fp8Tflops.toLocaleString("en-US")} TFLOPS` : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="cv-label text-[10px]">Slicing</dt>
                        <dd className="mt-1.5 font-mono text-sm text-ink-200">
                          {sku.migCapable ? "mig + hami" : "whole card"}
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-5 text-sm leading-relaxed text-ink-400">
                      {sku.bestFor}.
                    </p>
                  </Card>
                ))}
              </RevealGroup>
            </SpotlightGroup>
          </div>

          {soon.length ? (
            <RevealGroup
              step={60}
              start={120}
              className="mt-4 grid gap-4 sm:grid-cols-3"
            >
              {soon.map((sku) => (
                <div
                  key={sku.id}
                  className="flex h-full items-center justify-between gap-3 rounded-lg border border-dashed border-line px-5 py-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-ink-300">
                      {sku.name}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] text-ink-600">
                      {sku.memoryGb} GB {sku.memoryType} · {sku.architecture}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] tracking-label text-ink-600 uppercase">
                    soon
                  </span>
                </div>
              ))}
            </RevealGroup>
          ) : null}
        </div>
      </section>

      {/* ══ ARCHITECTURE ══════════════════════════════════════════════════
          An animated trace runs down the left of the list — one vertical
          spine tying four items together, a literal picture of a control
          plane. */}
      <section id="architecture" data-rail="architecture" className="relative py-20 md:py-28">
        {/* --sp fills the trace spine as the section passes through view. */}
        <ScrollScrub />
        <Horizon index={SEC.architecture} label="architecture" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="max-w-[58ch]">
            <Reveal>
              <p className="cv-label">Architecture</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                <WipeText text="Tenancy you can inspect." />
                <br />
                <WipeText text="Meters you can reconcile." start={4} />
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 leading-relaxed text-ink-400">
                The control plane is Kubernetes underneath, but you never
                operate it. What you get is a tenant boundary, a meter and a
                log — and all three are inspectable from the portal.
              </p>
            </Reveal>
          </div>

          {/* The tenant boundary, drawn: pods on both sides of the Cilium
              line, packets that arrive inside a tenant and packets that are
              stopped at the line. The pointer sends its own. */}
          <Reveal kind="right" delay={160}>
            <PolicyGrid />
          </Reveal>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-0 md:grid-cols-[auto_1fr]">
            <div className="trace hidden w-px md:block" aria-hidden="true" />

            <SpotlightGroup>
              <RevealGroup kind="tilt" step={90} className="grid gap-4 md:grid-cols-2">
                {ARCHITECTURE.map((a, i) => (
                  <Card key={a.title} padding={26} className="cv-spotlight h-full">
                    <p className="cv-label text-[10px] text-hydro">
                      0{i + 1}
                    </p>
                    <h3 className="mt-3 text-base font-semibold tracking-tight text-ink-100">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400">
                      {a.body}
                    </p>
                  </Card>
                ))}
              </RevealGroup>
            </SpotlightGroup>
          </div>

          <Reveal delay={120}>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 rounded-lg border border-line bg-carbon-800/60 px-6 py-5">
              <span className="cv-label text-[10px]">Enterprise readiness</span>
              {[
                "SOC 2 Type I framework alignment",
                "Automated TLS",
                "Private tenant networking",
                "Append-only audit logs",
              ].map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 font-mono text-[11.5px] text-ink-400"
                >
                  <Icon name="check" size={12} className="text-hydro" />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════
          One glass slab, a beam of Hydro running its border, the floor
          moving through the pane, and a capacity line that decodes as the
          slab arrives — the page ends on something that is visibly alive. */}
      <section id="contact" data-rail="contact" className="relative overflow-hidden py-20 md:py-28">
        <Horizon index={SEC.contact} label="contact" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <Reveal kind="scale">
            {/* No slab: the copy and the console sit straight on the floor. */}
            <div className="relative text-center">

              <p className="relative font-mono text-[11.5px] tracking-label text-hydro uppercase">
                <DecodeText text="capacity check · np-ktm-1 · h200 · available now" speed={22} />
              </p>
              <h2 className="display relative mx-auto mt-5 max-w-[20ch] text-[clamp(2rem,4.4vw,3.2rem)]">
                <WipeText text="Your next training run, on Himalayan hydro." />
              </h2>
              <p className="relative mx-auto mt-6 max-w-[52ch] text-md leading-relaxed text-ink-400">
                Send the model, the dataset size and the GPU-hours you expect.
                You get a capacity plan and a rupee price back — not a
                discovery call.
              </p>
              {/* The quote lock: set GPU, count and hours on three tumblers
                  and the rupee price is already there. */}
              <Reveal delay={120} className="relative mt-10">
                <QuoteLock />
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
