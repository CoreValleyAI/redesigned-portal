import Link from "next/link";
import { Badge, Button, Card, Icon, Terminal } from "@/components/ui";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { SovereignMesh } from "@/components/marketing/sovereign-mesh";
import { SpotlightGroup } from "@/components/marketing/spotlight";
import { SpecTicker } from "@/components/marketing/spec-ticker";
import { RidgelineBand } from "@/components/marketing/ridgeline-band";
import { CountUp } from "@/components/fx/count-up";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { GPU_SKUS } from "@/lib/catalog";
import type { IconName } from "@/components/ui";

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

const PRODUCTS: {
  icon: IconName;
  title: string;
  href: string;
  body: string;
  meta: string;
  /** The two lead products take the wide cells in the bento. */
  wide?: boolean;
}[] = [
  {
    icon: "slice",
    title: "GPU pods",
    href: "/products/gpu-pods",
    body: "Whole H100 and H200 cards, or fractional slices down to a fourteenth of a card through MIG and HAMi. Billed by the second, from the moment the container is running.",
    meta: "mig · hami · per-second billing",
    wide: true,
  },
  {
    icon: "broadcast",
    title: "Model endpoints",
    href: "/products/model-endpoints",
    body: "Pay-per-token access to open-weight models behind vLLM and a LiteLLM gateway. Drop-in OpenAI-compatible, served from inside Nepal.",
    meta: "vllm · litellm · per-token",
    wide: true,
  },
  {
    icon: "notebook",
    title: "JupyterHub",
    href: "/products/jupyterhub",
    body: "Multi-user research notebooks with GPU spawner profiles, per-user quotas and idle culling. Built for university labs.",
    meta: "multi-user · idle culling",
  },
  {
    icon: "node",
    title: "Dedicated & bare metal",
    href: "/products/dedicated",
    body: "Whole nodes with no neighbours. Reserved terms, IPMI access, private tenant networking.",
    meta: "bare metal · reserved terms",
  },
];

const SOVEREIGN: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Your data does not leave the country",
    body: "Datasets, checkpoints and inference requests stay inside Nepal for their whole lifecycle. That is a hard requirement for banks, hospitals and government work, and it is the default here rather than a paid add-on.",
  },
  {
    n: "02",
    title: "Invoices arrive in rupees",
    body: "No USD billing, no FX spread, no NRB approval to pay your compute bill. Settle by eSewa, Khalti, bank transfer or corporate invoice on 30-day terms.",
  },
  {
    n: "03",
    title: "Support answers in Nepal time",
    body: "Engineers in Kathmandu, on the same clock as you. When a training run dies at 02:00 NPT the person who picks up is eleven time zones closer than the alternative.",
  },
  {
    n: "04",
    title: "Racks run on Himalayan hydro",
    body: "Nepal's grid is overwhelmingly hydroelectric, which means near-zero carbon per GPU-hour and a power cost that is not indexed to a gas market on the other side of the world.",
  },
];

