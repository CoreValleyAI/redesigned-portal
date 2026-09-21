"use client";

/**
 * The tenant boundary, as a picture you can poke.
 *
 * A dot-matrix grid of pods split down the middle by the Cilium boundary.
 * Packets set off from one pod toward another along the grid lines: inside
 * a tenant they arrive and the target pod blinks; across the boundary they
 * are stopped dead at the line with a red flash — default-deny, drawn.
 *
 * Reactive: the pointer lights the pod nearest it and, as it moves, that pod
 * sends packets of its own (some of which will try the boundary and fail); a
 * click sends a burst. Two counters — allowed and denied — tick up, written
 * straight into the DOM so the canvas loop never re-renders React.
 *
 * Canvas 2D, one context, DPR-aware, sleeps off-screen. Static under
 * `prefers-reduced-motion`.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

const COLS = 16;
const ROWS = 9;
const HYDRO = "74, 222, 128";
const HOT = "167, 243, 203";
const DANGER = "248, 113, 113";
/** px/s along the grid. */
const SPEED = 260;
const SPAWN_MS = 420;
/** Share of ambient packets that try to cross the boundary. */
const CROSS_RATE = 0.28;

interface Pod {
  c: number;
  r: number;
  x: number;
  y: number;
  glow: number;
}
interface Packet {
  path: { x: number; y: number }[];
  seg: number;
  t: number;
  cross: boolean;
  state: "fly" | "deny" | "done";
  age: number;
  to: Pod;
  hot: boolean;
}

