"use client";

/**
 * The pinned platform story: on desktop the 3D rack row sticks in place while
 * three steps of copy — slice, card, rack — scroll past it. As each step
 * reaches the middle of the viewport it becomes active: the row turns a few
 * degrees, the matching rack pulls out and lights, and the step's copy comes
 * to full Ink while the others recede.
 *
 * position: sticky for the pin, one IntersectionObserver for the steps, no
 * scroll-jacking: the page scrolls at exactly its normal speed.
 *
 * Phones and tablets get no pin. A sticky panel there took a third of the
 * screen and slid over the step headings, so below lg the row sits once,
 * compact, above the steps, captioned with the whole path. Inactive steps are
 * dimmed with colour tokens rather than opacity, and only on desktop, so
 * every step still reads at full contrast where there is no rack beside it.
 */

import * as React from "react";
import { IsoStack } from "./iso-stack";
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
  const chips = React.useRef<(HTMLElement | null)[]>([]);

  /* A command chip that is cut off by its own width fades at the right edge
     until it is scrolled to the end, so a clipped command reads as "more this
     way" rather than as a typo. */
  React.useEffect(() => {
    const els = chips.current.filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const mark = (el: HTMLElement) =>
      el.toggleAttribute("data-more", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    const onScroll = (e: Event) => mark(e.currentTarget as HTMLElement);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) mark(entry.target as HTMLElement);
    });
    for (const el of els) {
      mark(el);
      ro.observe(el);
      el.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      ro.disconnect();
      for (const el of els) el.removeEventListener("scroll", onScroll);
    };
  }, [steps.length]);

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
      className={cn("grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16", className)}
    >
      {/* Phones and tablets: the row once, compact and in the flow — never
          stuck over the copy. The caption names the whole path instead of
          the active step, since nothing here follows the scroll. */}
      <div className="lg:hidden">
        <p className="mb-2 text-center font-mono text-[10.5px] tracking-label text-ink-500 uppercase">
          h200 · slice → whole cards → dedicated
        </p>
        <IsoStack mode="row" />
      </div>

      {/* min-w-0: a grid item defaults to its min-content width, and a
          one-line command chip would otherwise widen the column past a
          phone's viewport instead of scrolling inside itself. */}
      <ol className="flex min-w-0 flex-col">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <li
              key={s.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              aria-current={on ? "step" : undefined}
              className="flex min-w-0 flex-col justify-center border-t border-line-subtle py-8 first:border-t-0 lg:min-h-[52vh] lg:py-10"
            >
              <p
                className={cn(
                  "cv-label transition-colors duration-slow ease-standard",
                  on ? "text-hydro" : "text-hydro lg:text-ink-500",
                )}
              >
                {s.n}
              </p>
              <h3
                className={cn(
                  "mt-3 text-[1.5rem] font-semibold tracking-tight transition-colors duration-slow ease-standard",
                  on ? "text-ink-100" : "text-ink-100 lg:text-ink-400",
                )}
              >
                {s.title}
              </h3>
              <p
                className={cn(
                  "mt-3 max-w-[46ch] leading-relaxed transition-colors duration-slow ease-standard",
                  on ? "text-ink-400" : "text-ink-400 lg:text-ink-500",
                )}
              >
                {s.body}
              </p>
              {/* One line, always: a command that wraps mid-flag reads as a
                  typo. A long one scrolls inside its own chip, which is
                  focusable so the scroll is reachable from the keyboard. */}
              <p
                ref={(el) => {
                  chips.current[i] = el;
                }}
                tabIndex={0}
                className={cn(
                  "mt-5 inline-flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-md border bg-carbon-800/80 px-3 py-2 font-mono text-[12px] whitespace-nowrap [scrollbar-width:none] transition-colors duration-slow ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro data-more:[mask-image:linear-gradient(90deg,#000_calc(100%-36px),transparent)]",
                  on
                    ? "border-line text-ink-300"
                    : "border-line text-ink-300 lg:border-line-subtle lg:text-ink-500",
                )}
              >
                <span aria-hidden="true" className="shrink-0 text-hydro">
                  $
                </span>
                <span className="shrink-0">{s.cmd}</span>
              </p>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block">
        {/* Pinned high and with no caption above it, so the drawing starts
            level with the first step instead of floating below it. */}
        <div className="sticky top-20 -mt-6">
          <IsoStack lit={active} className="mx-auto max-w-[460px]" />
        </div>
      </div>
    </div>
  );
}
