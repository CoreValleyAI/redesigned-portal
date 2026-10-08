import Link from "next/link";
import { ButtonLink, Icon, type IconName } from "@/components/ui";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { SpotlightGroup } from "@/components/marketing/spotlight";
import { GpuCompare } from "@/components/marketing/gpu-compare";
import { QuoteLock } from "@/components/marketing/quote-lock";
import { CountUp } from "@/components/fx/count-up";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import {
  AVAILABLE_GPUS,
  EARLY_ACCESS,
  FACTS,
  SOON_GPUS,
} from "@/lib/availability";
import { PRODUCTS } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "CoreValley — Nepal's GPU cloud: NVIDIA H200 in Kathmandu",
  absoluteTitle: true,
  description:
    "Nepal's GPU cloud: NVIDIA H200s available now for enterprise early access. Hydro-powered, under 5 ms latency in Kathmandu, billed in NPR, data kept in Nepal.",
  path: "/",
});

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* ── Content ───────────────────────────────────────────────────────────────
   Every claim is a number, a component name, or a thing a customer can
   check. Status, latency and power all come from lib/availability.ts. */

const GPU = AVAILABLE_GPUS[0]!;

const HERO_STATS = [
  {
    value: <CountUp value={GPU.memoryGb} suffix=" GB" />,
    label: "of memory on every H200 — room for big models on one card",
  },
  { value: FACTS.latency, label: `${FACTS.latencyLabel}, served in-country` },
  {
    value: <CountUp value={100} suffix="%" />,
    label: "of your data stored and processed in Nepal",
  },
];

const SOVEREIGN: { icon: IconName; term: string; sub: string }[] = [
  {
    icon: "lock",
    term: "Data stays here",
    sub: "Stored and processed in Kathmandu",
  },
  {
    icon: "cost",
    term: "Pay in rupees",
    sub: "eSewa, Khalti, bank or invoice",
  },
  {
    icon: "team",
    term: "Help in Nepal time",
    sub: "The people who run the GPUs",
  },
  {
    icon: "leaf",
    term: "Hydro-powered",
    sub: "Low-carbon, not tied to gas prices",
  },
  {
    icon: "gauge",
    term: `${FACTS.latency} latency`,
    sub: "Apps answer without a trip abroad",
  },
  { icon: "audit", term: "Audit log", sub: "Every action, kept for review" },
];

const STEPS = [
  {
    n: "01",
    title: "Start on a slice.",
    body: "Rent a hardware slice of an H200 — 35 GB of its memory — billed by the second. Fine-tune a 7B model tonight, shut it down by morning.",
    cmd: "corevalley pods launch --gpu h200 --slice 2g.35gb",
    out: "pod ktm-7f2c · slice 2g.35gb · running",
  },
  {
    n: "02",
    title: "Graduate to whole cards.",
    body: "Same files, same code, same API key — on a full H200 with all 141 GB, then on four or eight when the job outgrows one.",
    cmd: "corevalley pods launch --gpu h200 --count 4",
    out: "pod ktm-91ae · 4 × h200 · 564 GB · running",
  },
  {
    n: "03",
    title: "Reserve the rack.",
    body: "Dedicated H200 servers that nobody else touches, reserved by the month — with the same meter and audit log.",
    cmd: "corevalley dedicated reserve --nodes 4 --term 1m",
    out: "reservation r-04 · 4 nodes · confirmed",
  },
];

/* Free Unsplash photos, greyscaled and cropped at download
   (public/images/home). */
const PRODUCT_PHOTOS: Record<string, { src: string; position?: string }> = {
  "gpu-pods": { src: "gpu-pair.webp" }, // Nana Dua, unsplash.com/photos/nqCEPrvnLKQ
  jupyterhub: { src: "classroom.webp", position: "65% 40%" }, // Poddar Group of Institutions, unsplash.com/photos/ereEoYDIl20
  "model-endpoints": { src: "fiber-switch.webp" }, // Lightsaber Collection, unsplash.com/photos/T-IN5o3kxyA
  dedicated: { src: "server-racks.webp", position: "35% 50%" }, // Taylor Vick, unsplash.com/photos/M5tzZtFCOfs
};

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

const textLink =
  "group inline-flex items-center gap-2 text-[14px] font-medium text-ink-400 transition-colors duration-300 hover:text-ink-100";

