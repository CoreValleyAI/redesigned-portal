"use client";

/**
 * A reactive dot matrix built from any image.
 *
 * The source image is rasterised at grid resolution — one pixel per cell, so
 * each cell holds the average coverage of its patch — and every cell above
 * the threshold becomes a Hydro dot. The dots then behave like a physical
 * field:
 *
 *   · ASSEMBLE. On first view the dots start scattered and travel to their
 *     places in a sweep across the image, on the design system's ease-out —
 *     the mark coming online, one column at a time.
 *   · REACT. The pointer pushes nearby dots aside and lights them; they
 *     spring back on the standard curve when it leaves. Coarse pointers and
 *     reduced motion get the finished, static image.
 *   · BREATHE. Each dot flickers on its own phase, like the ridgeline asset.
 *
 * Canvas 2D, not WebGL: a few thousand sprites blitted from one pre-rendered
 * glow is well inside a 2D context's budget, and it composes over any ground.
 * Sleeps out of view and when the tab is hidden.
 */

import * as React from "react";

interface Dot {
  hx: number;
  hy: number;
  x: number;
  y: number;
  /** 0–1 coverage of the cell, drives base size and brightness. */
  w: number;
  phase: number;
  /** Assemble start offset, 0–1 across the sweep. */
  order: number;
  sx: number;
  sy: number;
}

const HYDRO = "74,222,128";

/** Small deterministic PRNG, so a generated field is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A generated ridgeline: a skyline of peaks with steep flanks and rounded
 * summits — exp(−(d/w)^1.35) has a zero slope at the top and falls away fast
 * — filled with dots that brighten toward the crest and fade toward the
 * base, the way the brand's ridgeline asset does. Coverage 0–1 per cell.
 */
function ridgelineCoverage(cols: number, rows: number, seed: number) {
  const rnd = mulberry32(seed);
  const n = 8;
  const peaks: { x: number; h: number; w: number }[] = [];
  for (let i = 0; i < n; i++) {
    peaks.push({
      x: (i + 0.5 + (rnd() - 0.5) * 0.7) / n,
      h: 0.42 + rnd() * 0.5,
      w: 0.03 + rnd() * 0.045,
    });
  }
  // One summit dominates, right of centre.
  const hero = peaks[5]!;
  hero.h = 0.96;
  hero.w = 0.07;

  // Each mountain is a narrow, steep summit standing on a broad skirt: the
  // summit gives the sharp profile, the skirt joins it to its neighbours so
  // the skyline reads as a range rather than a row of spikes.
  const sky = (x: number) => {
    let s = 0.2 + 0.05 * Math.sin(x * 23.0 + seed);
    for (const p of peaks) {
      const d = Math.abs(x - p.x);
      const summit = p.h * Math.exp(-Math.pow(d / p.w, 1.35));
      const skirt = 0.55 * p.h * Math.exp(-Math.pow(d / (p.w * 3.2), 1.7));
      s = Math.max(s, summit, skirt);
    }
    return s;
  };

  const cov = new Float32Array(cols * rows);
  for (let c = 0; c < cols; c++) {
    const x = (c + 0.5) / cols;
    const h = sky(x);
    const jitter = 0.85 + 0.3 * rnd();
    for (let r = 0; r < rows; r++) {
      const y = 1 - (r + 0.5) / rows;
      if (y > h) continue;
      const t = y / h;
      cov[r * cols + c] = (0.22 + 0.78 * Math.pow(t, 1.6)) * jitter;
    }
  }
  return cov;
}

