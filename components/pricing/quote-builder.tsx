"use client";

/**
 * The quote console (08 §8), first form: three answers — what, how many,
 * how long — assemble a plan card (S13) that carries the visitor into the
 * request form with everything pre-filled, so nothing is asked twice
 * (03 §5.4). No prices: rates are not published.
 */
import { useId, useState } from "react";
import { ButtonLink } from "@/components/system/button";
import { DotGlyph } from "@/components/system/dot-glyph";
import { PRODUCTS } from "@/copy/en/products";
import { QUOTE_DURATIONS, QUOTE_PRODUCTS } from "@/copy/en/pricing";
import { cn } from "@/lib/cn";

function Chips<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="type-kicker mb-3 text-ink-3">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "type-small cursor-pointer rounded-pill border px-4 py-2.5 transition-[background-color,border-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hydro active:scale-[0.97]",
              value === o.id ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function QuoteBuilder() {
  const [product, setProduct] = useState<(typeof QUOTE_PRODUCTS)[number]["slug"]>("on-demand");
  const [count, setCount] = useState(1);
  const [duration, setDuration] = useState<(typeof QUOTE_DURATIONS)[number]>("Weeks");
  const def = QUOTE_PRODUCTS.find((p) => p.slug === product)!;
  const info = PRODUCTS.find((p) => p.slug === product)!;
  const max = def.unit === "slices" ? 56 : 8;
  const unitLabel = def.unit === "slices" ? (count === 1 ? "slice" : "slices") : "H200 NVL";
  const params = new URLSearchParams({ intent: "workloads", product, duration });
  if (def.unit === "gpus" || def.unit === "slices") params.set("count", String(count));

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-9">
        <Chips
          legend="1 · What do you want to run on?"
          options={QUOTE_PRODUCTS.map((p) => ({ id: p.slug, label: p.label }))}
          value={product}
          onChange={(v) => {
            setProduct(v);
            setCount(1);
          }}
        />
        {(def.unit === "gpus" || def.unit === "slices") && (
          <fieldset className="flex flex-col gap-3">
            <legend className="type-kicker mb-3 text-ink-3">2 · How many?</legend>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Fewer"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                disabled={count <= 1}
                className="grid size-11 place-items-center rounded-full border border-line text-ink transition-[border-color,transform] duration-[var(--dur-spring-snappy)] ease-spring hover:border-line-strong active:scale-[0.94] disabled:opacity-40"
              >
                −
              </button>
              <output aria-live="polite" className="type-title-2 tabular min-w-[5ch] text-center">
                {count}
              </output>
              <button
                type="button"
                aria-label="More"
                onClick={() => setCount((c) => Math.min(max, c + 1))}
                disabled={count >= max}
                className="grid size-11 place-items-center rounded-full border border-line text-ink transition-[border-color,transform] duration-[var(--dur-spring-snappy)] ease-spring hover:border-line-strong active:scale-[0.94] disabled:opacity-40"
              >
                +
              </button>
              <span className="type-small text-ink-2">{unitLabel}</span>
            </div>
          </fieldset>
        )}
        <Chips
          legend={def.unit === "none" ? "2 · For how long?" : "3 · For how long?"}
          options={QUOTE_DURATIONS.map((d) => ({ id: d, label: d }))}
          value={duration}
          onChange={setDuration}
        />
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
            {(def.unit === "gpus" || def.unit === "slices") && (
              <div>
                <dt className="type-caption text-ink-3">Size</dt>
                <dd className="type-title-3 tabular">
                  {count} × {unitLabel}
                </dd>
              </div>
            )}
            <div>
              <dt className="type-caption text-ink-3">How long</dt>
              <dd className="type-title-3">{duration}</dd>
            </div>
          </dl>
          <p className="type-small border-t border-line pt-5 text-ink-2">A firm quote in rupees within one working day. Billing: {info.billing.toLowerCase()}.</p>
          <ButtonLink href={`/contact?${params.toString()}`} size="lg" className="w-full" magnetic>
            Get my quote
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