export default function HomePage() {
  const soon = SOON_GPUS.filter((s) => !s.id.startsWith("rtx-pro-6000"));

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section id="start" className="shell">
        <div className="cv-dark surface-dark grain flex min-h-[92vh] flex-col">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute inset-0 opacity-60">
              <DotTerrain theme="dark" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 to-zinc-950/90" />
            <p className="absolute inset-x-0 top-[14%] overflow-hidden text-center text-[22vw] leading-none font-bold tracking-[-0.06em] whitespace-nowrap text-white/[0.03] blur-[3px] select-none min-[1600px]:text-[352px]">
              VALLEY
            </p>
          </div>

          <div className="grid flex-1 items-end gap-12 px-6 pt-36 pb-8 md:px-14 md:pt-44 md:pb-14 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div className="max-w-[56rem]">
              <Reveal>
                <h1 className="display text-[clamp(3.25rem,8vw,8rem)] !leading-[0.95] text-white">
                  The valley
                  <br />
                  is <span className="text-hydro">online.</span>
                </h1>
              </Reveal>

              <Reveal delay={100}>
                <p className="mt-7 max-w-[44ch] text-[clamp(1.0625rem,1.4vw,1.3rem)] leading-relaxed font-light text-white/65">
                  Nepal&rsquo;s own GPU cloud: NVIDIA H200s, rented by the
                  second from a hydro-powered Kathmandu datacenter. Pay in
                  rupees and keep every byte of your data in the country.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href="/contact"
                    size="lg"
                    iconRight={<Icon name="arrow-right" size={17} />}
                  >
                    Get early access
                  </ButtonLink>
                  <ButtonLink href="#how" variant="secondary" size="lg">
                    How it works
                  </ButtonLink>
                </div>
                <p className="mt-4 text-[13px] text-white/45">
                  We reply {EARLY_ACCESS.replyTime} with a capacity plan and a
                  rupee quote.
                </p>
              </Reveal>
            </div>

            {/* Glass stat cards, stacked on the right. */}
            <RevealGroup
              step={110}
              start={300}
              className="grid gap-3 sm:grid-cols-3 lg:w-72 lg:grid-cols-1"
            >
              {HERO_STATS.map((s) => (
                <div key={s.label} className="glass rounded-3xl p-5">
                  <div className="nums text-3xl font-semibold tracking-[-0.04em] text-white">
                    {s.value}
                  </div>
                  <p className="mt-2 text-sm leading-snug text-white/60">
                    {s.label}
                  </p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section id="sovereign" className="shell">
        <div className="grid gap-14 px-6 py-24 md:px-14 md:py-36 lg:grid-cols-2 lg:gap-20">
          <div className="self-start lg:sticky lg:top-32">
            <Reveal>
              <p className="label">Why CoreValley</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display mt-5 text-4xl text-zinc-900 md:text-5xl">
                Sovereign by construction, not by contract.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed font-light text-zinc-500">
                Your data, your money and your support all stay in Nepal — not
                because a contract says so, but because the GPUs, the billing
                and the people are all in Kathmandu.
              </p>
            </Reveal>

            <RevealGroup
              step={70}
              start={200}
              className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            >
              {SOVEREIGN.map((s) => (
                <div key={s.term}>
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white text-zinc-900 shadow-sm">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <p className="mt-4 text-[15px] font-semibold tracking-tight text-zinc-900">
                    {s.term}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-snug text-zinc-500">
                    {s.sub}
                  </p>
                </div>
              ))}
            </RevealGroup>

            <Reveal delay={400}>
              <Link href="/company" className={`${textLink} mt-12`}>
                Why we built this
                <Icon
                  name="arrow-right"
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
          </div>

          <Reveal kind="scale" delay={150}>
            {/* Phones stack the readout under the photo; from lg it floats on it. */}
            <figure className="group cv-dark relative overflow-hidden rounded-[2.5rem] bg-zinc-950 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)] lg:aspect-[4/5]">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
                {/* Đào Hiếu, unsplash.com/photos/3UAiwOgoSnE (Unsplash licence), greyscaled */}
                <img
                  src={`${BASE}/images/home/gpu-closeup.webp`}
                  alt="Close-up of a graphics card's cooling fan"
                  width={1200}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                  className="zoom-media absolute inset-0 size-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/75"
                />
              </div>

              <figcaption className="relative mx-3 -mt-16 mb-3 rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl sm:mx-5 sm:-mt-20 sm:mb-5 sm:p-6 lg:absolute lg:inset-x-6 lg:bottom-6 lg:m-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[15px] font-semibold tracking-tight text-white">
                    {GPU.name}
                  </p>
                  <p className="flex items-center gap-2 text-[12.5px] text-white/60">
                    <span aria-hidden="true" className="h-px w-5 bg-hydro" />
                    Available now
                  </p>
                </div>
                <p className="mt-4 flex items-baseline gap-2.5">
                  <span className="nums text-[2.75rem] leading-none font-semibold tracking-[-0.05em] text-white">
                    {GPU.memoryGb}
                  </span>
                  <span className="text-[15px] text-white/60">
                    GB {GPU.memoryType} on one card
                  </span>
                </p>
                <dl className="mt-5 divide-y divide-white/10 border-t border-white/10 text-[13.5px]">
                  {[
                    ["Memory bandwidth", GPU.bandwidth],
                    ["Runs in", "Kathmandu, Nepal"],
                    ["Billed", "Per second, in NPR"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="text-white/55">{k}</dt>
                      <dd className="nums font-medium text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ══ PLATFORM — dark productivity block ════════════════════════════ */}
      <section id="platform" className="shell">
        <div className="cv-dark surface-zinc grain px-6 py-24 md:px-14 md:py-32">
          <div
            aria-hidden="true"
            className="lineart pointer-events-none absolute inset-0 -z-10"
          />

          <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div>
              <Reveal>
                <p className="label !text-white/50">The platform</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="display mt-5 text-4xl text-white md:text-5xl">
                  Rent a slice. Rent a rack.{" "}
                  <span className="text-white/45">Never switch clouds.</span>
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed font-light text-white/60">
                  One account, one rupee invoice and one country the whole way —
                  from a slice of an H200 to dedicated servers.
                </p>
              </Reveal>

              <RevealGroup step={110} start={200} className="mt-10 grid gap-3">
                {STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
                  >
                    <span className="nums flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm font-semibold text-hydro">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/55">
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </RevealGroup>

              <Reveal delay={300}>
                <div className="mt-10">
                  <ButtonLink
                    href="/platform"
                    size="lg"
                    iconRight={<Icon name="arrow-right" size={17} />}
                  >
                    Explore the platform
                  </ButtonLink>
                </div>
              </Reveal>
            </div>

            {/* The mock console, turned three degrees toward the reader. */}
            <Reveal kind="scale" delay={200} className="[perspective:2000px]">
              <div className="relative mx-auto max-w-[36rem] [transform:rotateY(-8deg)_rotateX(4deg)_rotate(3deg)]">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-[0_60px_120px_-30px_rgb(0_0_0/0.8)]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="size-2.5 rounded-full bg-white/15" />
                    <span className="ml-3 text-[12px] font-medium text-white/40">
                      corevalley — {FACTS.region}
                    </span>
                  </div>
                  <div className="space-y-3 p-5 md:p-6">
                    {STEPS.map((s) => (
                      <div key={s.n} className="glass rounded-2xl p-4">
                        <p className="font-code text-[12.5px] leading-relaxed break-all text-white/85">
                          <span className="text-hydro">$</span> {s.cmd}
                        </p>
                        <p className="font-code mt-1.5 text-[11.5px] text-white/40">
                          <span className="text-emerald-300/80">✓</span> {s.out}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                      <span className="text-[12px] text-white/50">Meter</span>
                      <span className="nums font-code text-[12.5px] text-white">
                        NPR · billed per second
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ PRODUCTS — bento ══════════════════════════════════════════════ */}
      <section id="products" className="shell">
        <div className="px-6 py-24 md:px-14 md:py-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[40rem]">
              <Reveal>
                <p className="label">Products</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="display mt-5 text-4xl text-zinc-900 md:text-5xl">
                  Four ways in. One H200 fleet.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <Link href="/pricing" className={textLink}>
                See pricing
                <Icon
                  name="arrow-right"
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => {
              const photo = PRODUCT_PHOTOS[p.slug];
              return (
                <Reveal key={p.slug} delay={i * 90} className="min-w-0">
                  <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-zinc-100 bg-white transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.25)]">
                    <div className="relative h-56 overflow-hidden bg-zinc-900">
                      {photo ? (
                        <img
                          src={`${BASE}/images/home/${photo.src}`}
                          alt=""
                          width={1200}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="zoom-media absolute inset-0 size-full object-cover"
                          style={
                            photo.position
                              ? { objectPosition: photo.position }
                              : undefined
                          }
                        />
                      ) : null}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/15 to-black/85"
                      />
                      <h3 className="absolute right-6 bottom-5 left-6 text-2xl font-semibold tracking-[-0.04em] text-white">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[15px] leading-snug font-medium tracking-tight text-zinc-900">
                        {p.tagline}
                      </p>
                      <ul className="mt-5 space-y-2.5">
                        {p.features.slice(0, 3).map((f) => (
                          <li
                            key={f.title}
                            className="flex items-center gap-2.5 text-[13.5px] text-zinc-600"
                          >
                            <Icon
                              name="check"
                              size={14}
                              className="shrink-0 text-hydro"
                            />
                            {f.title}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto pt-7">
                        <ButtonLink
                          href={`/products/${p.slug}`}
                          fullWidth
                          aria-label={`Explore ${p.name}`}
                          className="justify-between hover:scale-[1.02]"
                          iconRight={<Icon name="arrow-right" size={15} />}
                        >
                          Explore
                        </ButtonLink>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}

            <Reveal
              delay={PRODUCTS.length * 90}
              className="min-w-0 md:col-span-2"
            >
              <article className="cv-dark surface-dark grain flex h-full min-h-[22rem] flex-col justify-between !rounded-[2rem] p-8 md:p-10">
                <div>
                  <p className="label !text-white/50">Early access</p>
                  <h3 className="display mt-4 max-w-[18ch] text-3xl text-white md:text-4xl">
                    H200s are available now for enterprises.
                  </h3>
                  <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-white/55">
                    More GPUs, and access for more teams, are coming soon. Tell
                    us what you want to run.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href="/contact"
                    size="lg"
                    iconRight={<Icon name="arrow-right" size={17} />}
                  >
                    Get early access
                  </ButtonLink>
                  <span className="text-[13px] text-white/45">
                    We reply {EARLY_ACCESS.replyTime}.
                  </span>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ HARDWARE ══════════════════════════════════════════════════════ */}
      <section id="hardware" className="shell">
        <div className="rounded-section border border-zinc-200/70 bg-white px-6 py-24 md:px-14 md:py-32">
          <div className="max-w-[44rem]">
            <Reveal>
              <p className="label">Hardware</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display mt-5 text-4xl text-zinc-900 md:text-5xl">
                The H200 today.{" "}
                <span className="text-zinc-400">Blackwell next.</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-[1.0625rem] leading-relaxed font-light text-zinc-500">
                <span className="font-medium text-zinc-900">
                  Available now:
                </span>{" "}
                the NVIDIA H200 — 141 GB on one card, built for training and
                serving the largest models.{" "}
                <span className="font-medium text-zinc-900">Coming soon:</span>{" "}
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
                <p className="label mt-12">Also coming soon</p>
              </Reveal>
              <RevealGroup
                step={60}
                start={120}
                className={`mt-4 grid gap-3 ${soon.length > 1 ? "sm:grid-cols-2" : "max-w-[30rem]"}`}
              >
                {soon.map((sku) => (
                  <div
                    key={sku.id}
                    className="flex h-full items-center justify-between gap-3 rounded-2xl border border-dashed border-zinc-300 px-5 py-4"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        {sku.name}
                      </h3>
                      <p className="mt-1 text-[12px] text-zinc-500">
                        {sku.memoryGb} GB {sku.memoryType} · {sku.architecture}
                      </p>
                    </div>
                    <span className="label shrink-0">Coming soon</span>
                  </div>
                ))}
              </RevealGroup>
            </>
          ) : null}
        </div>
      </section>

      {/* ══ HOW + QUOTE ═══════════════════════════════════════════════════ */}
      <section id="contact" className="shell mt-3">
        <div className="cv-dark surface-dark grain px-6 py-24 md:px-14 md:py-32">
          <div className="mx-auto max-w-[48rem] text-center">
            <Reveal>
              <p className="label !text-white/50">How early access works</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display mt-5 text-4xl text-white md:text-6xl">
                From your workload to a firm quote in one working day.
              </h2>
            </Reveal>
          </div>

          <RevealGroup
            id="how"
            step={90}
            start={100}
            className="mx-auto mt-14 grid max-w-[72rem] scroll-mt-28 gap-3 md:grid-cols-3"
          >
            {HOW.map((s, i) => (
              <div
                key={s.title}
                className="glass flex h-full flex-col rounded-3xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="nums text-3xl font-semibold tracking-[-0.04em] text-white">
                    0{i + 1}
                  </span>
                  <span className="label !text-hydro">{s.when}</span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">
                  {s.body}
                </p>
              </div>
            ))}
          </RevealGroup>

          <Reveal delay={120} className="relative mx-auto mt-10 max-w-[72rem]">
            <QuoteLock />
          </Reveal>
        </div>
      </section>
    </>
  );
}