export function DotMatrix({
  src,
  generate,
  seed = 7,
  cell = 10,
  threshold = 0.18,
  /** Where the image sits inside the canvas when aspect ratios differ. */
  align = "center",
  /** Max pointer influence radius in px. */
  radius = 110,
  /** How far a dot is pushed at the pointer's centre, px. */
  push = 22,
  /** Peak dot alpha for full-coverage cells. */
  intensity = 0.9,
  /**
   * Exponent applied to normalised coverage. 1 is linear; below 1 lifts the
   * faint cells, which is what a source like the ridgeline needs — its
   * silhouette is drawn in dots that fade toward the summits.
   */
  gamma = 1,
  /**
   * Amplitude of a slow wave of brightness travelling down the field in
   * horizontal bands — for a source with rows, like rack trays, it reads as
   * load moving through the hardware. 0 disables it.
   */
  pulse = 0,
  assemble = true,
  className,
  style,
}: {
  /** Image to sample. Ignored when `generate` is set. */
  src?: string;
  /** Build the field procedurally instead of from an image. */
  generate?: "ridgeline";
  seed?: number;
  cell?: number;
  threshold?: number;
  align?: "center" | "bottom";
  radius?: number;
  push?: number;
  intensity?: number;
  gamma?: number;
  pulse?: number;
  assemble?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let img: HTMLImageElement | null = null;
    let sprite: HTMLCanvasElement | null = null;
    let running = false;
    let inView = false;
    let frame = 0;
    let t0 = 0;
    let assembled = !assemble || reduced;

    // Pointer in canvas space, parked far away until seen.
    let px = -1e4;
    let py = -1e4;

    // One glow sprite, drawn once, blitted per dot. A radial gradient per dot
    // per frame would be the whole frame budget.
    const buildSprite = () => {
      const s = document.createElement("canvas");
      const r = 16 * dpr;
      s.width = s.height = r * 2;
      const g = s.getContext("2d")!;
      const grad = g.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, `rgba(${HYDRO},1)`);
      grad.addColorStop(0.28, `rgba(${HYDRO},0.9)`);
      grad.addColorStop(0.5, `rgba(${HYDRO},0.28)`);
      grad.addColorStop(1, `rgba(${HYDRO},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, r * 2, r * 2);
      sprite = s;
    };

    // Coverage per cell from an image: supersample, then box-average. A
    // drawImage straight to grid size samples a 2×2 neighbourhood per cell,
    // which turns a sparse source into aliased stripes; drawing at 4× with
    // high-quality resampling and averaging each 4×4 block gives every source
    // pixel a share of its cell. Alpha weighted by luminance so a faint
    // stroke counts less.
    const sampleImage = (cols: number, rows: number) => {
      if (!img) return null;
      const ir = img.naturalWidth / img.naturalHeight;
      let gw = cols;
      let gh = Math.round(cols / ir);
      if (gh > rows) {
        gh = rows;
        gw = Math.round(rows * ir);
      }
      const ox = Math.floor((cols - gw) / 2);
      const oy = align === "bottom" ? rows - gh : Math.floor((rows - gh) / 2);

      const S = 4;
      const off = document.createElement("canvas");
      off.width = cols * S;
      off.height = rows * S;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.imageSmoothingEnabled = true;
      o.imageSmoothingQuality = "high";
      o.drawImage(img, ox * S, oy * S, gw * S, gh * S);
      const data = o.getImageData(0, 0, cols * S, rows * S).data;

      const cov = new Float32Array(cols * rows);
      const stride = cols * S;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let sum = 0;
          for (let y = 0; y < S; y++) {
            for (let x = 0; x < S; x++) {
              const i = ((r * S + y) * stride + (c * S + x)) * 4;
              const a = data[i + 3]! / 255;
              const lum =
                (data[i]! * 0.3 + data[i + 1]! * 0.59 + data[i + 2]! * 0.11) / 255;
              sum += a * (0.35 + 0.65 * lum);
            }
          }
          cov[r * cols + c] = sum / (S * S);
        }
      }
      return cov;
    };

    // Place the dots from a coverage grid.
    const build = () => {
      if (width < 2 || height < 2) return;
      if (!generate && !img) return;
      const cols = Math.max(1, Math.floor(width / cell));
      const rows = Math.max(1, Math.floor(height / cell));

      const cov =
        generate === "ridgeline"
          ? ridgelineCoverage(cols, rows, seed)
          : sampleImage(cols, rows);
      if (!cov) return;

      // Normalise to the brightest cell so a sparse source still yields a
      // full-strength field.
      let peak = 0;
      for (let i = 0; i < cov.length; i++) if (cov[i]! > peak) peak = cov[i]!;
      if (peak <= 0) return;

      const next: Dot[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const raw = cov[r * cols + c]! / peak;
          if (raw < threshold) continue;
          const w = Math.pow(raw, gamma);
          const hx = (c + 0.5) * cell;
          const hy = (r + 0.5) * cell;
          // Scatter start: anywhere on the canvas, biased outward.
          const ang = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * Math.max(width, height) * 0.5;
          next.push({
            hx,
            hy,
            x: assembled ? hx : hx + Math.cos(ang) * dist,
            y: assembled ? hy : hy + Math.sin(ang) * dist,
            w,
            phase: Math.random() * Math.PI * 2,
            order: (c / cols) * 0.75 + Math.random() * 0.25,
            sx: hx + Math.cos(ang) * dist,
            sy: hy + Math.sin(ang) * dist,
          });
        }
      }
      dots = next;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildSprite();
      build();
      if (!running) draw(performance.now());
    };

    // Design-system ease-out (0.16, 1, 0.3, 1), approximated for a scalar.
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3.2);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!sprite) return;
      const t = (now - t0) / 1000;
      const sr = sprite.width / dpr;
      ctx.globalCompositeOperation = "lighter";

      let settled = true;
      for (const d of dots) {
        // Assemble: each dot travels home on its own delayed ease.
        let hx = d.hx;
        let hy = d.hy;
        if (!assembled) {
          const p = Math.min(1, Math.max(0, (t - d.order * 0.9) / 1.1));
          const e = easeOut(p);
          hx = d.sx + (d.hx - d.sx) * e;
          hy = d.sy + (d.hy - d.sy) * e;
          if (p < 1) settled = false;
        }

        // Pointer: push aside within the radius, light up.
        let lit = 0;
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const f = 1 - dist / radius;
          lit = f;
          const k = (f * f * push) / (dist || 1);
          hx += dx * k;
          hy += dy * k;
        }

        // Spring toward the target on the standard curve — no overshoot.
        d.x += (hx - d.x) * 0.16;
        d.y += (hy - d.y) * 0.16;

        const flick = reduced ? 1 : 0.78 + 0.22 * Math.sin(t * 1.7 + d.phase);
        const band =
          pulse > 0 && !reduced ? 1 + pulse * Math.sin(t * 1.1 - d.hy * 0.045) : 1;
        const a = Math.min(1, d.w * intensity * flick * band + lit * 0.7);
        const size = cell * (0.55 + 0.45 * d.w) * (1 + lit * 0.9);
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, d.x - size, d.y - size, size * 2, size * 2);
        void sr;
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (settled && !assembled) assembled = true;
    };

    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced || !inView || document.hidden) return;
      running = true;
      if (!t0) t0 = performance.now();
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

    if (!generate && src) {
      img = new Image();
      img.decoding = "async";
      img.onload = () => {
        resize();
        if (inView) start();
      };
      // A missing asset leaves the canvas empty; the ground behind it is Carbon.
      img.src = src;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    if (fine && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave, { passive: true });
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      img = null;
    };
  }, [src, generate, seed, cell, threshold, align, radius, push, intensity, gamma, pulse, assemble]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
