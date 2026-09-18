"use client";

/**
 * A fixed hairline rail down the left edge with the page's sections named in
 * mono. A Hydro fill tracks scroll position, the section currently under the
 * top of the viewport lights, and clicking a name scrolls to it.
 *
 * Sections opt in with `data-rail="<label>"`. Shown from the xl breakpoint,
 * where there is room beside the page column; below it the rail is not
 * rendered at all. Aria: a nav of in-page links, so it is also a table of
 * contents for assistive tech.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

interface Entry {
  id: string;
  label: string;
  el: HTMLElement;
}

export function ScrollRail() {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [active, setActive] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
    const list = nodes.map((el, i) => {
      if (!el.id) el.id = `rail-${i}-${(el.dataset.rail ?? "").replace(/\W+/g, "-")}`;
      return { id: el.id, label: el.dataset.rail ?? "", el };
    });
    setEntries(list);
    if (!list.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      // Active = the last section whose top has passed the upper third.
      const line = window.innerHeight * 0.33;
      let idx = 0;
      for (let i = 0; i < list.length; i++) {
        if (list[i]!.el.getBoundingClientRect().top <= line) idx = i;
      }
      setActive(idx);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!entries.length) return null;

  return (
    <nav
      aria-label="On this page"
      // Dots and the hairline only, until there is room: labels show on
      // hover/focus, and always from 1720px, where the page column leaves
      // enough margin for them.
      className="group fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative flex gap-4">
        {/* The rail and its fill. */}
        <span
          aria-hidden="true"
          className="relative block w-px self-stretch bg-line"
        >
          <span
            className="absolute inset-x-0 top-0 bg-hydro shadow-glow-sm transition-[height] duration-fast ease-standard"
            style={{ height: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <ol className="flex flex-col gap-3 py-0.5">
          {entries.map((e, i) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                aria-current={i === active ? "location" : undefined}
                aria-label={e.label}
                onClick={(ev) => {
                  ev.preventDefault();
                  e.el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "flex items-center gap-2.5 font-mono text-[10px] tracking-label uppercase transition-colors duration-normal",
                  i === active ? "text-ink-100" : "text-ink-600 hover:text-ink-300",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1 rounded-pill transition-[background-color,box-shadow] duration-normal",
                    i === active ? "bg-hydro shadow-glow-sm" : "bg-ink-700",
                  )}
                />
                <span className="hidden group-hover:inline group-focus-within:inline min-[1720px]:inline">
                  {e.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
