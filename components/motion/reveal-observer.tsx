"use client";

/**
 * Arms the scroll reveals (app/styles/motion.css, "Reveal on enter").
 *
 * After each page renders, every [data-reveal] element that starts below
 * the fold is armed (hidden, ready to rise) and watched; when it enters the
 * viewport it is marked data-in and transitions into place. Elements already
 * on screen are left alone, so arriving on a page — including through a view
 * transition — never shows a blank first frame.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.motion === "reduce") return;
    const fold = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    // Elements armed by an earlier run (a re-render, or React's double
    // mount in development) are watched again; new ones are armed only if
    // they start below the fold. All reads first, then the writes.
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])");
    const watch: HTMLElement[] = [];
    const arm: HTMLElement[] = [];
    for (const el of els) {
      if (el.hasAttribute("data-armed")) watch.push(el);
      else if (el.getBoundingClientRect().top > fold) arm.push(el);
    }
    for (const el of arm) el.setAttribute("data-armed", "");
    for (const el of [...watch, ...arm]) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
