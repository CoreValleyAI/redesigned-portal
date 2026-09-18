"use client";

/**
 * The floor: a perspective grid in Hydro receding to a lit horizon, fixed
 * behind every marketing page. The content floats above it.
 *
 *  · The floor flows toward the viewer as the page scrolls — the row phase
 *    is tied to scrollY — and drifts slowly on its own when the page is
 *    still, so it is never a static picture.
 *  · The pointer parallaxes the vanishing point and lays a soft pool of
 *    light on the floor where it hovers.
 *  · Lines are brightest in the middle distance and thin out at both the
 *    horizon and the near edge, so nothing loud sits under the copy.
 *
 * Canvas 2D: ~30 strokes and a few hundred intersection dots per frame. The
 * loop pauses when the tab is hidden and draws once under reduced motion.
 */

import * as React from "react";

/** Horizon height as a fraction of the viewport. */
const HORIZON = 0.44;
/** Rows drawn from the near edge to the horizon. */
const ROWS = 26;
/** Vertical lines either side of the vanishing point. */
const COLS = 18;
const HYDRO = "74, 222, 128";
const HOT = "167, 243, 203";

export function GridFloor() {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let px = -1;
    let py = -1;
    let tx = 0; // pointer parallax, smoothed
    let frame = 0;
    let running = false;
    let last = 0;
    let drift = 0;
    // Gradients are built once per size, not per frame: a gradient object
    // per row and column every frame was most of the draw cost.
    let rowGrads: CanvasGradient[] = [];
    let colGrads: CanvasGradient[] = [];
    let rowAlpha: number[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      // 1.5 is enough for hairlines this faint, and a third fewer pixels.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hy = Math.round(h * HORIZON) + 0.5;
      rowGrads = [];
      rowAlpha = [];
      for (let i = 0; i < ROWS; i++) {
        const t = i / ROWS;
        // Bright in the middle distance, and gone well before the horizon:
        // the far rows bunch together, and any residual alpha there piles
        // up into a visible line.
        const fade = 1 - Math.min(1, Math.max(0, (t - 0.55) / 0.35));
        const a = 0.34 * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 1.4 * fade * fade;
        rowAlpha.push(a);
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, `rgba(${HYDRO}, 0)`);
        g.addColorStop(0.25, `rgba(${HYDRO}, ${a})`);
        g.addColorStop(0.75, `rgba(${HYDRO}, ${a})`);
        g.addColorStop(1, `rgba(${HYDRO}, 0)`);
        rowGrads.push(g);
      }
      colGrads = [];
      for (let j = -COLS; j <= COLS; j++) {
        const a = 0.24 * (1 - Math.min(1, Math.abs(j) / (COLS + 2)));
        const g = ctx.createLinearGradient(0, hy, 0, h);
        // Columns fade to nothing over the top third, so they never meet
        // at the vanishing point.
        g.addColorStop(0, `rgba(${HYDRO}, 0)`);
        g.addColorStop(0.3, `rgba(${HYDRO}, 0)`);
        g.addColorStop(0.55, `rgba(${HYDRO}, ${a})`);
        g.addColorStop(1, `rgba(${HYDRO}, ${a * 0.35})`);
        colGrads.push(g);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const hy = Math.round(h * HORIZON) + 0.5;
      const vx = w / 2 + tx;
      const depth = h - hy;
      // Row phase: scroll drives it, and a slow drift keeps it alive.
      const phase = ((window.scrollY * 0.006 + drift) % 1 + 1) % 1;


      // Rows. World distance d maps to screen y = hy + depth / d, so the
      // nearest row (d = 1) sits at the bottom edge and rows bunch toward
      // the horizon. Brightness peaks in the middle distance.
      const rows: { y: number; d: number; a: number }[] = [];
      for (let i = 0; i < ROWS; i++) {
        const d = 1 + (i + phase) * 0.55;
        const y = hy + depth / d;
        rows.push({ y, d, a: rowAlpha[i]! });
      }
      // A row also dims by how close it sits to the next one: where rows
      // bunch tighter than a few pixels they would otherwise merge into a
      // solid band. The density factor is kept on the row for the dots.
      ctx.lineWidth = 1;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]!;
        const next = rows[i + 1];
        const gap = next ? r.y - next.y : 40;
        const density = Math.min(1, Math.max(0, (gap - 3) / 16));
        r.a *= density;
        if (r.a < 0.01) continue;
        ctx.globalAlpha = density;
        ctx.strokeStyle = rowGrads[i]!;
        ctx.beginPath();
        ctx.moveTo(0, Math.round(r.y) + 0.5);
        ctx.lineTo(w, Math.round(r.y) + 0.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Columns: straight lines from the vanishing point to the near edge,
      // fading toward the horizon.
      const spread = depth * 0.42;
      for (let j = -COLS; j <= COLS; j++) {
        if (j === 0) continue;
        const xNear = vx + j * spread;
        ctx.strokeStyle = colGrads[j + COLS]!;
        ctx.beginPath();
        ctx.moveTo(vx, hy);
        ctx.lineTo(xNear, h);
        ctx.stroke();
      }

      // Intersection dots: the brand's dot matrix, laid on the floor.
      ctx.fillStyle = `rgba(${HOT}, 1)`;
      for (const r of rows) {
        if (r.a < 0.01) continue;
        const k = (r.y - hy) / depth; // 0 at horizon → 1 at near edge
        for (let j = -COLS; j <= COLS; j++) {
          const x = vx + j * spread * k;
          if (x < -4 || x > w + 4) continue;
          ctx.globalAlpha = Math.min(1, r.a * 1.8);
          ctx.fillRect(x - 0.75, r.y - 0.75, 1.5, 1.5);
        }
      }
      ctx.globalAlpha = 1;

      // Pointer: a pool of light on the floor.
      if (px >= 0 && py > hy) {
        const g = ctx.createRadialGradient(px, py, 0, px, py, 240);
        g.addColorStop(0, `rgba(${HYDRO}, 0.12)`);
        g.addColorStop(1, `rgba(${HYDRO}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(px - 240, Math.max(hy, py - 240), 480, 480);
      }
    };

    let lastDraw = 0;
    const tick = (now: number) => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      // 30 fps: the floor moves slowly, and every frame it paints is a frame
      // every glass pane above it has to re-filter.
      if (now - lastDraw < 31) return;
      lastDraw = now;
      const dt = Math.min(0.08, last ? (now - last) / 1000 : 0.033);
      last = now;
      drift += dt * 0.12;
      const want = px >= 0 ? (px - w / 2) * 0.06 : 0;
      tx += (want - tx) * Math.min(1, dt * 4);
      draw();
    };
    const start = () => {
      if (running || reduced || document.hidden) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    draw();
    start();

    const onResize = () => {
      resize();
      draw();
    };
    const onVis = () => (document.hidden ? stop() : start());
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
    };
    const onLeave = () => {
      px = -1;
      py = -1;
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    if (fine && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 block h-dvh w-screen transition-opacity duration-slow ease-standard"
    />
  );
}
