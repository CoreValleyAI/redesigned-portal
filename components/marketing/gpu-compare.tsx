"use client";

/**
 * H200 vs H100, side by side, in full datasheet detail.
 *
 * The two GPUs share most of their datasheet, so the page says the shared
 * part once and gives each card only what differs:
 *
 *   · EACH CARD   memory (HBM stacks drawn as towers, capacity counting up),
 *                 memory bandwidth as a plain metric, and — on click — the
 *                 MIG partitions, whose slice size differs.
 *   · SHARED      one panel under the pair: platform (NVLink, PCIe, power,
 *                 form factor, media) always visible, and — on click — the
 *                 tensor throughput ladder, identical for both.
 *
 * Hovering a row lights the same row on the other card. Motion is
 * transform/opacity only, and static under reduced motion.
 */

import * as React from "react";
import { Icon } from "@/components/ui";
import { CountUp } from "@/components/fx/count-up";
import { cn } from "@/lib/cn";
import { GPU_SPECS, PRECISIONS, type GpuSpec, type Precision } from "@/lib/gpu-specs";

const SEGMENTS = 24; // cells per precision bar

/* Shared log scale across both cards: 10 TFLOPS … 4,000 TFLOPS. */
const LOG_MIN = Math.log10(10);
const LOG_MAX = Math.log10(4000);
const logFrac = (v: number) =>
  Math.max(0.04, Math.min(1, (Math.log10(v) - LOG_MIN) / (LOG_MAX - LOG_MIN)));

const fmt = (n: number) => n.toLocaleString("en-US");

type RowKey =
  | "memory"
  | "bandwidth"
  | `t-${Precision}`
  | "mig"
  | "nvlink"
  | "pcie"
  | "tdp"
  | "form"
  | "media";

interface RowCtx {
  active: RowKey | null;
  set: (k: RowKey | null) => void;
}
const RowContext = React.createContext<RowCtx>({ active: null, set: () => {} });

/** A hover-linked row: highlights itself and its twin on the other card. */
function Row({
  k,
  className,
  children,
}: {
  k: RowKey;
  className?: string;
  children: React.ReactNode;
}) {
  const { active, set } = React.useContext(RowContext);
  return (
    <div
      data-row={k}
      data-on={active === k ? "" : undefined}
      onPointerEnter={() => set(k)}
      onPointerLeave={() => set(null)}
      className={cn("gpu-row", className)}
    >
      {children}
    </div>
  );
}

