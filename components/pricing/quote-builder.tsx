"use client";

/**
 * The quote console (08 §8): a few answers — what, how much, how long, and
 * the kind of work — assemble a plan card (S13) that carries the visitor
 * into the request form with everything pre-filled, so nothing is asked
 * twice (03 §5.4). No prices: rates are not published.
 *
 * Every control is a native input underneath (radios, a range), so the
 * console works with a keyboard and a screen reader exactly as a form does:
 *
 *  · What: six product tiles (a radio group).
 *  · How many: a row of GPUs, where picking one lights it and every one
 *    before it, and "More" for anything larger (no cluster layout or size:
 *    CTO ruling, 14 Oct 2026); MIG slices on a range, seven per GPU;
 *    storage as a capacity band.
 *  · How long, and the work: segmented controls whose lens slides between
 *    the options.
 */
import { useId, useState } from "react";
import { ButtonLink } from "@/components/system/button";
import { DotGlyph } from "@/components/system/dot-glyph";
import { PRODUCTS } from "@/copy/en/products";
import { QUOTE, QUOTE_DURATIONS, QUOTE_PRODUCTS, QUOTE_STORAGE, QUOTE_WORKLOADS } from "@/copy/en/pricing";
import { cn } from "@/lib/cn";
import { v } from "@/lib/facts";

type Slug = (typeof QUOTE_PRODUCTS)[number]["slug"];

const GPU_GB = parseFloat(v("gpu.memory"));
const SLICE_GB = parseFloat(v("gpu.migSize"));
/** GPUs offered one by one in the picker; anything larger is "More". */
const GPUS = 4;
/** The picker's value for "more than GPUS". */
const MORE = 0;
const SLICES_PER_GPU = Number(v("gpu.migCount"));

