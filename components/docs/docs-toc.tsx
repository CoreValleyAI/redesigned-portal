"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { DocHeading } from "@/lib/docs/markdown";

/**
 * "On this page" rail with scroll-spy: one IntersectionObserver over the
 * headings, tracking the last one that has crossed the top of the viewport.
 * Shown from xl up; the headings keep their ids either way.
 */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const [active, setActive] = React.useState<string>(() => headings[0]?.id ?? "");

  React.useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length || typeof IntersectionObserver === "undefined") return;

    // Initialise from the hash, then from whatever is in view.
    if (location.hash) setActive(location.hash.slice(1));

    const above = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.boundingClientRect.top < 120) above.add(e.target.id);
          else above.delete(e.target.id);
          if (e.isIntersecting && e.boundingClientRect.top >= 120) {
            // Entering from below: the previous heading is still current.
            above.delete(e.target.id);
          }
        }
        let last = headings[0]?.id ?? "";
        for (const h of headings) if (above.has(h.id)) last = h.id;
        setActive(last);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className="hidden xl:sticky xl:top-28 xl:block xl:self-start">
      <p className="cv-label text-[10px]">On this page</p>
      <ul className="mt-4 flex flex-col border-l border-line-subtle">
        {headings.map((h) => {
          const on = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1 text-[13px] leading-snug transition-colors duration-normal",
                  h.depth === 3 ? "pl-6" : "pl-3",
                  on
                    ? "border-l-hydro text-ink-100"
                    : "border-l-transparent text-ink-500 hover:text-ink-200",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