export function PolicyGrid({ className }: { className?: string }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const allowedRef = React.useRef<HTMLSpanElement>(null);
  const deniedRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let pods: Pod[] = [];
    let boundaryX = 0;
    let packets: Packet[] = [];
    let allowed = 0;
    let denied = 0;
    let pointer: { x: number; y: number } | null = null;
    let lastSpawn = 0;
    let lastPointerSpawn = 0;
    let frame = 0;
    let running = false;
    let last = 0;

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mx = w * 0.07;
      const my = h * 0.2;
      const sx = (w - 2 * mx) / (COLS - 1);
      const sy = (h - 2 * my) / (ROWS - 1);
      pods = [];
      for (let r2 = 0; r2 < ROWS; r2++) {
        for (let c = 0; c < COLS; c++) {
          pods.push({ c, r: r2, x: mx + c * sx, y: my + r2 * sy, glow: 0 });
        }
      }
      boundaryX = mx + sx * (COLS / 2 - 0.5);
    };

    const tenant = (p: Pod) => (p.c < COLS / 2 ? 0 : 1);
    const pick = (from: Pod, cross: boolean): Pod => {
      const side = cross ? 1 - tenant(from) : tenant(from);
      const pool = pods.filter((p) => tenant(p) === side && p !== from);
      return pool[Math.floor(Math.random() * pool.length)] ?? from;
    };
    const send = (from: Pod, cross: boolean, hot = false) => {
      const to = pick(from, cross);
      if (to === from) return;
      // Manhattan: horizontal leg first, then vertical. A crossing packet's
      // horizontal leg ends at the boundary.
      const path = cross
        ? [
            { x: from.x, y: from.y },
            { x: boundaryX, y: from.y },
          ]
        : [
            { x: from.x, y: from.y },
            { x: to.x, y: from.y },
            { x: to.x, y: to.y },
          ];
      packets.push({ path, seg: 0, t: 0, cross, state: "fly", age: 0, to, hot });
      from.glow = Math.max(from.glow, 0.6);
    };
    const nearest = (x: number, y: number) => {
      let best = pods[0]!;
      let bd = Infinity;
      for (const p of pods) {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      return best;
    };

    const draw = (dt: number, now: number) => {
      ctx.clearRect(0, 0, w, h);

      // Spawn ambient traffic.
      if (!reduced && now - lastSpawn > SPAWN_MS) {
        lastSpawn = now;
        const from = pods[Math.floor(Math.random() * pods.length)]!;
        send(from, Math.random() < CROSS_RATE);
      }

      // The boundary: a dashed hairline, lit where a packet is being denied.
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${HYDRO}, 0.38)`;
      ctx.beginPath();
      ctx.moveTo(boundaryX, h * 0.08);
      ctx.lineTo(boundaryX, h * 0.92);
      ctx.stroke();
      ctx.restore();

      // Grid lines, barely there, so the packets have rails to run on.
      ctx.strokeStyle = `rgba(${HYDRO}, 0.05)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let r = 0; r < ROWS; r++) {
        const p = pods[r * COLS]!;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pods[r * COLS + COLS - 1]!.x, p.y);
      }
      ctx.stroke();

      // Packets.
      for (const k of packets) {
        k.age += dt;
        if (k.state === "fly") {
          const a = k.path[k.seg]!;
          const b = k.path[k.seg + 1]!;
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          k.t += (SPEED * dt) / len;
          if (k.t >= 1) {
            k.t = 0;
            k.seg++;
            if (k.seg >= k.path.length - 1) {
              if (k.cross) {
                k.state = "deny";
                k.age = 0;
                denied++;
                if (deniedRef.current) deniedRef.current.textContent = String(denied);
              } else {
                k.state = "done";
                k.to.glow = 1;
                allowed++;
                if (allowedRef.current) allowedRef.current.textContent = String(allowed);
              }
              continue;
            }
          }
          const a2 = k.path[k.seg]!;
          const b2 = k.path[k.seg + 1]!;
          const x = a2.x + (b2.x - a2.x) * k.t;
          const y = a2.y + (b2.y - a2.y) * k.t;
          // Trail, then head.
          const tx = a2.x + (b2.x - a2.x) * Math.max(0, k.t - 0.18);
          const ty = a2.y + (b2.y - a2.y) * Math.max(0, k.t - 0.18);
          const g = ctx.createLinearGradient(tx, ty, x, y);
          g.addColorStop(0, `rgba(${HYDRO}, 0)`);
          g.addColorStop(1, `rgba(${HYDRO}, ${k.hot ? 0.9 : 0.6})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = k.hot ? 2 : 1.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.fillStyle = `rgba(${HOT}, ${k.hot ? 1 : 0.85})`;
          ctx.beginPath();
          ctx.arc(x, y, k.hot ? 2.6 : 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (k.state === "deny") {
          // Stopped at the line: a red ring blooms and a short stretch of
          // the boundary flashes solid red.
          const end = k.path[k.path.length - 1]!;
          const life = 0.7;
          const p = Math.min(1, k.age / life);
          ctx.strokeStyle = `rgba(${DANGER}, ${(1 - p) * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 3 + p * 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(${DANGER}, ${(1 - p) * 1})`;
          ctx.beginPath();
          ctx.arc(end.x, end.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(${DANGER}, ${(1 - p) * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(end.x, end.y - 14);
          ctx.lineTo(end.x, end.y + 14);
          ctx.stroke();
          if (p >= 1) k.state = "done";
        }
      }
      packets = packets.filter((k) => k.state !== "done");
      if (packets.length > 60) packets = packets.slice(-60);

      // Pods: a dim Hydro dot each, brighter with recent traffic and near
      // the pointer.
      for (const p of pods) {
        p.glow = Math.max(0, p.glow - dt * 1.4);
        let near = 0;
        if (pointer) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          near = d < 90 ? (1 - d / 90) ** 2 : 0;
        }
        const b = Math.min(1, 0.32 + p.glow * 0.7 + near * 0.8);
        if (p.glow > 0.15 || near > 0.3) {
          ctx.fillStyle = `rgba(${HYDRO}, ${Math.max(p.glow, near) * 0.22})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${b > 0.8 ? HOT : HYDRO}, ${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.9 + p.glow * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      draw(dt, now);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    layout();
    draw(0, performance.now());

    const ro = new ResizeObserver(() => {
      layout();
      if (!running) draw(0, performance.now());
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) start();
      else stop();
    });
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      const now = performance.now();
      if (now - lastPointerSpawn > 240) {
        lastPointerSpawn = now;
        send(nearest(pointer.x, pointer.y), Math.random() < 0.4, true);
      }
    };
    const onLeave = () => {
      pointer = null;
    };
    const onClick = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const from = nearest(e.clientX - r.left, e.clientY - r.top);
      for (let i = 0; i < 6; i++) send(from, i % 3 === 0, true);
    };
    // A tap on a touch screen sends the burst and lights the pods around
    // it for a moment; the pointer-follow parts stay mouse-only.
    let tapTimer = 0;
    const onTap = (e: PointerEvent) => {
      onClick(e);
      if (fine) return;
      const r = wrap.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => {
        pointer = null;
      }, 900);
    };
    if (!reduced) {
      wrap.addEventListener("pointerdown", onTap, { passive: true });
      if (fine) {
        wrap.addEventListener("pointermove", onMove, { passive: true });
        wrap.addEventListener("pointerleave", onLeave, { passive: true });
      }
    }
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onTap);
      window.clearTimeout(tapTimer);
    };
  }, []);

  const label =
    "font-mono text-[9.5px] tracking-label text-ink-500 uppercase";

  return (
    <div className={cn("glass-panel relative overflow-hidden rounded-md", className)}>
      <div ref={wrapRef} className="relative aspect-[16/10] w-full cursor-crosshair">
        <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden="true" />
        <p className="sr-only">
          Diagram of two tenants on a shared cluster. Packets inside a tenant
          arrive; packets that try to cross the Cilium boundary between them
          are denied.
        </p>

        {/* Tenant names, the boundary chip, and the counters. */}
        <span className={cn(label, "absolute top-3 left-3.5")}>
          tenant a · vcluster cv-himal
        </span>
        <span className={cn(label, "absolute top-3 right-3.5")}>
          tenant b · vcluster cv-annapurna
        </span>
        <span className="absolute top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-sm border border-line bg-carbon-900/90 px-2 py-1 font-mono text-[9.5px] tracking-label text-ink-300 uppercase">
          <span aria-hidden="true" className="size-1 rounded-pill bg-danger shadow-[0_0_6px_var(--danger)]" />
          cilium · default-deny
        </span>
        <span className={cn(label, "absolute bottom-3 left-3.5 flex gap-3 normal-case")}>
          <span>
            allowed <span ref={allowedRef} className="text-hydro">0</span>
          </span>
          <span>
            denied <span ref={deniedRef} className="text-danger">0</span>
          </span>
        </span>
        <span className={cn(label, "absolute right-3.5 bottom-3 hidden text-ink-600 sm:block")}>
          move to send · click for a burst
        </span>
      </div>
    </div>
  );
}
