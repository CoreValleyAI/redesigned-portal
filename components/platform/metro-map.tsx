"use client";

/**
 * "A day on the platform" — example workflows as a metro map (08 §6). Each
 * line is a pipeline and each stop a tool in HPE AI Essentials. Choose a line
 * and it lights up while a pulse of light runs along it (the Flow); the
 * others rest. Rows stay readable on phones (stops wrap their labels).
 */
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export interface MetroLine {
  id: string;
  name: string;
  stops: readonly string[];
}

export function MetroMap({ lines }: { lines: readonly MetroLine[] }) {
  const [active, setActive] = useState(lines[1]?.id ?? lines[0]!.id);
  const id = useId();
  const counts = new Map<string, number>();
  for (const l of lines) for (const s of l.stops) counts.set(s, (counts.get(s) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-10">
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2">
        <span id={`${id}-label`} className="sr-only">
          Choose a workflow
        </span>
        {lines.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={active === l.id}
            onClick={() => setActive(l.id)}
            className={cn(
              "type-small h-10 rounded-pill border px-4 font-medium transition-[background-color,border-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring active:scale-[0.97]",
              active === l.id ? "border-hydro bg-hydro-wash text-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {l.name}
          </button>
        ))}
      </div>

      <ol className="flex flex-col gap-10 md:gap-12">
        {lines.map((l) => {
          const on = l.id === active;
          return (
            <li
              key={l.id}
              aria-current={on ? "true" : undefined}
              className={cn(
                "grid gap-4 transition-opacity duration-[var(--dur-base)] md:grid-cols-[11rem_1fr] md:items-center md:gap-8",
                on ? "opacity-100" : "opacity-45",
              )}
            >
              <span className={cn("type-kicker", on ? "text-hydro-ink light:text-hydro" : "text-ink-3")}>{l.name}</span>
              <div className="relative">
                {/* The track and the light running along it. */}
                <div aria-hidden="true" className="absolute top-[0.6875rem] right-3 left-3 h-[3px] rounded-full bg-line" />
                {on && (
                  <div aria-hidden="true" className="absolute top-[0.6875rem] right-3 left-3 h-[3px] overflow-hidden rounded-full">
                    <div className="h-full w-full bg-hydro" style={{ animation: "cv-metro-fill 900ms var(--ease-expo) both" }} />
                    <div className="absolute inset-0" style={{ animation: "cv-metro-run 2.6s linear 900ms infinite" }}>
                      <span className="absolute top-1/2 right-0 h-[3px] w-16 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent to-white/90 dark:to-white" />
                    </div>
                  </div>
                )}
                <ol className="relative flex justify-between">
                  {l.stops.map((s, i) => {
                    const shared = (counts.get(s) ?? 0) > 1;
                    return (
                      <li key={`${s}-${i}`} className="flex w-0 flex-1 flex-col items-center gap-2 first:items-start last:items-end">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-6 place-items-center rounded-full border-[3px] bg-bg transition-colors duration-[var(--dur-base)]",
                            on ? "border-hydro" : "border-line-strong",
                            shared && "ring-2 ring-line ring-offset-2 ring-offset-bg",
                          )}
                          style={on ? { transitionDelay: `${i * 90}ms` } : undefined}
                        >
                          {shared && <span className={cn("size-1.5 rounded-full", on ? "bg-hydro" : "bg-line-strong")} />}
                        </span>
                        <span className={cn("type-caption max-w-[7rem] text-center text-pretty first:text-left", on ? "text-ink" : "text-ink-3", i === 0 && "text-left", i === l.stops.length - 1 && "text-right")}>
                          {s}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="type-caption text-ink-3">Ringed stops are shared by more than one line. Example workflows, for illustration.</p>
    </div>
  );
}