function Hbm({ spec, maxStacks }: { spec: GpuSpec; maxStacks: number }) {
  const layers = 8;
  return (
    <div className="gpu-hbm" aria-hidden="true">
      {Array.from({ length: maxStacks }, (_, s) => {
        const on = s < spec.hbmStacks;
        return (
          <div key={s} className={cn("gpu-hbm__stack", !on && "gpu-hbm__stack--off")}>
            {Array.from({ length: layers }, (_, l) => (
              <span
                key={l}
                className="gpu-hbm__layer"
                style={{ "--d": `${s * 70 + (layers - l) * 45}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        );
      })}
      <div className="gpu-hbm__die">
        <span>GH100</span>
      </div>
    </div>
  );
}

function Ladder({ spec }: { spec: GpuSpec }) {
  return (
    <div className="flex flex-col">
      {PRECISIONS.map((p, pi) => {
        const t = spec.tensor[p];
        const lit = Math.round(logFrac(t.value) * SEGMENTS);
        const unit = p === "INT8" ? "TOPS" : "TFLOPS";
        return (
          <Row key={p} k={`t-${p}`} className="grid grid-cols-[4.5rem_1fr_6.5rem] items-center gap-3 py-1.5">
            <span className="font-mono text-[12px] tracking-wide text-ink-400">{p}</span>
            <span className="gpu-seg" aria-hidden="true">
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <i
                  key={i}
                  data-lit={i < lit ? "" : undefined}
                  style={{ "--d": `${pi * 60 + i * 18}ms` } as React.CSSProperties}
                />
              ))}
            </span>
            <span className="nums text-right font-mono text-[13px] text-ink-100">
              {fmt(t.value)}
              {t.sparse ? <sup className="text-ink-500">*</sup> : null}
              <span className="ml-1 text-[10px] text-ink-500">{unit}</span>
            </span>
          </Row>
        );
      })}
    </div>
  );
}

function Mig({ spec }: { spec: GpuSpec }) {
  return (
    <div className="gpu-mig" aria-hidden="true">
      {Array.from({ length: spec.migSlices }, (_, i) => (
        <span key={i} style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
          {spec.migSliceGb}
          <small>GB</small>
        </span>
      ))}
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

function GpuCard({ spec, other }: { spec: GpuSpec; other: GpuSpec }) {
  const maxStacks = Math.max(spec.hbmStacks, other.hbmStacks);
  const memDelta = Math.round((spec.memoryGb / other.memoryGb - 1) * 100);
  const bwDelta = Math.round((spec.bandwidthTbs / other.bandwidthTbs - 1) * 100);

  return (
    <article className="gpu-card cv-spotlight lg lg-hover relative flex h-full flex-col gap-6 rounded-xl p-7 md:p-8">
      <span className="gpu-card__beam" aria-hidden="true" />

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-label text-hydro uppercase">
            {spec.architecture} · {spec.formFactor}
          </p>
          <h3 className="mt-2 text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold tracking-tight text-ink-100">
            {spec.name}
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-400">{spec.tagline}.</p>
        </div>
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-carbon-600">
          <Icon name="cpu" size={21} weight="duotone" className="text-hydro" />
        </span>
      </header>

      {/* Memory */}
      <Section label="Memory">
        <Row k="memory" className="grid items-end gap-5 sm:grid-cols-[1fr_auto]">
          <Hbm spec={spec} maxStacks={maxStacks} />
          <div className="text-right">
            <div className="nums font-mono text-[clamp(2.2rem,3.6vw,2.9rem)] leading-none font-medium tracking-tight text-ink-100">
              <CountUp value={spec.memoryGb} />
              <span className="ml-1.5 text-[0.45em] text-ink-400">GB</span>
            </div>
            <p className="mt-2 font-mono text-[12px] text-ink-500">
              {spec.memoryType} · {spec.hbmStacks} stacks
            </p>
            {/* Both cards carry a pill so their rows line up across the pair. */}
            {memDelta > 0 ? (
              <p className="gpu-delta mt-2">+{memDelta}% vs {other.short}</p>
            ) : (
              <p className="gpu-delta gpu-delta--base mt-2">baseline</p>
            )}
          </div>
        </Row>
      </Section>

      {/* Bandwidth: a metric, no animation. */}
      <Section label="Memory bandwidth">
        <Row k="bandwidth" className="flex items-end justify-between gap-4">
          <span className="nums font-mono text-[clamp(1.6rem,2.6vw,2rem)] leading-none font-medium tracking-tight text-ink-100">
            {spec.bandwidthTbs}
            <span className="ml-1.5 text-[0.5em] text-ink-400">TB/s</span>
          </span>
          {bwDelta > 0 ? (
            <span className="gpu-delta">+{bwDelta}% vs {other.short}</span>
          ) : (
            <span className="gpu-delta gpu-delta--base">baseline</span>
          )}
        </Row>
      </Section>

      {/* MIG: the one partitioning difference, on click. */}
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

/** What both GPUs have in common, stated once. */
function Shared({ spec }: { spec: GpuSpec }) {
  const platform = [
    ["Architecture", `${spec.architecture} · GH100`],
    ["Form factor", `${spec.formFactor} · HGX`],
    ["NVLink", `${spec.nvlinkGbs} GB/s`],
    ["PCIe", spec.pcie],
    ["Max power", `up to ${spec.tdpW} W`],
    ["Media engines", spec.decoders],
    ["MIG instances", `up to ${spec.migSlices}`],
    ["Peak FP8", `${fmt(spec.tensor.FP8.value)}* TFLOPS`],
  ] as const;
  return (
    <section className="lg mt-5 rounded-xl p-7 md:p-8" aria-label="Specifications shared by H200 and H100">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-ink-100">Shared by both</h3>
        <p className="font-mono text-[11px] tracking-label text-ink-500 uppercase">
          same Hopper silicon · same platform
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {platform.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 border-b border-line-subtle py-3 lg:flex-col lg:items-start lg:gap-1.5">
            <dt className="text-[13px] text-ink-400">{label}</dt>
            <dd className="font-mono text-[14px] text-ink-100">{value}</dd>
          </div>
        ))}
      </dl>

      <details className="gpu-more mt-5">
        <summary className="gpu-more__head">
          <span className="cv-label text-[10px]">Tensor throughput · FP64 to INT8</span>
          <span className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-ink-200">identical on both</span>
            <span className="gpu-more__icon">
              <Icon name="plus" size={13} />
            </span>
          </span>
        </summary>
        <div className="pt-3">
          <Ladder spec={spec} />
          <p className="mt-2 font-mono text-[11px] text-ink-500">shared log scale · 10 to 4,000 TFLOPS</p>
        </div>
      </details>
    </section>
  );
}

export function GpuCompare() {
  const [active, setActive] = React.useState<RowKey | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const [h200, h100] = GPU_SPECS as [GpuSpec, GpuSpec];

  // Start every animation once, when the pair scrolls into view.
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

  const bw = Math.round((h200.bandwidthTbs / h100.bandwidthTbs - 1) * 100);
  const mem = (h200.memoryGb / h100.memoryGb).toFixed(2);

  return (
    <RowContext.Provider value={{ active, set: setActive }}>
      <div ref={ref} className="gpu-compare">
        {/* The deltas, stated once, between the two cards. */}
        <div className="gpu-deltas mb-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-xl border border-line px-6 py-4">
          <span className="font-mono text-[11px] tracking-label text-ink-500 uppercase">
            H200 vs H100
          </span>
          <span className="gpu-deltas__item">
            <b>{mem}×</b> memory
          </span>
          <span className="gpu-deltas__item">
            <b>+{bw}%</b> bandwidth
          </span>
          <span className="gpu-deltas__item">
            <b>same</b> Hopper tensor cores
          </span>
          <span className="gpu-deltas__item">
            <b>{h200.migSliceGb} GB</b> vs {h100.migSliceGb} GB per MIG slice
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <GpuCard spec={h200} other={h100} />
          <GpuCard spec={h100} other={h200} />
        </div>

        <Shared spec={h200} />

        <p className="mt-5 text-center font-mono text-[11px] text-ink-500">
          * with sparsity. Figures from NVIDIA datasheets, SXM5 modules.
        </p>
      </div>
    </RowContext.Provider>
  );
}
