"use client";

/**
 * Pointer-tracked glow for a group of cards.
 *
 * One listener on the container rather than one per card, and it writes CSS
 * custom properties instead of React state — so a mousemove never triggers a
 * render. Each child carrying `.cv-spotlight` gets `--mx`/`--my` in its own
 * local coordinates, which the utility in globals.css turns into a soft Hydro
 * bloom that follows the cursor across the card.
 *
 * Touch screens have no cursor, so scrolling drives the light: a card lights
 * as it crosses the middle of the screen (`data-lit`) and the bloom sweeps
 * across it. prefers-reduced-motion gets nothing — the cards render exactly
 * as they would without this wrapper.
 */
import * as React from "react";

export function SpotlightGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Touch screens: no cursor, so scrolling drives the light instead. A card
       lights while it crosses the middle of the screen, and the glow sweeps
       across it from left to right as it travels up. */
    if (!window.matchMedia("(pointer: fine)").matches) {
      let raf = 0;
      const sweep = () => {
        raf = 0;
        const vh = window.innerHeight;
        for (const card of el.querySelectorAll<HTMLElement>(".cv-spotlight")) {
          const r = card.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) {
            card.removeAttribute("data-lit");
            continue;
          }
          const centre = r.top + r.height / 2;
          const near = 1 - Math.min(1, Math.abs(centre - vh * 0.5) / (vh * 0.5));
          card.toggleAttribute("data-lit", near > 0.35);
          const travel = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
          card.style.setProperty("--mx", `${r.width * (0.1 + travel * 0.8)}px`);
          card.style.setProperty("--my", `${r.height * 0.35}px`);
        }
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(sweep);
      };
      sweep();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const e = lastEvent;
      if (!e) return;
      // Re-query each frame: the grid reflows at breakpoints, and caching the
      // rects would leave the glow lagging behind after a resize.
      const cards = el.querySelectorAll<HTMLElement>(".cv-spotlight");
      for (const card of cards) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };

    const onMove = (e: PointerEvent) => {
      lastEvent = e;
      // Coalesce to one write per frame.
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
