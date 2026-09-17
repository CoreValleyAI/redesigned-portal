"use client";

/**
 * The hero backdrop: an interconnect fabric.
 *
 * WHY THIS REPLACED THE MOUNTAIN CANVAS
 * The previous hero painted a layered Himalayan range. It was well made, and
 * it was answering the wrong question — a visitor evaluating GPU capacity
 * reads a mountain range as decoration, and the page spent its single most
 * expensive visual on geography rather than on the product. This paints what
 * is actually being sold: nodes, links, and traffic moving between them.
 *
 * WHAT IS DRAWN
 *  · A jittered lattice of nodes. Perfectly regular spacing reads as a
 *    screensaver, so each node is offset by a deterministic hash — the same
 *    layout every load, never a grid.
 *  · Links between near neighbours only, alpha-weighted by distance, so the
 *    mesh thins out naturally instead of ending at a hard radius.
 *  · Packets travelling along links. This is the whole point: a static mesh
 *    is a diagram, a mesh with traffic is a fabric under load.
 *  · A scheduler sweep — a soft vertical band crossing the field, lighting
 *    nodes as it passes and emitting a burst of packets behind it. It gives
 *    the animation a period, so the hero has a rhythm rather than uniform
 *    twitching.
 *  · Pointer coupling: nodes near the cursor brighten and lean toward it,
 *    and links inside the radius carry more traffic.
 *
 * PERFORMANCE
 *  · Sleeps when scrolled out of view (IntersectionObserver) and when the
 *    tab is hidden — a hero canvas that keeps running while the user reads
 *    the pricing page is a battery bug.
 *  · Device pixel ratio is capped at 2. On a 3x phone an uncapped canvas is
 *    2.25x the fill rate for no visible gain.
 *  · Reduced motion renders exactly one frame and stops, so the composition
 *    is still there — it just does not move.
 */

import * as React from "react";

/* ── Tunables ────────────────────────────────────────────────────────────── */
const SPACING = 118; // px between lattice points before jitter
const JITTER = 0.42; // fraction of SPACING each node is displaced by
const LINK_DIST = 1.3; // link radius, in multiples of SPACING
/** Cold links are quantised into this many alpha buckets — see draw(). */
const LINK_BUCKETS = 5;
const MAX_DPR = 2;
const POINTER_RADIUS = 260; // px of pointer influence
const SWEEP_PERIOD = 7600; // ms for one scheduler pass

/* Ink for the resting mesh, Hydro for whatever is lit — both straight from
   the brand palette. */
const INK = "232,236,239";
const HYDRO = "74,222,128";

/** Deterministic hash in [0,1). Same layout on every load, and on the server. */
function hash(i: number, salt: number): number {
  let t = (i + 1) * 374761393 + salt * 668265263;
  t = (t ^ (t >>> 13)) * 1274126177;
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
}

interface Node {
  /** Lattice home position. Nodes always spring back to this. */
  hx: number;
  hy: number;
  /** Current position. */
  x: number;
  y: number;
  /** Phase offset so the ambient breathing is not synchronised. */
  phase: number;
  /** 0-1 activation: raised by the sweep and by the pointer, decays. */
  heat: number;
  /** Larger nodes read as switches; the rest are endpoints. */
  hub: boolean;
}

interface Link {
  a: number;
  b: number;
  /** 0-1, from distance. Drives both line alpha and packet frequency. */
  w: number;
}

interface Packet {
  link: number;
  /** 0-1 along the link. */
  t: number;
  speed: number;
  /** Packets run both ways; -1 travels b→a. */
  dir: 1 | -1;
  hot: boolean;
}

