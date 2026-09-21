"use client";

/**
 * A GPU die with traces flowing outward to the systems around it.
 *
 * The chip sits at the centre; dotted traces leave its edges, bend once the
 * way a PCB trace does, and end at labelled nodes. Packets travel outward
 * along every trace — the die at work — and the pointer picks a trace: the
 * nearest one lights up, its packets quicken, its label sharpens, and the
 * die tilts a few pixels toward the cursor.
 *
 * Canvas 2D. Geometry is laid out once per resize; each frame moves packets
 * and redraws — a few hundred draw calls. Sleeps out of view and when the
 * tab is hidden; `prefers-reduced-motion` renders one static frame; coarse
 * pointers get no pointer coupling.
 */

import * as React from "react";

const HYDRO = "74,222,128";
const TEAL = "56,189,248";
const HOT = "167,243,203";
const INK = "232,236,239";

interface Pt {
  x: number;
  y: number;
}
interface Trace {
  pts: Pt[]; // chip edge → bend → node
  len: number;
  seg: number[]; // cumulative lengths
  label: string;
  teal: boolean;
  packets: { t: number; v: number }[];
  lit: number;
}

export function ChipGraph({
  labels,
  className,
}: {
  labels: string[];
  className?: string;
}) {
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
    let traces: Trace[] = [];
    let chip = { x: 0, y: 0, s: 0 };
    let px = -1e4;
    let py = -1e4;
    let tiltX = 0;
    let tiltY = 0;
    let running = false;
    let inView = false;
    let frame = 0;
    const t0 = performance.now();

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = Math.min(w, h) * 0.3;
      chip = { x: w * 0.5, y: h * 0.5, s };

      // Traces leave from points spread around the chip's perimeter and end
      // on an ellipse near the canvas edge, alternating sides so labels have
      // room. Each bends once, at 45°, like a routed trace.
      const n = labels.length;
      traces = labels.map((label, i) => {
        const a = (-Math.PI / 2 + (i / n) * Math.PI * 2 + 0.35) % (Math.PI * 2);
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        // Exit at the chip edge along this direction.
        const k = s / 2 / Math.max(Math.abs(ca), Math.abs(sa));
        const start = { x: chip.x + ca * k, y: chip.y + sa * k };
        // Nodes sit on an ellipse inset enough that a right-aligned label on
        // the left side still fits inside the canvas.
        const end = { x: chip.x + ca * (w * 0.34), y: chip.y + sa * (h * 0.4) };
        // Bend: go straight out of the edge first, then diagonal to the node.
        const horizontal = Math.abs(ca) > Math.abs(sa);
        const mid = horizontal
          ? { x: start.x + (end.x - start.x) * 0.45, y: start.y }
          : { x: start.x, y: start.y + (end.y - start.y) * 0.45 };
        const pts = [start, mid, end];
        const seg = [0];
        let len = 0;
        for (let j = 1; j < pts.length; j++) {
          len += Math.hypot(pts[j]!.x - pts[j - 1]!.x, pts[j]!.y - pts[j - 1]!.y);
          seg.push(len);
        }
        return {
          pts,
          len,
          seg,
          label,
          teal: i % 3 === 2,
          packets: Array.from({ length: 2 }, (_, p) => ({
            t: (p / 2 + i * 0.13) % 1,
            v: 0.09 + ((i * 7) % 5) * 0.012,
          })),
          lit: 0,
        };
      });
      if (!running) draw(performance.now());
    };

    const along = (tr: Trace, t: number): Pt => {
      const d = t * tr.len;
      for (let j = 1; j < tr.pts.length; j++) {
        if (d <= tr.seg[j]!) {
          const a = tr.pts[j - 1]!;
          const b = tr.pts[j]!;
          const u = (d - tr.seg[j - 1]!) / (tr.seg[j]! - tr.seg[j - 1]! || 1);
          return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
        }
      }
      return tr.pts[tr.pts.length - 1]!;
    };

    const distToTrace = (tr: Trace, x: number, y: number) => {
      let best = 1e9;
      for (let j = 1; j < tr.pts.length; j++) {
        const a = tr.pts[j - 1]!;
        const b = tr.pts[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const l2 = dx * dx + dy * dy || 1;
        const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2));
        const d = Math.hypot(x - (a.x + dx * u), y - (a.y + dy * u));
        if (d < best) best = d;
      }
      return best;
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Pointer: nearest trace lights, die tilts toward the cursor.
      let nearest = -1;
      let nd = 70;
      for (let i = 0; i < traces.length; i++) {
        const d = distToTrace(traces[i]!, px, py);
        if (d < nd) {
          nd = d;
          nearest = i;
        }
      }
      const over = Math.abs(px - chip.x) < chip.s && Math.abs(py - chip.y) < chip.s;
      const wantX = over ? (px - chip.x) * 0.06 : 0;
      const wantY = over ? (py - chip.y) * 0.06 : 0;
      tiltX += (wantX - tiltX) * 0.1;
      tiltY += (wantY - tiltY) * 0.1;

      // ── Traces ────────────────────────────────────────────────────────────
      ctx.lineWidth = 1;
      for (let i = 0; i < traces.length; i++) {
        const tr = traces[i]!;
        tr.lit += ((i === nearest ? 1 : 0) - tr.lit) * 0.12;
        const rgb = tr.teal ? TEAL : HYDRO;
        ctx.setLineDash([2, 5]);
        ctx.strokeStyle = `rgba(${rgb},${0.22 + tr.lit * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(tr.pts[0]!.x + tiltX, tr.pts[0]!.y + tiltY);
        for (let j = 1; j < tr.pts.length; j++) ctx.lineTo(tr.pts[j]!.x, tr.pts[j]!.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node + label.
        const end = tr.pts[tr.pts.length - 1]!;
        ctx.fillStyle = `rgba(${rgb},${0.6 + tr.lit * 0.4})`;
        ctx.beginPath();
        ctx.arc(end.x, end.y, 2.4 + tr.lit * 1.2, 0, Math.PI * 2);
        ctx.fill();
        if (tr.lit > 0.05) {
          ctx.fillStyle = `rgba(${rgb},${tr.lit * 0.25})`;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.font = `500 11px ui-monospace, "JetBrains Mono", Menlo, monospace`;
        ctx.textBaseline = "middle";
        const right = end.x >= chip.x;
        ctx.textAlign = right ? "left" : "right";
        ctx.fillStyle = `rgba(${INK},${0.45 + tr.lit * 0.55})`;
        ctx.fillText(tr.label, end.x + (right ? 9 : -9), end.y);

        // Packets flow outward.
        for (const pk of tr.packets) {
          if (!reduced) pk.t = (pk.t + pk.v * (1 + tr.lit * 1.6) / 60) % 1;
          const p = along(tr, pk.t);
          const fade = Math.sin(pk.t * Math.PI);
          ctx.fillStyle = `rgba(${pk.t > 0.8 ? HOT : rgb},${(0.5 + tr.lit * 0.5) * fade})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8 + tr.lit * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── The chip ──────────────────────────────────────────────────────────
      const s = chip.s;
      const cx = chip.x + tiltX;
      const cy = chip.y + tiltY;
      // Pins.
      ctx.strokeStyle = `rgba(${INK},0.35)`;
      ctx.lineWidth = 1;
      const pins = 9;
      for (let i = 0; i < pins; i++) {
        const o = -s / 2 + ((i + 0.5) / pins) * s;
        ctx.beginPath();
        ctx.moveTo(cx + o, cy - s / 2 - 8);
        ctx.lineTo(cx + o, cy - s / 2);
        ctx.moveTo(cx + o, cy + s / 2);
        ctx.lineTo(cx + o, cy + s / 2 + 8);
        ctx.moveTo(cx - s / 2 - 8, cy + o);
        ctx.lineTo(cx - s / 2, cy + o);
        ctx.moveTo(cx + s / 2, cy + o);
        ctx.lineTo(cx + s / 2 + 8, cy + o);
        ctx.stroke();
      }
      // Body.
      const glow = over ? 0.55 : 0.28;
      ctx.fillStyle = "rgba(17,22,31,0.92)";
      ctx.strokeStyle = `rgba(${HYDRO},${glow})`;
      ctx.lineWidth = 1;
      roundRect(ctx, cx - s / 2, cy - s / 2, s, s, 6);
      ctx.fill();
      ctx.stroke();
      if (over) {
        ctx.shadowColor = `rgba(${HYDRO},0.45)`;
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // Die: a grid of cells that flicker like a scheduler at work.
      const inset = s * 0.16;
      const cells = 8;
      const cw = (s - inset * 2) / cells;
      for (let r = 0; r < cells; r++) {
        for (let c = 0; c < cells; c++) {
          const seed = (r * 31 + c * 17) % 23;
          const on = 0.35 + 0.65 * Math.max(0, Math.sin(t * (0.6 + seed * 0.05) + seed));
          ctx.fillStyle = `rgba(${HYDRO},${(0.08 + on * 0.5) * (over ? 1.25 : 1)})`;
          ctx.fillRect(
            cx - s / 2 + inset + c * cw + 1,
            cy - s / 2 + inset + r * cw + 1,
            cw - 2,
            cw - 2,
          );
        }
      }
      // Label on the die.
      ctx.font = `500 10px ui-monospace, "JetBrains Mono", Menlo, monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = `rgba(${INK},0.55)`;
      ctx.fillText("h200 · 141 gb", cx - s / 2 + 8, cy - s / 2 + 6);
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced || !inView || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
    };
    const onLeave = () => {
      px = -1e4;
      py = -1e4;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = !!entry?.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    // Touch: a tap lights the nearest trace and tilts the die toward the
    // finger for a moment.
    let tapTimer = 0;
    const onTap = (e: PointerEvent) => {
      if (fine) return;
      onPointer(e);
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(onLeave, 1100);
    };
    canvas.addEventListener("pointerdown", onTap, { passive: true });
    if (fine) {
      canvas.addEventListener("pointermove", onPointer, { passive: true });
      canvas.addEventListener("pointerleave", onLeave, { passive: true });
    }

    return () => {
      canvas.removeEventListener("pointerdown", onTap);
      window.clearTimeout(tapTimer);
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [labels]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
