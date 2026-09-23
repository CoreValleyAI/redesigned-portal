"use client";

/**
 * Dot-matrix dissolve: the seam between two home-page sections.
 *
 * A full-bleed band of the brand's halftone dots straddles the boundary.
 * Dots are large at the band's centre line and shrink to nothing toward both
 * edges, so the previous section dissolves into dots and the next one
 * condenses out of them. As the seam scrolls through the viewport a crest of
 * brighter, larger dots sweeps across it from left to right — the same
 * material as the mountains, used as punctuation.
 *
 * Canvas 2D, redrawn only while the seam is on screen and the scroll position
 * changes. Colours come from lib/theme.ts, so it follows the theme. Under
 * reduced motion it draws one still frame.
 */

import * as React from "react";
import { canvasPalette, subscribeTheme } from "@/lib/theme";

const CELL = 12; // dot pitch, CSS px
const HEIGHT = 150; // band height, CSS px
/* How far the band reaches above the section boundary; the rest sits in the
   section's top padding, clear of whatever ends the previous section. */
const ABOVE = 40;

/* Cheap deterministic value noise along x, so the dissolve edge is ragged
   rather than a ruler-straight line. */
function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

export function DotSeam() {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let dpr = 1;
    let frame = 0;
    let inView = false;

    const resize = () => {
      w = canvas.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(HEIGHT * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* 0 as the seam enters at the bottom of the viewport, 1 as it leaves at
       the top. */
    const progress = () => {
      if (reduced) return 0.5;
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };

    const draw = () => {
      frame = 0;
      const pal = canvasPalette();
      const p = progress();
      ctx.clearRect(0, 0, w, HEIGHT);

      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(HEIGHT / CELL);
      // The crest travels a little past both edges so it enters and leaves.
      const crest = -0.15 + p * 1.3;
      const base = `rgba(${pal.hydro},`;
      const hot = `rgba(${pal.hot},`;
      const light = pal.subtractive;

      for (let j = 0; j < rows; j++) {
        const y = j * CELL + CELL / 2;
        // 1 on the centre line, 0 at the band's top and bottom edges.
        const t = 1 - Math.abs(y / HEIGHT - 0.5) * 2;
        for (let i = 0; i < cols; i++) {
          const x = i * CELL + (j % 2 ? CELL / 2 : 0);
          const u = x / Math.max(1, w);
          const n = noise(u * 9 + j * 0.37);
          // Ragged envelope: the band is thicker in some places than others.
          // Fades out toward both page edges, so the band reads as a seam
          // across the content column rather than a stripe across the window.
          const edge = Math.min(1, u / 0.14, (1 - u) / 0.14);
          let k = t * (0.55 + 0.75 * n) * (0.35 + 0.65 * Math.max(0, edge)) - 0.18;
          // The sweeping crest swells the dots it passes.
          const d = u - crest;
          const swell = Math.exp(-(d * d) / 0.006);
          k += swell * 0.55 * t;
          if (k <= 0.02) continue;
          k = Math.min(1, k);
          const r = (CELL / 2) * 0.72 * k;
          const a = (light ? 0.18 : 0.28) * k + swell * (light ? 0.35 : 0.5) * t;
          ctx.fillStyle = `${swell > 0.35 ? hot : base}${Math.min(1, a).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onScroll = () => {
      if (inView) request();
    };

    resize();
    draw();

    const io = new IntersectionObserver(([e]) => {
      inView = !!e?.isIntersecting;
      if (inView) request();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      request();
    });
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    const offTheme = subscribeTheme(request);

    return () => {
      io.disconnect();
      ro.disconnect();
      offTheme();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="dot-seam pointer-events-none absolute inset-x-0 -z-[1] block w-full"
      style={{ top: -ABOVE, height: HEIGHT }}
    />
  );
}
