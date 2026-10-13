"use client";

/**
 * "One GPU, seven ways" (S7 teaser). One H200 NVL drawn as a block of 140
 * dots — its 141 GB of memory — that splits into seven hardware-isolated
 * slices of 16.5 GB (NVIDIA's datasheet figure) and joins back. Columns
 * move on the site spring, staggered from the centre out; a live region
 * announces the change. Only the two documented states are shown: the
 * whole card and seven equal slices.
 */
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

const COLS = 7;
const ROWS = 20;

export function SliceTeaser({ memory, slice }: { memory: string; slice: string }) {
  const [split, setSplit] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        role="img"
        aria-label={split ? `One H200 NVL split into seven slices of ${slice}` : `One H200 NVL with ${memory} of memory`}
        className="relative w-full max-w-[34rem]"
      >
        <div
          className={cn(
            "absolute -inset-4 rounded-panel border transition-[opacity,border-color] duration-[var(--dur-spring-smooth)] ease-spring",
            split ? "border-transparent opacity-0" : "border-line opacity-100",
          )}
        />
        <div className="relative flex justify-center gap-[clamp(0.2rem,0.7vw,0.35rem)]">
          {Array.from({ length: COLS }, (_, c) => {
            const offset = (c - (COLS - 1) / 2) * (split ? 1 : 0);
            const delay = Math.abs(c - (COLS - 1) / 2) * 40;
            return (
              <div
                key={c}
                className="flex flex-col items-center gap-3 transition-transform duration-[var(--dur-spring-gentle)] ease-spring"
                style={{
                  transform: `translateX(calc(${offset} * clamp(0.5rem, 2vw, 1.1rem)))`,
                  transitionDelay: `${delay}ms`,
                }}
              >
                <div
                  className={cn(
                    "grid grid-cols-2 gap-[clamp(0.2rem,0.7vw,0.35rem)] rounded-chip p-[clamp(0.15rem,0.5vw,0.3rem)] transition-[background-color,box-shadow] duration-[var(--dur-base)]",
                    split ? "bg-hydro-wash shadow-[inset_0_0_0_1px_var(--hydro)]" : "bg-transparent",
                  )}
                >
                  {Array.from({ length: (ROWS * 2) / 2 }, (_, r) => (
                    <span
                      key={r}
                      className={cn(
                        "size-[clamp(0.3rem,1.1vw,0.55rem)] rounded-full transition-colors duration-[var(--dur-base)]",
                        split ? "bg-hydro" : "bg-ink-2",
                      )}
                      style={{ transitionDelay: `${delay + r * 6}ms` }}
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    "type-caption tabular whitespace-nowrap text-ink-3 transition-[opacity,transform] duration-[var(--dur-base)] ease-out",
                    split ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                  )}
                  style={{ transitionDelay: split ? `${200 + delay}ms` : "0ms" }}
                >
                  {slice}
                </span>
              </div>
            );
          })}
        </div>
        <p
          className={cn(
            "type-title-3 tabular absolute top-full left-1/2 mt-7 -translate-x-1/2 whitespace-nowrap text-ink transition-[opacity,transform] duration-[var(--dur-base)] ease-out",
            split ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          {memory}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="mt-14 inline-flex rounded-pill border border-line bg-bg-raised p-1"
      >
        <span id={`${id}-label`} className="sr-only">
          How the GPU is divided
        </span>
        {[
          { v: false, label: "One GPU" },
          { v: true, label: "Seven slices" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={split === o.v}
            onClick={() => setSplit(o.v)}
            className={cn(
              "type-small relative h-10 rounded-pill px-5 font-medium transition-[background-color,color] duration-[var(--dur-spring-snappy)] ease-spring",
              split === o.v ? "bg-ink text-bg" : "text-ink-2 hover:text-ink",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {split ? `Split into seven slices of ${slice} each.` : `One GPU with ${memory} of memory.`}
      </p>
    </div>
  );
}