const focusRing =
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hydro";

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend className="mb-4 flex w-full items-baseline justify-between gap-4">
        <span className="flex items-baseline gap-3">
          <span className="type-kicker tabular text-hydro-ink light:text-hydro">{String(n).padStart(2, "0")}</span>
          <span className="type-title-3 text-ink">{title}</span>
        </span>
        {hint ? <span className="type-caption hidden text-ink-3 sm:block">{hint}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

/** What: the six products as tiles. */
function ProductTiles({ value, onChange }: { value: Slug; onChange: (v: Slug) => void }) {
  const name = useId();
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {QUOTE_PRODUCTS.map((q) => {
        const p = PRODUCTS.find((x) => x.slug === q.slug)!;
        const on = value === q.slug;
        return (
          <label
            key={q.slug}
            className={cn(
              "group relative flex cursor-pointer flex-col gap-3 rounded-card border p-4 transition-[border-color,background-color,box-shadow,transform] duration-[var(--dur-spring-snappy)] ease-spring active:scale-[0.98] sm:p-5",
              focusRing,
              on
                ? "border-hydro bg-hydro-wash shadow-[inset_0_0_0_1px_var(--hydro)]"
                : "border-line bg-bg-raised hover:-translate-y-0.5 hover:border-line-strong",
            )}
          >
            <input
              type="radio"
              name={name}
              value={q.slug}
              checked={on}
              onChange={() => onChange(q.slug)}
              className="sr-only"
            />
            <span className="flex items-start justify-between">
              <DotGlyph name={p.glyph} className="size-8" on={on} />
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-5 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-[var(--dur-spring-snappy)] ease-spring",
                  on ? "scale-100 border-hydro bg-hydro text-bg" : "scale-90 border-line-strong text-transparent",
                )}
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 6.2 5 8.6l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="type-body font-semibold leading-tight text-ink">{q.label}</span>
              <span className="type-caption text-ink-3">{q.unitLabel}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** How many GPUs: one to four, lit in order, or more. */
function GpuPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const name = useId();
  const options = [...Array.from({ length: GPUS }, (_, g) => g + 1), MORE];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-2 rounded-card border border-line bg-bg-sunken/60 p-3">
        {options.map((n) => {
          const lit = value === MORE || (n !== MORE && n <= value);
          return (
            <label
              key={n}
              className={cn(
                "relative flex aspect-[3/4] cursor-pointer flex-col justify-between overflow-hidden rounded-chip border p-1.5 transition-[background-color,border-color,transform] ease-spring active:scale-[0.95]",
                focusRing,
                lit
                  ? "border-hydro bg-hydro text-bg"
                  : "border-line bg-bg-raised text-ink-3 hover:border-line-strong hover:text-ink-2",
              )}
              style={{
                transitionDuration: "var(--dur-spring-snappy)",
                transitionDelay: lit ? `${((n === MORE ? GPUS + 1 : n) - 1) * 28}ms` : "0ms",
              }}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
                aria-label={n === MORE ? `More than ${GPUS} GPUs` : `${n} ${n === 1 ? "GPU" : "GPUs"}`}
              />
              <span aria-hidden="true" className="font-mono text-[0.625rem] leading-none tabular">
                {n === MORE ? "More" : String(n).padStart(2, "0")}
              </span>
              {/* The card's memory, as a stack of dots. */}
              <span aria-hidden="true" className="grid grid-cols-3 gap-[3px] self-center">
                {Array.from({ length: 9 }, (_, i) => (
                  <span
                    key={i}
                    className={cn("size-[3px] rounded-full", lit ? "bg-bg/80" : "bg-current opacity-45")}
                  />
                ))}
              </span>
            </label>
          );
        })}
      </div>
      <p className="type-small text-ink-2" aria-live="polite">
        {value === MORE ? (
          <>
            <span className="font-semibold text-ink">More than {GPUS} × H200 NVL</span> · we&apos;ll plan it with you
          </>
        ) : (
          <>
            <span className="font-semibold text-ink tabular">{value} × H200 NVL</span> · {fmt(value * GPU_GB)} GB of
            HBM3e
          </>
        )}
      </p>
    </div>
  );
}

/** How many slices: a range across up to four GPUs, seven slices each. */
function SlicePicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const id = useId();
  const max = GPUS * SLICES_PER_GPU;
  const gpus = Math.ceil(value / SLICES_PER_GPU);
  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden="true" className="grid grid-cols-4 gap-2">
        {Array.from({ length: GPUS }, (_, g) => (
          <div key={g} className="flex flex-col gap-1 rounded-chip border border-line bg-bg-sunken/60 p-1.5">
            {Array.from({ length: SLICES_PER_GPU }, (_, s) => {
              const k = g * SLICES_PER_GPU + s + 1;
              return (
                <span
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-[var(--dur-short)]",
                    k <= value ? "bg-hydro" : "bg-line",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">
        MIG slices
      </label>
      <input
        id={id}
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} ${value === 1 ? "slice" : "slices"} on ${gpus} ${gpus === 1 ? "GPU" : "GPUs"}`}
        className="quote-range w-full"
        style={{ "--fill": `${((value - 1) / (max - 1)) * 100}%` } as React.CSSProperties}
      />
      <p className="type-small text-ink-2" aria-live="polite">
        <span className="font-semibold text-ink tabular">
          {value} {value === 1 ? "slice" : "slices"}
        </span>{" "}
        · about {fmt(value * SLICE_GB)} GB · on {gpus} {gpus === 1 ? "GPU" : "GPUs"}
      </p>
    </div>
  );
}

/** A segmented control whose lens slides to the chosen option. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string; short?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const name = useId();
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  );
  return (
    <div
      className="segmented relative grid rounded-pill border border-line bg-bg-sunken p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="segmented__lens absolute inset-y-1 left-1 rounded-pill"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => {
        const on = o.id === value;
        return (
          <label
            key={o.id}
            className={cn(
              "type-small relative z-10 flex min-h-11 cursor-pointer items-center justify-center rounded-pill px-2 text-center font-medium transition-colors duration-[var(--dur-short)]",
              focusRing,
              on ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={on}
              onChange={() => onChange(o.id)}
              className="sr-only"
              aria-label={`${label}: ${o.label}`}
            />
            <span aria-hidden="true" className="sm:hidden">
              {o.short ?? o.label}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              {o.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function QuoteBuilder() {
  const [product, setProduct] = useState<Slug>("on-demand");
  const [count, setCount] = useState(1);
  const [storage, setStorage] = useState<(typeof QUOTE_STORAGE)[number]["id"]>(QUOTE_STORAGE[0].id);
  const [duration, setDuration] = useState<(typeof QUOTE_DURATIONS)[number]["id"]>("Weeks");
  const [workload, setWorkload] = useState<(typeof QUOTE_WORKLOADS)[number]["id"]>("inference");
  const def = QUOTE_PRODUCTS.find((p) => p.slug === product)!;
  const info = PRODUCTS.find((p) => p.slug === product)!;
  const work = QUOTE_WORKLOADS.find((w) => w.id === workload)!;
  const band = QUOTE_STORAGE.find((s) => s.id === storage)!;

  const sized = def.unit === "gpus" || def.unit === "slices";
  const unitLabel = def.unit === "slices" ? (count === 1 ? "slice" : "slices") : "H200 NVL";
  const params = new URLSearchParams({ intent: "workloads", product, duration, workload });
  if (sized) params.set("count", count === MORE ? "more" : String(count));
  if (def.unit === "tb") params.set("capacity", storage);

  let n = 1;
  return (
    <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-12">
        <Step n={n++} title={QUOTE.steps.what} hint={QUOTE.steps.whatHint}>
          <ProductTiles
            value={product}
            onChange={(v) => {
              setProduct(v);
              setCount(1);
            }}
          />
        </Step>

        {def.unit === "gpus" && (
          <Step n={n++} title={QUOTE.steps.gpus} hint={QUOTE.steps.gpusHint}>
            <GpuPicker value={count} onChange={setCount} />
          </Step>
        )}
        {def.unit === "slices" && (
          <Step n={n++} title={QUOTE.steps.slices} hint={QUOTE.steps.slicesHint}>
            <SlicePicker value={count} onChange={setCount} />
          </Step>
        )}
        {def.unit === "tb" && (
          <Step n={n++} title={QUOTE.steps.storage} hint={QUOTE.steps.storageHint}>
            <Segmented label="Capacity" options={QUOTE_STORAGE} value={storage} onChange={setStorage} />
          </Step>
        )}

        <Step n={n++} title={QUOTE.steps.duration}>
          <Segmented label="Term" options={QUOTE_DURATIONS} value={duration} onChange={setDuration} />
        </Step>

        <Step n={n++} title={QUOTE.steps.workload}>
          <Segmented label="Workload" options={QUOTE_WORKLOADS} value={workload} onChange={setWorkload} />
        </Step>
      </div>

      {/* The plan card (S13). */}
      <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
        <div className="flex flex-col gap-6 rounded-panel border border-line bg-bg-raised p-7 shadow-chrome">
          <div className="flex items-center justify-between">
            <span className="type-kicker text-ink-3">Your plan</span>
            <DotGlyph name={info.glyph} className="size-8" on />
          </div>
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="type-caption text-ink-3">Product</dt>
              <dd className="type-title-3">{info.name}</dd>
            </div>
            {sized && (
              <div>
                <dt className="type-caption text-ink-3">Size</dt>
                <dd className="type-title-3 tabular">
                  {count === MORE ? `More than ${GPUS}` : count} × {unitLabel}
                  {count !== MORE && (
                    <span className="type-small ml-2 font-normal text-ink-3">
                      {def.unit === "slices" ? `≈ ${fmt(count * SLICE_GB)} GB` : `${fmt(count * GPU_GB)} GB HBM3e`}
                    </span>
                  )}
                </dd>
              </div>
            )}
            {def.unit === "tb" && (
              <div>
                <dt className="type-caption text-ink-3">Capacity</dt>
                <dd className="type-title-3">{band.label}</dd>
              </div>
            )}
            <div>
              <dt className="type-caption text-ink-3">How long</dt>
              <dd className="type-title-3">{duration}</dd>
            </div>
            <div>
              <dt className="type-caption text-ink-3">Workload</dt>
              <dd className="type-title-3">{work.label}</dd>
            </div>
          </dl>
          <p className="type-small border-t border-line pt-5 text-ink-2">
            A firm quote in rupees within one working day. Billing: {info.billing.toLowerCase()}.
          </p>
          <ButtonLink href={`/contact?${params.toString()}`} size="lg" className="w-full" magnetic>
            Get my quote
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