const ARCHITECTURE: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "cluster",
    title: "vCluster isolation",
    body: "Every customer gets a virtual Kubernetes cluster with its own API server and control plane. Your namespaces, your CRDs, your RBAC — not a shared cluster with a namespace label.",
  },
  {
    icon: "certificate",
    title: "Cilium tenant networking",
    body: "eBPF-enforced policy between tenants, default-deny on regulated projects, and flow visibility down to the individual pod.",
  },
  {
    icon: "chart",
    title: "Metering you can reconcile",
    body: "Every GPU-second and every token is a metered event. The number on the usage dashboard and the number on the invoice come from the same ledger.",
  },
  {
    icon: "audit",
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
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <DotTerrain />
        </div>

        <div className="mx-auto max-w-page-xl px-5 pt-24 pb-16 md:px-10 md:pt-28 md:pb-20">
          <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <Reveal>
                <Badge tone="hydro" dot>
                  np-ktm-1 · live in kathmandu
                </Badge>
              </Reveal>

              {/* The qualifier line is the one Hydro figure in this cluster — the
                  brand rule is one hero figure per cluster, so nothing else
                  in the hero copy takes colour. */}
              <Reveal delay={70}>
                <h1 className="display mt-7 text-[clamp(2.35rem,5.2vw,4rem)]">
                  Sovereign AI compute,
                  <br />
                  <span className="text-hydro">hosted in Kathmandu.</span>
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-7 max-w-[54ch] text-md leading-relaxed text-ink-400">
                  NVIDIA H100 and H200 capacity you can rent by the second,
                  inside Nepal. Train a model, fine-tune it, and serve it from
                  production — without your data or your invoices ever leaving
                  the country.
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
                  <Link href="/docs/quickstart">
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
            <Reveal kind="scale" delay={180} className="lg:translate-y-6">
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

          {/* ── Stats ────────────────────────────────────────────────────
              Four figures, one of them accented. Numbers count up on entry
              but the server renders the final value, so this is still
              correct with JavaScript switched off. */}
          <Reveal delay={120}>
            <hr className="rule-fade mt-20" />
          </Reveal>

          <RevealGroup
            step={80}
            className="grid grid-cols-2 gap-y-10 pt-12 md:grid-cols-4"
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

      {/* ══ TICKER ════════════════════════════════════════════════════════
          A continuous strip of fleet and platform facts. It gives the page a
          horizontal beat between two tall stacked sections, and it is the
          only element on the site that moves without being asked to. */}
      <SpecTicker />

      {/* ══ PLATFORM ══════════════════════════════════════════════════════
          A bento, not three equal columns: the two lead products get the wide
          cells, the two supporting ones get half-width. The asymmetry is the
          information — it says which products most customers start with. */}
      <section className="relative py-20 md:py-28">
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[54ch]">
              <Reveal>
                <p className="cv-label">The platform</p>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                  Four ways to get compute.
                  <br />
                  One control plane.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-5 leading-relaxed text-ink-400">
                  Start on a shared slice, move to whole cards, then serve
                  production traffic — without changing provider, currency or
                  jurisdiction along the way.
                </p>
              </Reveal>
            </div>
            <Reveal delay={160}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100"
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

          <SpotlightGroup className="mt-14">
            <RevealGroup
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
                      <span className="inline-flex w-fit rounded-lg border border-line bg-carbon-600 p-2.5">
                        <Icon
                          name={p.icon}
                          size={19}
                          weight="duotone"
                          className="text-ink-100"
                        />
                      </span>
                      <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink-100">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 max-w-[46ch] text-sm leading-relaxed text-ink-400">
                        {p.body}
                      </p>
                      {/* mt-auto pins the meta row to the bottom of every
                          card, so across a row of unequal copy lengths the
                          footers still form one clean line. */}
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
          Sticky heading on the left, numbered argument on the right. This
          replaces the previous four-up card row: these are four paragraphs of
          reasoning, and reasoning does not belong in equal-height boxes. */}
      <section className="relative py-20 md:py-28">
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        <div className="mx-auto grid max-w-page-xl gap-14 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="cv-label">Why sovereign</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                Foreign clouds were not built for Nepali teams.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 max-w-[42ch] leading-relaxed text-ink-400">
                Four constraints that a region in Singapore or Mumbai cannot
                solve for you, no matter how large it is.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <Link
                href="/company"
                className="group mt-8 inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100"
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

          <ol className="flex flex-col">
            {SOVEREIGN.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80} className="group">
                <div className="flex gap-6 border-t border-line-subtle py-9 md:gap-10">
                  <span className="nums shrink-0 pt-1 font-mono text-[12px] tracking-wide text-ink-600 transition-colors duration-slow group-hover:text-hydro">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[1.15rem] font-semibold tracking-tight text-ink-100">
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-[58ch] leading-relaxed text-ink-400">
                      {s.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ LATENCY ═══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28">
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[60ch]">
            <Reveal>
              <p className="cv-label">The fabric</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                Every millisecond, measured from Kathmandu.
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

      {/* ══ FLEET ═════════════════════════════════════════════════════════ */}
      <section className="relative isolate py-20 md:py-28">
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        {/* isolate on the section: see components/marketing/page-hero.tsx —
            without it this -z-10 wash lands behind the fixed ambient field. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 55% at 50% 50%, rgb(232 236 239 / 0.02), transparent 72%)",
          }}
        />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[54ch]">
            <Reveal>
              <p className="cv-label">Hardware</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                The fleet, rack by rack.
              </h2>
            </Reveal>
          </div>

          <SpotlightGroup className="mt-14">
            <RevealGroup step={100} className="grid gap-4 md:grid-cols-2">
              {live.map((sku) => (
                <Card
                  key={sku.id}
                  padding={30}
                  accent
                  className="cv-spotlight h-full"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[1.4rem] font-semibold tracking-tight text-ink-100">
                        {sku.name}
                      </h3>
                      <p className="mt-1.5 font-mono text-xs text-ink-500">
                        {sku.architecture} · {sku.memoryGb} GB {sku.memoryType}
                      </p>
                    </div>
                    <Badge tone="success" dot>
                      available
                    </Badge>
                  </div>

                  <dl className="mt-7 grid grid-cols-3 gap-y-4 border-t border-line-subtle pt-6">
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

                  <p className="mt-6 text-sm leading-relaxed text-ink-400">
                    {sku.bestFor}.
                  </p>
                </Card>
              ))}
            </RevealGroup>
          </SpotlightGroup>

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
          spine tying four items together, which is both a nicer structure
          than a 2x2 card grid and a literal picture of a control plane. */}
      <section className="relative py-20 md:py-28">
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <div className="max-w-[58ch]">
            <Reveal>
              <p className="cv-label">Architecture</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                Isolation and metering you can audit.
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

          <div className="mt-14 grid gap-x-10 gap-y-0 md:grid-cols-[auto_1fr]">
            {/* The spine. Hidden on small screens, where a 4px column of
                decoration costs more width than it earns. */}
            <div className="trace hidden w-px md:block" aria-hidden="true" />

            <RevealGroup step={90} className="grid gap-4 md:grid-cols-2">
              {ARCHITECTURE.map((a) => (
                <Card key={a.title} padding={26} className="h-full">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex shrink-0 rounded-lg border border-line bg-carbon-600 p-2.5">
                      <Icon name={a.icon} size={18} className="text-ink-200" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-ink-100">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400">
                        {a.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </RevealGroup>
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
          One glass slab, centred, over the dot-matrix ridgeline — the
          brand's signature graphic, refracted through the pane. */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <RidgelineBand height={260} opacity={0.35} />
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
        <div className="mx-auto max-w-page-xl px-5 md:px-10">
          <Reveal kind="scale">
            <div className="lg lg-refract relative overflow-hidden rounded-lg px-6 py-20 text-center md:px-16 md:py-24">

              {/* A pool of light behind the headline, centred on the slab
                  rather than on the cursor — this one is the focal point and
                  should not move. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-1/3 h-[130%]"
                style={{
                  background:
                    "radial-gradient(45% 60% at 50% 40%, rgb(74 222 128 / 0.07), transparent 70%)",
                }}
              />

              <h2 className="display relative mx-auto max-w-[18ch] text-[clamp(2rem,4.4vw,3.2rem)]">
                Run your next training job from Kathmandu.
              </h2>
              <p className="relative mx-auto mt-6 max-w-[52ch] text-md leading-relaxed text-ink-400">
                Send us your models, your dataset size and the GPU hours you
                expect. You get back a capacity plan and a rupee price, not a
                discovery call.
              </p>
              <div className="relative mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight={<Icon name="arrow-right" size={17} />}
                  >
                    Talk to sales
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">
                    See pricing
                  </Button>
                </Link>
              </div>
              <p className="relative mt-8 font-mono text-[11.5px] tracking-wide text-ink-600">
                typical reply within one business day · NPT 09:00–18:00
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
