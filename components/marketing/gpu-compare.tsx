"use client";

/**
 * H200 vs RTX PRO 6000 Blackwell, side by side.
 *
 * The two share little beyond MIG partitioning and PCIe Gen5, so each card
 * carries its own full profile:
 *   · MEMORY     capacity counting up, drawn as HBM stacks (H200) or the
 *                GDDR7 bus channels (RTX PRO 6000) around the die.
 *   · BANDWIDTH  a plain metric with a delta pill.
 *   · PLATFORM   interconnect, power, form factor, cores, media engines.
 *   · MIG        on click: the hardware partitions, which differ in count
 *                and size.
 * Under the pair, one expandable chart compares throughput by precision on a
 * shared log scale, both GPUs per row. Hovering a row lights its twin on the
 * other card. Motion is transform/opacity only; static under reduced motion.
 */

import * as React from "react";
import { Icon } from "@/components/ui";
import { CountUp } from "@/components/fx/count-up";
import { cn } from "@/lib/cn";
import { GPU_SPECS, PRECISIONS, type GpuSpec } from "@/lib/gpu-specs";

const SEGMENTS = 28;
/* Shared log scale: 10 TFLOPS … 4,000 TFLOPS. */
const LOG_MIN = Math.log10(10);
const LOG_MAX = Math.log10(4000);
const logFrac = (v: number) =>
  Math.max(0.04, Math.min(1, (Math.log10(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)));
const fmt = (n: number) => n.toLocaleString("en-US");

interface RowCtx {
  active: string | null;
  set: (k: string | null) => void;
}
const RowContext = React.createContext<RowCtx>({ active: null, set: () => {} });

function Row({ k, className, children }: { k: string; className?: string; children: React.ReactNode }) {
  const { active, set } = React.useContext(RowContext);
  return (
    <div
      data-on={active === k ? "" : undefined}
      onPointerEnter={() => set(k)}
      onPointerLeave={() => set(null)}
      className={cn("gpu-row", className)}
    >
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line-subtle pt-5">
      <p className="cv-label mb-3 text-[10px]">{label}</p>
      {children}
    </div>
  );
}

/** HBM stacks as towers beside the die, or GDDR channels flanking it. */
function MemoryVisual({ spec }: { spec: GpuSpec }) {
  const m = spec.memoryLayout;
  const die = (
    <div className="gpu-hbm__die">
      <span>{spec.chip}</span>
    </div>
  );
  if (m.kind === "hbm") {
    const layers = 8;
    return (
      <div className="gpu-hbm" aria-hidden="true">
        {Array.from({ length: m.units }, (_, s) => (
          <div key={s} className="gpu-hbm__stack">
            {Array.from({ length: layers }, (_, l) => (
              <span
                key={l}
                className="gpu-hbm__layer"
                style={{ "--d": `${s * 70 + (layers - l) * 45}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        ))}
        {die}
      </div>
    );
  }
  const half = m.units / 2;
  const col = (offset: number) => (
    <div className="gpu-gddr__col">
      {Array.from({ length: half / 2 }, (_, i) => (
        <div key={i} className="gpu-gddr__pair">
          {[0, 1].map((j) => (
            <span
              key={j}
              className="gpu-hbm__layer gpu-gddr__chip"
              style={{ "--d": `${(offset + i * 2 + j) * 55}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div className="gpu-hbm gpu-gddr" aria-hidden="true">
      {col(0)}
      {die}
      {col(half)}
    </div>
  );
}

function Mig({ spec }: { spec: GpuSpec }) {
  return (
    <div
      className="gpu-mig"
      aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${spec.migSlices}, 1fr)` }}
    >
      {Array.from({ length: spec.migSlices }, (_, i) => (
        <span key={i} style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
          {spec.migSliceGb}
          <small>GB</small>
        </span>
      ))}
    </div>
  );
}

function GpuCard({ spec, other }: { spec: GpuSpec; other: GpuSpec }) {
  const memDelta = Math.round((spec.memoryGb / other.memoryGb - 1) * 100);
  const bwRatio = spec.bandwidthTbs / other.bandwidthTbs;

  const platform: [string, string, string][] = [
    ["interconnect", "Interconnect", spec.interconnect],
    ["power", "Max power", spec.maxPower],
    ["form", "Form factor", spec.formFactor],
    ["cores", "Cores", spec.cores],
    ["media", "Media engines", spec.media],
    ["extras", "Also", spec.extras],
  ];

  return (
    <article className="gpu-card cv-spotlight lg lg-hover relative flex h-full flex-col gap-6 rounded-xl p-7 md:p-8">
      <span className="gpu-card__beam" aria-hidden="true" />

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-label text-hydro uppercase">
            {spec.architecture} · {spec.chip}
          </p>
          <h3 className="mt-2 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-tight text-ink-100">
            {spec.name}
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-400">{spec.tagline}.</p>
        </div>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-carbon-600">
          <Icon name="cpu" size={21} weight="duotone" className="text-hydro" />
        </span>
      </header>

      <Section label="Memory">
        <Row k="memory" className="grid items-end gap-5 sm:grid-cols-[1fr_auto]">
          <MemoryVisual spec={spec} />
          <div className="text-right">
            <div className="nums font-mono text-[clamp(2.2rem,3.6vw,2.9rem)] leading-none font-medium tracking-tight text-ink-100">
              <CountUp value={spec.memoryGb} />
              <span className="ml-1.5 text-[0.45em] text-ink-400">GB</span>
            </div>
            <p className="mt-2 font-mono text-[12px] text-ink-500">
              {spec.memoryType} · {spec.memoryLayout.label}
            </p>
            {memDelta > 0 ? (
              <p className="gpu-delta mt-2">+{memDelta}% vs {other.short}</p>
            ) : (
              <p className="gpu-delta gpu-delta--base mt-2">single PCIe card</p>
            )}
          </div>
        </Row>
      </Section>

      <Section label="Memory bandwidth">
        <Row k="bandwidth" className="flex items-end justify-between gap-4">
          <span className="nums font-mono text-[clamp(1.6rem,2.6vw,2rem)] leading-none font-medium tracking-tight text-ink-100">
            {spec.bandwidthTbs}
            <span className="ml-1.5 text-[0.5em] text-ink-400">TB/s</span>
          </span>
          {bwRatio > 1 ? (
            <span className="gpu-delta">{bwRatio.toFixed(1)}× vs {other.short}</span>
          ) : (
            <span className="gpu-delta gpu-delta--base">GDDR7</span>
          )}
        </Row>
      </Section>

      <Section label="Platform">
        <dl className="flex flex-col">
          {platform.map(([k, label, value]) => (
            <Row key={k} k={k} className="flex items-baseline justify-between gap-4 border-b border-line-subtle py-2.5 last:border-b-0">
              <dt className="shrink-0 text-[13px] text-ink-400">{label}</dt>
              <dd className="text-right font-mono text-[13px] text-ink-100">{value}</dd>
            </Row>
          ))}
        </dl>
      </Section>

      <details className="gpu-more mt-auto">
        <summary className="gpu-more__head">
          <span className="cv-label text-[10px]">Multi-Instance GPU</span>
          <span className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-ink-200">
              {spec.migSlices} × {spec.migSliceGb} GB
            </span>
            <span className="gpu-more__icon">
              <Icon name="plus" size={13} />
            </span>
          </span>
        </summary>
        <Row k="mig" className="flex flex-col gap-2.5 pt-3">
          <Mig spec={spec} />
          <p className="font-mono text-[12px] text-ink-500">
            up to {spec.migSlices} hardware-isolated instances · {spec.migSliceGb} GB each
          </p>
        </Row>
      </details>
    </article>
  );
}

/** Throughput by precision, both GPUs per row, on one log scale. */
function Throughput({ a, b }: { a: GpuSpec; b: GpuSpec }) {
  const bar = (spec: GpuSpec, p: (typeof PRECISIONS)[number], pi: number, tone: "a" | "b") => {
    const t = spec.throughput[p];
    const lit = t.value ? Math.round(logFrac(t.value) * SEGMENTS) : 0;
    return (
      <div className="grid grid-cols-[7.5rem_1fr_7rem] items-center gap-3">
        <span className="truncate font-mono text-[11px] text-ink-500">{spec.short}</span>
        <span className={cn("gpu-seg", tone === "b" && "gpu-seg--b")} aria-hidden="true">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <i
              key={i}
              data-lit={i < lit ? "" : undefined}
              style={{ "--d": `${pi * 60 + i * 14}ms` } as React.CSSProperties}
            />
          ))}
        </span>
        <span className="nums text-right font-mono text-[13px] text-ink-100">
          {t.value ? (
            <>
              {fmt(t.value)}
              {t.sparse ? <sup className="text-ink-500">*</sup> : null}
            </>
          ) : (
            <span className="text-[11px] text-ink-500">{t.note}</span>
          )}
        </span>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-4">
      {PRECISIONS.map((p, pi) => (
        <Row key={p} k={`t-${p}`} className="grid gap-1.5 py-1 md:grid-cols-[5.5rem_1fr] md:items-center md:gap-4">
          <span className="font-mono text-[12px] tracking-wide text-ink-300">{p}</span>
          <div className="flex flex-col gap-1.5">
            {bar(a, p, pi, "a")}
            {bar(b, p, pi, "b")}
          </div>
        </Row>
      ))}
    </div>
  );
}

export function GpuCompare() {
  const [active, setActive] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [h200, rtx] = GPU_SPECS as [GpuSpec, GpuSpec];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.shown = "";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.dataset.shown = "";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mem = (h200.memoryGb / rtx.memoryGb).toFixed(2);
  const bw = (h200.bandwidthTbs / rtx.bandwidthTbs).toFixed(0);

  return (
    <RowContext.Provider value={{ active, set: setActive }}>
      <div ref={ref} className="gpu-compare">
        <div className="gpu-deltas mb-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-line px-6 py-4">
          <span className="font-mono text-[11px] tracking-label text-ink-500 uppercase">
            H200 vs RTX PRO 6000
          </span>
          <span className="gpu-deltas__item">
            <b>{mem}×</b> memory
          </span>
          <span className="gpu-deltas__item">
            <b>{bw}×</b> bandwidth
          </span>
          <span className="gpu-deltas__item">
            <b>FP4</b> on Blackwell
          </span>
          <span className="gpu-deltas__item">
            <b>{rtx.migSliceGb} GB</b> vs {h200.migSliceGb} GB per MIG slice
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <GpuCard spec={h200} other={rtx} />
          <GpuCard spec={rtx} other={h200} />
        </div>

        <section className="lg mt-5 rounded-xl p-7 md:p-8" aria-label="Throughput by precision">
          <details className="gpu-more gpu-more--top">
            <summary className="gpu-more__head">
              <span>
                <span className="block text-lg font-semibold tracking-tight text-ink-100">
                  Throughput by precision
                </span>
                <span className="mt-1 block font-mono text-[11px] tracking-label text-ink-500 uppercase">
                  FP4 to FP64 · TFLOPS · shared log scale
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span className="hidden items-center gap-3 font-mono text-[11px] text-ink-400 sm:flex">
                  <span className="gpu-key" /> {h200.short}
                  <span className="gpu-key gpu-key--b" /> {rtx.short}
                </span>
                <span className="gpu-more__icon">
                  <Icon name="plus" size={13} />
                </span>
              </span>
            </summary>
            <div className="pt-5">
              <Throughput a={h200} b={rtx} />
            </div>
          </details>
        </section>

        <p className="mx-auto mt-5 max-w-3xl text-center font-mono text-[11px] leading-relaxed text-ink-500">
          * H200 tensor figures with sparsity (SXM5 datasheet). RTX PRO 6000 Blackwell Server
          Edition figures as NVIDIA publishes them, without a dense/sparse label. FP32 and FP64
          are non-tensor.
        </p>
      </div>
    </RowContext.Provider>
  );
}
