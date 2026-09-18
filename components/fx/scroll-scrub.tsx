"use client";

/**
 * Writes the scroll progress of its parent element to a CSS custom property
 * (`--sp`, 0 → 1) so CSS can scrub transforms, heights and opacities against
 * scroll position. Renders nothing.
 *
 *  · mode="exit"  progress of the parent scrolling OUT: 0 while its top is at
 *                 the top of the viewport, 1 once it has scrolled its own
 *                 height away. For a hero.
 *  · mode="view"  progress of the parent passing THROUGH the viewport: 0 as
 *                 its top enters at the bottom, 1 as its bottom leaves at the
 *                 top. For anything mid-page.
 *
 * One passive scroll listener, one rAF, one style write, and only while the
 * parent is on screen. Under `prefers-reduced-motion` nothing is written, so
 * every scrubbed rule falls back to its resting value.
 */

import * as React from "react";

export function ScrollScrub({ mode = "view" }: { mode?: "exit" | "view" }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let inView = true;
    const write = () => {
      frame = 0;
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "exit") {
        p = -r.top / Math.max(1, r.height);
      } else {
        p = (vh - r.top) / Math.max(1, r.height + vh);
      }
      p = Math.min(1, Math.max(0, p));
      host.style.setProperty("--sp", p.toFixed(3));
    };
    const onScroll = () => {
      if (inView && !frame) frame = requestAnimationFrame(write);
    };
    const io = new IntersectionObserver(([e]) => {
      inView = !!e?.isIntersecting;
      if (inView) onScroll();
    });
    io.observe(host);
    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      host.style.removeProperty("--sp");
    };
  }, [mode]);

  return <span ref={ref} hidden aria-hidden="true" />;
}
