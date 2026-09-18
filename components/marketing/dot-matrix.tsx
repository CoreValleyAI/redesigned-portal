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
 *
 * RENDERING. WebGL point sprites: every dot is one vertex carrying its
 * position, size and brightness, the whole field is one buffer upload and
 * one draw call per frame, and the glow is computed in the fragment shader
 * with additive blending. The physics stays on the CPU — a few thousand
 * springs is nothing — and writes straight into the vertex array. This
 * replaced a Canvas 2D version that blitted a sprite per dot with `lighter`
 * compositing; at a few thousand dots that was the footer's lag.
 *
 * The loop sleeps once the field has settled and the pointer is away, and
 * out of view or with the tab hidden. Without WebGL the finished mark is
 * drawn once in 2D and left static.
 */

import * as React from "react";

interface Dot {
  hx: number;
  hy: number;
  x: number;
  y: number;
  /** 0–1 coverage of the cell, drives base size and brightness. */
  w: number;
  /** Assemble start offset, 0–1 across the sweep. */
  order: number;
  sx: number;
  sy: number;
}

/* Hydro #4ADE80 as 0–1 RGB. */
const HYDRO: [number, number, number] = [74 / 255, 222 / 255, 128 / 255];

const VERT = /* glsl */ `
attribute vec2  aPos;    // CSS px
attribute float aSize;   // diameter, CSS px
attribute float aAlpha;
uniform vec2  uRes;
uniform float uDpr;
varying float vAlpha;
void main() {
  vec2 clip = (aPos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = aSize * uDpr;
  vAlpha = aAlpha;
}`;

/* The same profile the old 2D sprite had: a solid core to 28% of the
   radius, a shoulder to 50%, then a halo falling to nothing at the edge. */
const FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float i = d < 0.28 ? 1.0
          : d < 0.5 ? mix(0.9, 0.28, (d - 0.28) / 0.22)
          : mix(0.28, 0.0, min(1.0, (d - 0.5) / 0.5));
  i *= vAlpha;
  gl_FragColor = vec4(uColor * i, i);
}`;

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

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("[DotMatrix]", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
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
   * faint cells, which is what a source like the ridgeline needs.
   */
  gamma = 1,
  /**
   * Amplitude of a slow wave of brightness travelling down the field in
   * horizontal bands. 0 disables it. Only drawn while the loop is awake.
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let img: HTMLImageElement | null = null;
    let running = false;
    let inView = false;
    let frame = 0;
    let t0 = 0;
    let assembled = !assemble || reduced;

    // Pointer in canvas space, parked far away until seen.
    let px = -1e4;
    let py = -1e4;

    /* ── GL setup: one program, one interleaved buffer ────────────────── */
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    let program: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let uRes: WebGLUniformLocation | null = null;
    let uDpr: WebGLUniformLocation | null = null;
    /** [x, y, size, alpha] per dot. */
    let verts = new Float32Array(0);

    if (gl) {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (vs && fs) {
        program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error("[DotMatrix]", gl.getProgramInfoLog(program));
          program = null;
        } else {
          gl.useProgram(program);
          buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          const stride = 16;
          const aPos = gl.getAttribLocation(program, "aPos");
          const aSize = gl.getAttribLocation(program, "aSize");
          const aAlpha = gl.getAttribLocation(program, "aAlpha");
          gl.enableVertexAttribArray(aPos);
          gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
          gl.enableVertexAttribArray(aSize);
          gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, stride, 8);
          gl.enableVertexAttribArray(aAlpha);
          gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, stride, 12);
          uRes = gl.getUniformLocation(program, "uRes");
          uDpr = gl.getUniformLocation(program, "uDpr");
          gl.uniform3f(gl.getUniformLocation(program, "uColor"), ...HYDRO);
          // Additive, like the old `lighter` compositing.
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE);
          gl.clearColor(0, 0, 0, 0);
        }
      }
    }

    // Coverage per cell from an image: supersample, then box-average, so
    // every source pixel gets a share of its cell instead of a 2×2 sample.
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
          const ang = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * Math.max(width, height) * 0.5;
          next.push({
            hx,
            hy,
            x: assembled ? hx : hx + Math.cos(ang) * dist,
            y: assembled ? hy : hy + Math.sin(ang) * dist,
            w,
            order: (c / cols) * 0.75 + Math.random() * 0.25,
            sx: hx + Math.cos(ang) * dist,
            sy: hy + Math.sin(ang) * dist,
          });
        }
      }
      dots = next;
      verts = new Float32Array(dots.length * 4);
      if (gl && buf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (gl && program) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, width, height);
        gl.uniform1f(uDpr, dpr);
      }
      build();
      if (!running) draw(performance.now());
    };

    // Design-system ease-out (0.16, 1, 0.3, 1), approximated for a scalar.
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3.2);

    /** Advance the field one step and write it into the vertex array. */
    const step = (now: number) => {
      const t = (now - t0) / 1000;
      let settled = true;
      let moving = false;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]!;
        let hx = d.hx;
        let hy = d.hy;
        if (!assembled) {
          const p = Math.min(1, Math.max(0, (t - d.order * 0.9) / 1.1));
          const e = easeOut(p);
          hx = d.sx + (d.hx - d.sx) * e;
          hy = d.sy + (d.hy - d.sy) * e;
          if (p < 1) settled = false;
        }

        let lit = 0;
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          const f = 1 - dist / radius;
          lit = f;
          const k = (f * f * push) / (dist || 1);
          hx += dx * k;
          hy += dy * k;
        }

        d.x += (hx - d.x) * 0.16;
        d.y += (hy - d.y) * 0.16;
        if (Math.abs(hx - d.x) > 0.05 || Math.abs(hy - d.y) > 0.05) moving = true;

        const band =
          pulse > 0 && !reduced ? 1 + pulse * Math.sin(t * 1.1 - d.hy * 0.045) : 1;
        const o = i * 4;
        verts[o] = d.x;
        verts[o + 1] = d.y;
        verts[o + 2] = cell * (0.55 + 0.45 * d.w) * (1 + lit * 0.9) * 2;
        verts[o + 3] = Math.min(1, d.w * intensity * band + lit * 0.7);
      }
      if (settled && !assembled) assembled = true;
      return moving;
    };

    /** Static fallback without WebGL: the finished mark, drawn once. */
    const draw2D = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgb(74 222 128)";
      for (const d of dots) {
        ctx.globalAlpha = Math.min(1, d.w * intensity);
        ctx.beginPath();
        ctx.arc(d.hx, d.hy, cell * (0.55 + 0.45 * d.w) * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      if (!gl || !program || !buf) {
        draw2D();
        return false;
      }
      const moving = step(now);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, dots.length);
      return moving;
    };

    // Runs while there is something to move — the assembly, or dots
    // springing around the pointer. Settled with the pointer away, one last
    // frame and it sleeps; pointer motion wakes it.
    let idle = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const moving = draw(now);
      const near = px > -radius && py > -radius && px < width + radius && py < height + radius;
      idle = !moving && assembled && !near ? idle + 1 : 0;
      if (idle > 12) stop();
    };
    const start = () => {
      if (running || reduced || !inView || document.hidden || !gl) return;
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
      if (px > -radius && py > -radius && px < width + radius && py < height + radius) start();
    };
    const onLeave = () => {
      px = -1e4;
      py = -1e4;
      start(); // one more pass so displaced dots spring home, then sleep
    };

    if (!generate && src) {
      img = new Image();
      img.decoding = "async";
      img.onload = () => {
        resize();
        if (inView) start();
      };
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
      if (gl) {
        if (buf) gl.deleteBuffer(buf);
        if (program) gl.deleteProgram(program);
      }
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
