"use client";

/**
 * The pinned platform story: the 3D rack row sticks in place while three
 * steps of copy — slice, card, rack — scroll past it. As each step reaches
 * the middle of the viewport it becomes active: the row turns a few degrees,
 * the matching rack pulls out and lights, and the step's copy comes to full
 * Ink while the others recede.
 *
 * position: sticky for the pin, one IntersectionObserver for the steps, no
 * scroll-jacking: the page scrolls at exactly its normal speed.
 */

import * as React from "react";
import { RackRow3D } from "./rack-row-3d";
import { cn } from "@/lib/cn";

export interface Step {
  n: string;
  title: string;
  body: string;
  cmd: string;
}

export function PinnedStory({ steps, className }: { steps: Step[]; className?: string }) {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLElement | null)[]>([]);

  React.useEffect(() => {
    const els = refs.current.filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      // A band across the middle of the viewport: a step is active while it
      // crosses it.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <div
      data-step={active}
      className={cn("grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16", className)}
    >
      <ol className="flex flex-col">
        {steps.map((s, i) => (
          <li
            key={s.n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cn(
              "flex min-h-[52vh] flex-col justify-center border-t border-line-subtle py-10 transition-opacity duration-slow ease-standard first:border-t-0",
              i === active ? "opacity-100" : "opacity-40",
            )}
          >
            <p className="cv-label text-hydro">{s.n}</p>
            <h3 className="mt-3 text-[1.5rem] font-semibold tracking-tight text-ink-100">
              {s.title}
            </h3>
            <p className="mt-3 max-w-[46ch] leading-relaxed text-ink-400">{s.body}</p>
            <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-md border border-line bg-carbon-800/80 px-3 py-2 font-mono text-[12px] text-ink-300">
              <span aria-hidden="true" className="text-hydro">
                $
              </span>
              {s.cmd}
            </p>
          </li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-28">
          <RackRow3D lit={active} />
          <p className="mt-4 text-center font-mono text-[10.5px] tracking-label text-ink-600 uppercase">
            {steps[active]?.title ?? ""} · same control plane
          </p>
        </div>
      </div>
    </div>
  );
}