export function ComputeFabric({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    /* Declared up here because resize() reads it — see the repaint guard in
       resize(). The loop below is the only writer. */
    let running = false;

    let nodes: Node[] = [];
    let links: Link[] = [];
    let packets: Packet[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    /* Pointer is tracked in canvas-local coordinates and lerped toward the
       real position, so a fast flick drags the field rather than teleporting
       it. Parked far off-canvas until the pointer is actually seen. */
    let pxTarget = -9999;
    let pyTarget = -9999;
    let px = -9999;
    let py = -9999;

    // ── Build ───────────────────────────────────────────────────────────────
    const build = () => {
      nodes = [];
      links = [];
      packets = [];

      const cols = Math.ceil(w / SPACING) + 2;
      const rows = Math.ceil(h / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          // Odd rows are offset half a cell: a hex-ish lattice links more
          // evenly than a square one, which produces obvious axis-aligned
          // corridors through the mesh.
          const ox = (r % 2) * SPACING * 0.5;
          const hx = (c - 1) * SPACING + ox + (hash(i, 1) - 0.5) * SPACING * JITTER;
          const hy = (r - 1) * SPACING + (hash(i, 2) - 0.5) * SPACING * JITTER;
          nodes.push({
            hx,
            hy,
            x: hx,
            y: hy,
            phase: hash(i, 3) * Math.PI * 2,
            heat: 0,
            hub: hash(i, 4) > 0.87,
          });
        }
      }

      const maxDist = SPACING * LINK_DIST;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          // `!` throughout this file's hot paths: every index is produced by
          // a loop bound to the same array's length, so the access is provably
          // in range and the alternative is an undefined check per node per
          // frame. Correctness is carried by the loop, not by the compiler.
          const dx = nodes[i]!.hx - nodes[j]!.hx;
          const dy = nodes[i]!.hy - nodes[j]!.hy;
          const d = Math.hypot(dx, dy);
          if (d > maxDist) continue;
          links.push({ a: i, b: j, w: 1 - d / maxDist });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // A hero can be 0-height for a frame during layout; building a lattice
      // then produces a single node and a permanently empty field.
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();

      /* Assigning canvas.width ALWAYS clears the bitmap, so a resize has to
         repaint. While the rAF loop is running the next frame covers it — but
         under reduced motion there is no next frame, and ResizeObserver fires
         once on observe. The effect was that every reduced-motion visitor got
         a permanently blank hero: built, cleared, never drawn. */
      if (!running) draw(performance.now());
    };

    // ── Frame ───────────────────────────────────────────────────────────────
    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      px += (pxTarget - px) * 0.12;
      py += (pyTarget - py) * 0.12;

      const t = now / 1000;
      const sweepPos = ((now % SWEEP_PERIOD) / SWEEP_PERIOD) * (w + 400) - 200;

      // ── Nodes: ambient breathing, sweep heat, pointer lean ────────────────
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;

        const drift = reduced ? 0 : 3.2;
        let x = n.hx + Math.sin(t * 0.34 + n.phase) * drift;
        let y = n.hy + Math.cos(t * 0.29 + n.phase * 1.3) * drift;

        // Scheduler sweep: a 96px-wide band of activation. Wider than this
        // and a third of the mesh is lit at any moment, which stops reading as
        // a sweep and starts reading as a tint over the whole hero.
        const sweepD = Math.abs(x - sweepPos);
        if (sweepD < 96) n.heat = Math.max(n.heat, 1 - sweepD / 96);

        // Pointer: brighten, and lean toward the cursor by up to 14px. Leaning
        // toward (not away) makes the field feel attracted to attention; the
        // repel version reads as the page flinching.
        const dx = px - x;
        const dy = py - y;
        const pd = Math.hypot(dx, dy);
        if (pd < POINTER_RADIUS) {
          const f = 1 - pd / POINTER_RADIUS;
          n.heat = Math.max(n.heat, f * 0.8);
          const pull = f * f * 14;
          x += (dx / (pd || 1)) * pull;
          y += (dy / (pd || 1)) * pull;
        }

        n.x = x;
        n.y = y;
        n.heat *= 0.94;
      }

      /* ── Links ─────────────────────────────────────────────────────────────
         A canvas stroke() is a draw call, and the mesh holds several hundred
         links. Issuing one per link caps the field at a few hundred edges
         before the frame budget goes.

         So: the cold majority — every link whose endpoints are not lit — is
         quantised into LINK_BUCKETS alpha steps and accumulated into one
         Path2D per bucket, which is five stroke calls for the entire mesh.
         The eye cannot resolve a 2% alpha difference on a 1px hairline, so
         the quantisation is free. Only lit links, of which there are a
         handful per frame, are drawn individually. */
      ctx.lineWidth = 1;
      const cold: Path2D[] = Array.from({ length: LINK_BUCKETS }, () => new Path2D());
      let anyCold = false;

      for (const l of links) {
        const a = nodes[l.a]!;
        const b = nodes[l.b]!;
        const heat = Math.max(a.heat, b.heat);

        if (heat > 0.16) {
          // Green only past 0.62 — a link has to be genuinely under the sweep
          // or under the cursor to take colour, not merely warm.
          ctx.strokeStyle = `rgba(${heat > 0.62 ? HYDRO : INK},${
            l.w * 0.14 + heat * l.w * 0.46
          })`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          continue;
        }

        const bucket = Math.min(
          LINK_BUCKETS - 1,
          (l.w * LINK_BUCKETS) | 0,
        );
        cold[bucket]!.moveTo(a.x, a.y);
        cold[bucket]!.lineTo(b.x, b.y);
        anyCold = true;
      }

      if (anyCold) {
        for (let i = 0; i < LINK_BUCKETS; i++) {
          // Bucket centre, scaled to the same 0-0.1 range as the lit branch.
          const alpha = ((i + 0.5) / LINK_BUCKETS) * 0.13;
          if (alpha < 0.012) continue;
          ctx.strokeStyle = `rgba(${INK},${alpha})`;
          ctx.stroke(cold[i]!);
        }
      }

      // ── Packets ───────────────────────────────────────────────────────────
      if (!reduced) {
        // Spawn: biased toward hot links, so traffic visibly follows the
        // sweep and the cursor instead of being uniform static.
        if (packets.length < 90 && links.length) {
          for (let k = 0; k < 3; k++) {
            const li = (Math.random() * links.length) | 0;
            const l = links[li]!;
            const heat = Math.max(nodes[l.a]!.heat, nodes[l.b]!.heat);
            if (Math.random() > 0.022 + heat * 0.28) continue;
            packets.push({
              link: li,
              t: 0,
              speed: 0.0038 + Math.random() * 0.0055,
              dir: Math.random() > 0.5 ? 1 : -1,
              hot: heat > 0.55,
            });
          }
        }

        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i]!;
          p.t += p.speed;
          if (p.t >= 1) {
            packets.splice(i, 1);
            continue;
          }
          const l = links[p.link];
          if (!l) {
            packets.splice(i, 1);
            continue;
          }
          const a = nodes[p.dir === 1 ? l.a : l.b]!;
          const b = nodes[p.dir === 1 ? l.b : l.a]!;
          const x = a.x + (b.x - a.x) * p.t;
          const y = a.y + (b.y - a.y) * p.t;
          // Fade in and out at the endpoints so packets appear to enter and
          // leave a node rather than blinking into existence mid-link.
          const fade = Math.sin(p.t * Math.PI);
          ctx.fillStyle = `rgba(${p.hot ? HYDRO : INK},${fade * (p.hot ? 0.85 : 0.5)})`;
          ctx.beginPath();
          ctx.arc(x, y, p.hot ? 1.7 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Node glyphs, drawn last so they sit above their own links ─────────
      for (const n of nodes) {
        const r = n.hub ? 2.1 : 1.3;
        const base = n.hub ? 0.42 : 0.2;
        const a = base + n.heat * 0.58;

        if (n.heat > 0.55) {
          // Halo on an active node. Cheap because only a handful of nodes
          // clear the threshold in any given frame.
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 15);
          g.addColorStop(0, `rgba(${HYDRO},${(n.heat - 0.55) * 0.5})`);
          g.addColorStop(1, `rgba(${HYDRO},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${n.heat > 0.68 ? HYDRO : INK},${a})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Hubs get a ring, so the mesh reads as switches and endpoints rather
        // than as one undifferentiated dot field.
        if (n.hub) {
          ctx.strokeStyle = `rgba(${INK},${0.14 + n.heat * 0.34})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 5.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    // ── Loop, gated on visibility ───────────────────────────────────────────
    let frame = 0;
    /* Two independent reasons to sleep — scrolled away, and tab hidden — so
       both are tracked and the loop runs only when neither applies. Deriving
       "is it visible" from the observer at wake-up time instead would ask
       IntersectionObserver a question it does not answer synchronously. */
    let inView = false;

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
      const r = canvas.getBoundingClientRect();
      pxTarget = e.clientX - r.left;
      pyTarget = e.clientY - r.top;
    };
    const onPointerLeave = () => {
      pxTarget = -9999;
      pyTarget = -9999;
    };

    resize();
    draw(performance.now()); // paint frame zero before any rAF, so no flash

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    if (fine) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      /* Masked on both axes: the fabric has to dissolve before it reaches the
         headline, or the mesh competes with the type it sits behind. */
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        WebkitMaskImage:
          "radial-gradient(98% 88% at 74% 38%, #000 0%, rgba(0,0,0,0.5) 46%, transparent 82%)",
        maskImage:
          "radial-gradient(98% 88% at 74% 38%, #000 0%, rgba(0,0,0,0.5) 46%, transparent 82%)",
      }}
    />
  );
}
