/**
 * The Living Mark: the brand mark as a field of hydro dots. It is the
 * footer mark from the live site (components/marketing/dot-matrix.tsx on
 * main), rebuilt on the shared Stage.
 *
 *  · Assemble. The first time the mark scrolls into view, its dots fly in
 *    from a scatter, sweeping left to right and switching on as they land:
 *    the mark coming online. It plays again whenever the mark comes back.
 *  · React. The pointer parts the dots and lights them, leaving a short
 *    afterglow; they spring home with a little overshoot when it moves on.
 *    On touch screens a soft light drifts across the mark by itself, a
 *    finger on the screen parts the dots (through a swipe, as the page
 *    scrolls), and scrolling sloshes them like water in a glass.
 *  · Still. With reduced motion: the finished mark; a hand or a finger
 *    still parts the dots (direct manipulation), nothing moves by itself.
 *
 * Snow mode (the 404 page, S18): the dots start as snow falling through the
 * field, and the pointer gathers them back into the mark as it passes; a
 * sideways swipe does on a phone, and left alone the snow slowly gathers
 * itself. Once most of it is home the rest follows, and onGathered fires.
 *
 * Water (the Reservoir, S3: the wordmark at the foot of every page): the
 * dots are dry, in the quiet dot colour, until water rises through them
 * with the host's progress (the page reaching its end), lighting them hydro.
 * The surface is a row of coupled springs: the pointer or a finger dips it
 * and leaves waves, a tap drops a stone in, a change of scroll speed sloshes
 * it from side to side, and at rest it breathes a little.
 *
 * The dots come from a shape's own paths (components/brand/paths.ts),
 * rasterised at grid resolution with 4× supersampling, so there is no image
 * request. For the mark, coverage is weighted by its gradient, so the light
 * upper-left carries the fuller dots. The physics runs on the CPU (a couple
 * of thousand springs); the field is one buffer upload and one draw call
 * per frame.
 */
import { BRANDMARK, type DotShape } from "@/components/brand/paths";
import { clamp01, compileProgram, smoothstep, uniforms } from "@/lib/gl/core";
import type { FrameInfo, Scene, SceneContext, SceneFactory } from "@/lib/gl/stage";
import { damp } from "@/lib/motion/spring";
import { encodeSrgb, type RGB } from "@/lib/theme";

export interface MarkOptions {
  /** The shape to draw (the brand mark by default). */
  shape?: DotShape;
  /** Grid pitch, CSS px. */
  cell?: number;
  /** Or: dots across the shape's width (the pitch follows the size), with
      the pitch kept within [min, max] CSS px. Overrides `cell`. */
  columns?: { count: number; min: number; max: number };
  /** Cells below this share of the peak coverage stay empty. */
  threshold?: number;
  /** Exponent on coverage: below 1 lifts the faint edge cells. */
  gamma?: number;
  /** Peak dot alpha. */
  intensity?: number;
  /** Pointer reach, CSS px. */
  radius?: number;
  /** How far the pointer pushes a dot at its centre, CSS px. */
  push?: number;
  /** Empty margin around the mark inside the canvas, CSS px: room for the
      fly-in. Must match the host's negative inset. */
  bleed?: number;
  /** Fly in again each time the mark comes back into view. */
  replay?: boolean;
  /** "assemble" (the footer) or "snow" (the 404 page). */
  mode?: "assemble" | "snow";
  /** Snow mode: the mark is whole again. */
  onGathered?: () => void;
  /** Water rises through the dots with the host's progress (the Reservoir). */
  water?: boolean;
}

const VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;    // CSS px
layout(location = 1) in float a_size;  // diameter, CSS px
layout(location = 2) in float a_alpha;
layout(location = 3) in float a_lit;
layout(location = 4) in float a_home;  // 0 snow (or dry) … 1 the mark (or wet)
uniform vec2 u_res;                    // CSS px
uniform float u_dpr;
uniform vec3 u_color;
uniform vec3 u_hot;
uniform vec3 u_snow;
out float v_alpha;
out vec3 v_color;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = a_size * u_dpr;
  v_alpha = a_alpha;
  v_color = mix(mix(u_snow, u_color, a_home), u_hot, clamp(a_lit, 0.0, 1.0));
}`;

/* Night Valley: the live site's dot, a solid core to 28 % of the radius,
   a shoulder to 50 %, then a halo falling to nothing at the edge; summed
   additively, the halos are the glow. Glacier (u_paper): light does not
   glow on paper, so a crisp disc with an anti-aliased rim. */
const FS = /* glsl */ `#version 300 es
precision mediump float;
uniform float u_paper;
uniform float u_rim;    // the disc's anti-aliasing width, in d units
in float v_alpha;
in vec3 v_color;
out vec4 o;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float glow = d < 0.28 ? 1.0
             : d < 0.5 ? mix(0.9, 0.28, (d - 0.28) / 0.22)
             : mix(0.28, 0.0, min(1.0, (d - 0.5) / 0.5));
  float disc = 1.0 - smoothstep(0.36 - u_rim, 0.36 + u_rim, d);
  float i = mix(glow, disc, u_paper) * v_alpha;
  if (i < 0.003) discard;
  o = vec4(v_color * i, i);
}`;

/** Floats per dot in the vertex buffer: x, y, size, alpha, lit, home. */
const STRIDE = 6;
/** Supersampling per cell when rasterising the shape. */
const SS = 4;
/** The dots' spring: stiff, a touch under critical damping (≈ 6 % overshoot). */
const K = 170;
const C = 2 * 0.66 * Math.sqrt(K);
/** Scroll slosh: share of a change in scroll speed passed to the dots. */
const SLOSH = 0.07;

/** The water surface: columns across the shape, and its physics. */
const WN = 84;
const WAVE = 2600; // neighbour coupling (wave speed²), columns²/s²
const LEVEL_K = 9; // pull back to level
const WATER_DAMP = 2.1;

type Phase = "waiting" | "assembling" | "snow" | "done";

/** Snow mode: a flake gathers when the pointer passes within this many px. */
const GATHER_R = 130;

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
 * Coverage per cell of the shape drawn into a cols × rows grid at (ox, oy),
 * gw cells wide. Supersampled, then box-averaged, so every source pixel gets
 * a share of its cell; lighter parts of a gradient count for more.
 */
function rasterise(shape: DotShape, cols: number, rows: number, ox: number, oy: number, gw: number): Float32Array {
  const W = cols * SS;
  const H = rows * SS;
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(W, H)
      : Object.assign(document.createElement("canvas"), { width: W, height: H });
  const g = canvas.getContext("2d", { willReadFrequently: true }) as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  const cov = new Float32Array(cols * rows);
  if (!g) return cov;

  const [vx, vy, vw] = shape.viewBox;
  const k = (gw * SS) / vw;
  g.setTransform(k, 0, 0, k, ox * SS - vx * k, oy * SS - vy * k);
  const G = shape.gradient;
  if (G) {
    const grad = g.createLinearGradient(G.x1, G.y1, G.x2, G.y2);
    grad.addColorStop(0, G.from);
    grad.addColorStop(1, G.to);
    g.fillStyle = grad;
  } else {
    g.fillStyle = "#fff";
  }
  for (const d of shape.paths) g.fill(new Path2D(d));

  const data = g.getImageData(0, 0, W, H).data;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sum = 0;
      for (let y = 0; y < SS; y++) {
        for (let x = 0; x < SS; x++) {
          const i = ((r * SS + y) * W + (c * SS + x)) * 4;
          const a = data[i + 3]! / 255;
          const lum = (data[i]! * 0.3 + data[i + 1]! * 0.59 + data[i + 2]! * 0.11) / 255;
          sum += a * (0.35 + 0.65 * lum);
        }
      }
      cov[r * cols + c] = sum / (SS * SS);
    }
  }
  return cov;
}

export function createMarkScene(options: MarkOptions = {}): SceneFactory {
  const shape = options.shape ?? BRANDMARK;
  const threshold = options.threshold ?? 0.08;
  const gamma = options.gamma ?? 0.6;
  const intensity = options.intensity ?? 1;
  const radius = options.radius ?? 90;
  const push = options.push ?? 18;
  const bleed = options.bleed ?? 90;
  const replay = options.replay ?? true;
  const snowMode = options.mode === "snow";
  const water = options.water ?? false;

  return (ctx: SceneContext): Scene => {
    const { gl, canvas } = ctx;
    const program = compileProgram(gl, VS, FS);
    const u = uniforms(gl, program);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const vao = gl.createVertexArray()!;
    const buf = gl.createBuffer()!;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const bytes = STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, bytes, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, bytes, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, bytes, 12);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, bytes, 16);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, bytes, 20);
    gl.bindVertexArray(null);

    // The field, as parallel arrays.
    let cell = options.cell ?? 4;
    let n = 0;
    let hx = new Float32Array(0); // home
    let hy = new Float32Array(0);
    let sx = new Float32Array(0); // fly-in start
    let sy = new Float32Array(0);
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let w = new Float32Array(0); // coverage weight, 0–1
    let order = new Float32Array(0); // fly-in start, 0–1 across the sweep
    let mass = new Float32Array(0); // slosh response
    let glow = new Float32Array(0); // light from the pointer, with afterglow
    // Snow mode: where each flake started, how it falls and sways, and how
    // far it has been gathered home (0–1).
    let fx = new Float32Array(0);
    let fy = new Float32Array(0);
    let fall = new Float32Array(0);
    let sway = new Float32Array(0);
    let freq = new Float32Array(0);
    let ph = new Float32Array(0);
    let gat = new Float32Array(0);
    let verts = new Float32Array(0);
    // Water: the surface's offset from level (px, down is positive) and its
    // velocity, per column; the level itself, eased.
    const wh = new Float32Array(WN);
    const wv = new Float32Array(WN);
    let level = 0;
    let lastTap = -1;
    let lastPX = 0;
    let lastPY = 0;

    let cssW = 1;
    let cssH = 1;
    let dpr = 1;
    // The shape's box inside the canvas, CSS px.
    const box = { x: 0, y: 0, w: 1, h: 1 };

    let reduced = ctx.reduced;
    let phase: Phase = reduced ? "done" : snowMode ? "snow" : "waiting";
    let completing = false;
    let lastTouch = -1;
    let told = false;
    let tStart = -1;
    let firstView = true;
    let holdUntil = -1;
    let ambient = 0;
    let lastTime = -1;
    let lastScroll = 0;
    let scrollVel = 0;
    let frames = 0;
    // What the canvas shows now, so a frame with nothing new can be skipped.
    let settled = false;
    let dirty = true;
    let drawn: { theme: string; color: RGB } = { theme: "", color: [0, 0, 0] };
    const rnd = mulberry32(20_260_413);

    /** A fly-in start: a random direction, a distance that fits the margin,
        clamped inside the canvas (the left and top keep a wider margin: the
        footer clips what lies beyond its edges). */
    const scatter = (i: number) => {
      const ang = rnd() * Math.PI * 2;
      const reach = bleed * 0.9 + Math.min(box.w, box.h) * 0.15;
      const dist = 30 + rnd() * reach;
      const m = 6;
      const lt = bleed * 0.72;
      sx[i] = Math.min(cssW - m, Math.max(lt, hx[i]! + Math.cos(ang) * dist));
      sy[i] = Math.min(cssH - m, Math.max(lt, hy[i]! + Math.sin(ang) * dist));
    };

    const place = (atHome: boolean) => {
      dirty = true;
      for (let i = 0; i < n; i++) {
        x[i] = atHome ? hx[i]! : sx[i]!;
        y[i] = atHome ? hy[i]! : sy[i]!;
        vx[i] = 0;
        vy[i] = 0;
        glow[i] = 0;
      }
    };

    const build = () => {
      const aspect = shape.viewBox[2] / shape.viewBox[3];
      if (options.columns) {
        const { count, min, max } = options.columns;
        cell = Math.min(max, Math.max(min, Math.max(1, cssW - bleed * 2) / count));
      }
      const cols = Math.max(1, Math.floor(cssW / cell));
      const rows = Math.max(1, Math.floor(cssH / cell));
      const gx = (cssW - cols * cell) / 2;
      const gy = (cssH - rows * cell) / 2;
      const bc = Math.round(bleed / cell);
      const ic = Math.max(1, cols - bc * 2);
      const ir = Math.max(1, rows - bc * 2);
      let gw = ic;
      let gh = Math.round(ic / aspect);
      if (gh > ir) {
        gh = ir;
        gw = Math.round(ir * aspect);
      }
      const ox = bc + Math.floor((ic - gw) / 2);
      const oy = bc + Math.floor((ir - gh) / 2);
      box.x = gx + ox * cell;
      box.y = gy + oy * cell;
      box.w = gw * cell;
      box.h = gh * cell;

      const cov = rasterise(shape, cols, rows, ox, oy, gw);
      let peak = 0;
      for (let i = 0; i < cov.length; i++) peak = Math.max(peak, cov[i]!);
      const keep: number[] = [];
      if (peak > 0) for (let i = 0; i < cov.length; i++) if (cov[i]! / peak >= threshold) keep.push(i);

      n = keep.length;
      hx = new Float32Array(n);
      hy = new Float32Array(n);
      sx = new Float32Array(n);
      sy = new Float32Array(n);
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      w = new Float32Array(n);
      order = new Float32Array(n);
      mass = new Float32Array(n);
      glow = new Float32Array(n);
      fx = new Float32Array(n);
      fy = new Float32Array(n);
      fall = new Float32Array(n);
      sway = new Float32Array(n);
      freq = new Float32Array(n);
      ph = new Float32Array(n);
      gat = new Float32Array(n);
      verts = new Float32Array(n * STRIDE);
      keep.forEach((cellIndex, i) => {
        const c = cellIndex % cols;
        const r = (cellIndex - c) / cols;
        hx[i] = gx + (c + 0.5) * cell;
        hy[i] = gy + (r + 0.5) * cell;
        w[i] = Math.pow(cov[cellIndex]! / peak, gamma);
        order[i] = clamp01((c - ox) / gw) * 0.75 + rnd() * 0.25;
        mass[i] = 0.55 + rnd() * 0.9;
        scatter(i);
        fx[i] = rnd() * cssW;
        fy[i] = rnd() * cssH;
        fall[i] = 12 + rnd() * 26;
        sway[i] = 4 + rnd() * 14;
        freq[i] = 0.25 + rnd() * 0.6;
        ph[i] = rnd() * Math.PI * 2;
      });
      if (phase === "snow") {
        // A resize mid-snow starts the gathering over: the field is new.
        sx.set(fx);
        sy.set(fy);
        completing = false;
      }
      // Resized mid-flight: land at once rather than restart the sweep.
      if (phase === "assembling") phase = "done";
      place(phase === "done");
      gat.fill(phase === "snow" ? 0 : 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);
    };

    // The fly-in waits until the mark is properly in view, and plays again
    // after it has left (replay). Visible the moment the scene starts, the
    // still poster was already showing the mark: no fly-in then.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e || snowMode) return;
        const ratio = e.isIntersecting ? e.intersectionRatio : 0;
        if (ratio >= 0.3) {
          if (firstView && phase === "waiting") {
            phase = "done";
            place(true);
          } else if (phase === "waiting") {
            phase = "assembling";
            tStart = -1;
          }
          ctx.invalidate();
        } else if (ratio === 0 && replay && phase === "done" && !reduced) {
          for (let i = 0; i < n; i++) scatter(i);
          place(false);
          phase = "waiting";
        }
        firstView = false;
      },
      { threshold: [0, 0.3] },
    );
    io.observe(canvas);

    /** Water: one step of the surface (semi-implicit Euler). Returns whether
        it is still moving. */
    const stepWater = (h: number, drive: number, time: number) => {
      let moving = false;
      for (let j = 0; j < WN; j++) {
        const left = wh[j > 0 ? j - 1 : j]!;
        const right = wh[j < WN - 1 ? j + 1 : j]!;
        // At rest the surface breathes: two slow swells, a pixel or two.
        const rest = drive * (1.3 * Math.sin(time * 1.1 + j * 0.31) + 0.8 * Math.sin(time * 0.67 - j * 0.53));
        const acc = WAVE * (left + right - 2 * wh[j]!) / (WN * 0.5) - LEVEL_K * (wh[j]! - rest) - WATER_DAMP * wv[j]!;
        wv[j] = wv[j]! + acc * h;
      }
      for (let j = 0; j < WN; j++) {
        wh[j] = Math.max(-box.h * 0.45, Math.min(box.h * 0.45, wh[j]! + wv[j]! * h));
        if (Math.abs(wv[j]!) > 0.4) moving = true;
      }
      return moving;
    };
    const columnAt = (px: number) => Math.min(WN - 1, Math.max(0, Math.floor(((px - box.x) / box.w) * WN)));

    return {
      resize(width, height, d) {
        dpr = d;
        cssW = width / d;
        cssH = height / d;
        gl.viewport(0, 0, width, height);
        build();
      },

      frame(f: FrameInfo) {
        reduced = f.reduced;
        if (reduced && phase !== "done") {
          phase = "done";
          place(true);
          gat.fill(1);
        }
        // Not yet in view: nothing to show until the fly-in starts.
        if (phase === "waiting" || n === 0) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          lastTime = -1;
          dirty = true;
          return false;
        }
        frames++;

        // Time since this scene last drew: the Stage skips frames while the
        // scene sleeps, and a long gap restarts the integration cleanly.
        const gap = lastTime < 0 ? 1 : f.time - lastTime;
        lastTime = f.time;
        const dt = gap > 0.1 ? 1 / 60 : Math.min(1 / 30, gap);

        // Assembly clock.
        let t = 0;
        if (phase === "assembling") {
          if (tStart < 0) tStart = f.time;
          t = f.time - tStart;
        }

        // The pointer (or finger), in canvas px; a finger stays for a moment
        // after it lifts, so a tap visibly parts the dots. Only a pointer
        // within reach of the field counts.
        const px = (f.pointer.x + 1) * 0.5 * cssW;
        const py = (1 - f.pointer.y) * 0.5 * cssH;
        const near = px > -radius && py > -radius && px < cssW + radius && py < cssH + radius;
        if (f.pointer.down && near) holdUntil = f.time + 0.6;
        const presence = !near ? 0 : Math.max(f.pointer.presence, holdUntil > f.time ? 1 : 0);
        if (lastTouch < 0 || presence > 0.05) lastTouch = f.time;

        // Snow: once most flakes are home the rest follow; left alone for a
        // while, the snow gathers itself, slowly.
        const snowing = phase === "snow";
        let home = 0;
        if (snowing) {
          for (let i = 0; i < n; i++) if (gat[i]! >= 1) home++;
          if (home > n * 0.7) completing = true;
        }
        const drift = snowing ? (completing ? 0.85 : f.time - lastTouch > 7 ? 0.05 : 0) : 0;

        // Touch screens: a light drifting on a slow figure-of-eight once the
        // mark has landed, stepping aside while a finger is down.
        const wantAmbient = !fine && !reduced && phase === "done" && presence < 0.05;
        ambient = damp(ambient, wantAmbient ? 1 : 0, 0.5, dt);
        if (!wantAmbient && ambient < 0.002) ambient = 0;
        const ax = box.x + box.w * (0.5 + 0.4 * Math.sin(f.time * 0.55));
        const ay = box.y + box.h * (0.5 + 0.3 * Math.sin(f.time * 1.1 + 0.6));

        // Scroll slosh: a change of scroll speed is felt as inertia.
        let kick = 0;
        if (!reduced) {
          const scroll = window.scrollY;
          if (gap > 0.1) {
            scrollVel = 0;
          } else {
            const raw = (scroll - lastScroll) / Math.max(gap, 1 / 240);
            const prev = scrollVel;
            scrollVel = damp(scrollVel, raw, 0.05, gap);
            kick = Math.max(-160, Math.min(160, (scrollVel - prev) * SLOSH));
          }
          lastScroll = scroll;
        }

        // Water: the level follows the host, eased; the surface takes the
        // pointer, taps and the slosh, and breathes at rest.
        let waterMoving = false;
        if (water) {
          const target = reduced ? 1 : clamp01(f.progress);
          level = reduced ? 1 : damp(level, target, 0.18, dt);
          if (Math.abs(level - target) > 0.001) waterMoving = true;
          if (!reduced) {
            // A dip that follows the pointer while it is at the surface.
            const surfaceY = box.y + box.h * (1 - level);
            const pvx = (px - lastPX) / Math.max(dt, 1 / 240);
            const pvy = (py - lastPY) / Math.max(dt, 1 / 240);
            const sources: [number, number, number, number, number][] = [];
            if (presence > 0.05) sources.push([px, py, pvx, pvy, presence]);
            if (ambient > 0.05) sources.push([ax, ay, 0, 0, ambient * 0.5]);
            for (const [sx0, sy0, svx, svy, amt] of sources) {
              const reach = Math.abs(sy0 - surfaceY);
              if (sx0 < box.x - 30 || sx0 > box.x + box.w + 30 || reach > box.h * 0.6) continue;
              const j0 = columnAt(sx0);
              const prox = 1 - reach / (box.h * 0.6);
              for (let j = Math.max(0, j0 - 3); j <= Math.min(WN - 1, j0 + 3); j++) {
                const fallOff = 1 - Math.abs(j - j0) / 4;
                wv[j] = wv[j]! + (svy * 0.06 + Math.abs(svx) * 0.025) * fallOff * prox * amt;
              }
            }
            // A tap drops a stone in.
            const tap = f.taps[f.taps.length - 1];
            if (tap && tap.t > lastTap) {
              lastTap = tap.t;
              const tx = (tap.x + 1) * 0.5 * cssW;
              if (tx >= box.x && tx <= box.x + box.w) {
                const j0 = columnAt(tx);
                for (let j = Math.max(0, j0 - 2); j <= Math.min(WN - 1, j0 + 2); j++) wv[j] = wv[j]! + 260;
              }
            }
            // Slosh: a change of scroll speed tips the water.
            if (kick !== 0) for (let j = 0; j < WN; j++) wv[j] = wv[j]! + kick * 1.6 * ((j / (WN - 1)) * 2 - 1);
            const subs = Math.max(1, Math.ceil(dt / (1 / 120)));
            const drive = level > 0.02 && level < 0.995 ? 1 : 0;
            for (let s = 0; s < subs; s++) if (stepWater(dt / subs, drive, f.time)) waterMoving = true;
            if (drive) waterMoving = true;
          } else {
            wh.fill(0);
            wv.fill(0);
          }
          lastPX = px;
          lastPY = py;
        }

        // Nothing new to show (the Stage also calls when its own pointer
        // moves, wherever it is): keep the last frame on screen.
        const pal = f.palette;
        const color = encodeSrgb(pal.hydro);
        const sameLook =
          pal.theme === drawn.theme &&
          Math.abs(color[0] - drawn.color[0]) +
            Math.abs(color[1] - drawn.color[1]) +
            Math.abs(color[2] - drawn.color[2]) <
            1e-4;
        if (
          settled &&
          !dirty &&
          sameLook &&
          phase === "done" &&
          presence === 0 &&
          ambient === 0 &&
          kick === 0 &&
          !waterMoving
        ) {
          return false;
        }

        const subs = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / subs;
        const fade = Math.exp(-dt * 4.5);
        let moving = false;
        const landing = phase === "assembling";
        let landed = true;
        const restY = box.y + box.h * (1 - level);

        for (let i = 0; i < n; i++) {
          // Where the dot wants to be: home, on its way home, or pushed aside.
          let tx = hx[i]!;
          let ty = hy[i]!;
          let on = 1;
          let homeAmt = 1;
          if (snowing) {
            const span = cssH + 24;
            const fallen = fy[i]! + fall[i]! * f.time;
            const snowX = fx[i]! + sway[i]! * Math.sin(f.time * freq[i]! + ph[i]!);
            const snowY = (((fallen % span) + span) % span) - 12;
            let gi = gat[i]!;
            if (gi < 1) {
              if (presence > 0) {
                const dx = x[i]! - px;
                const dy = y[i]! - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < GATHER_R) gi += dt * 2.4 * (1 - dist / GATHER_R) * presence;
              }
              gi = Math.min(1, gi + dt * drift);
              gat[i] = gi;
            }
            homeAmt = gi * gi * (3 - 2 * gi);
            tx = snowX + (hx[i]! - snowX) * homeAmt;
            ty = snowY + (hy[i]! - snowY) * homeAmt;
            // A flake wrapping from the bottom to the top jumps; it does not fly.
            if (Math.abs(ty - y[i]!) > cssH * 0.5) {
              x[i] = tx;
              y[i] = ty;
              vx[i] = 0;
              vy[i] = 0;
            }
            on = 0.42 + 0.58 * homeAmt;
          }
          if (landing) {
            const p = clamp01((t - order[i]! * 0.9) / 1.1);
            const e = 1 - Math.pow(1 - p, 3.2);
            tx = sx[i]! + (tx - sx[i]!) * e;
            ty = sy[i]! + (ty - sy[i]!) * e;
            on = smoothstep(0, 0.3, p);
            if (p < 1) landed = false;
          }

          let lit = 0;
          if (presence > 0 && homeAmt >= 1) {
            const dx = x[i]! - px;
            const dy = y[i]! - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
              const fall = 1 - dist / radius;
              lit = fall * presence;
              const k = (fall * fall * push * presence) / (dist || 1);
              tx += dx * k;
              ty += dy * k;
            }
          }
          if (ambient > 0) {
            const dx = x[i]! - ax;
            const dy = y[i]! - ay;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
              const fall = 1 - dist / radius;
              lit = Math.max(lit, fall * ambient);
              const k = (fall * fall * push * ambient) / (dist || 1);
              tx += dx * k;
              ty += dy * k;
            }
          }

          // Spring toward the target (semi-implicit Euler, 120 Hz substeps).
          let X = x[i]!;
          let Y = y[i]!;
          let VX = vx[i]!;
          let VY = vy[i]! + kick * mass[i]!;
          for (let s = 0; s < subs; s++) {
            VX += (K * (tx - X) - C * VX) * h;
            VY += (K * (ty - Y) - C * VY) * h;
            X += VX * h;
            Y += VY * h;
          }
          x[i] = X;
          y[i] = Y;
          vx[i] = VX;
          vy[i] = VY;
          if (Math.abs(VX) + Math.abs(VY) > 1.5 || Math.abs(tx - X) + Math.abs(ty - Y) > 0.08) moving = true;

          const g = Math.max(lit, glow[i]! * fade);
          glow[i] = g < 0.004 ? 0 : g;
          if (g > 0.004) moving = true;

          // Wet below the surface, with a bright line of foam along it.
          let wet = homeAmt;
          let foam = 0;
          if (water) {
            const surface = restY + wh[columnAt(hx[i]!)]!;
            const below = hy[i]! - surface;
            wet = smoothstep(-cell * 0.7, cell * 0.7, below);
            foam = level > 0.01 && level < 0.995 ? Math.exp(-((below / (cell * 1.4)) ** 2)) * 0.55 : 0;
          }

          const o = i * STRIDE;
          const wi = w[i]!;
          const hot = Math.max(g, foam);
          verts[o] = X;
          verts[o + 1] = Y;
          verts[o + 2] = cell * (0.55 + 0.45 * wi) * (1 + g * 0.9) * 2;
          verts[o + 3] = Math.min(1, wi * intensity * on * (water ? 0.55 + 0.45 * wet : 1) + hot * 0.7 * on);
          verts[o + 4] = hot;
          verts[o + 5] = wet;
        }
        if (landing && landed) phase = "done";
        if (snowing && home === n) {
          phase = "done";
          if (!told) {
            told = true;
            options.onGathered?.();
          }
        }

        // With nothing but the drifting light to show, half the frame rate
        // is plenty (and kinder to a phone's battery).
        const onlyAmbient = phase === "done" && presence === 0 && kick === 0 && ambient > 0 && !waterMoving;
        if (onlyAmbient && frames % 2 === 1) return true;

        // Colour and blend per frame, so a theme change takes on the next
        // paint. Night Valley: additive hydro. Glacier: the canvas is
        // transparent, so the (premultiplied) dots lay over the page.
        const dark = pal.theme === "dark";
        const ink = encodeSrgb(pal.ink);
        const mixHot = dark ? 0.55 : 0.4;
        const hotColor: RGB = [
          color[0] + (ink[0] - color[0]) * mixHot,
          color[1] + (ink[1] - color[1]) * mixHot,
          color[2] + (ink[2] - color[2]) * mixHot,
        ];
        // Dry dots (snow, or above the water): the quiet dot colour.
        const dry = water ? encodeSrgb(pal.dotOff) : dark ? ink : encodeSrgb(pal.ink3);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(program);
        gl.uniform2f(u("u_res"), cssW, cssH);
        gl.uniform1f(u("u_dpr"), dpr);
        gl.uniform1f(u("u_paper"), dark ? 0 : 1);
        // One device pixel of rim, as a share of a full-weight dot.
        gl.uniform1f(u("u_rim"), 1 / (cell * 2 * dpr));
        gl.uniform3fv(u("u_color"), color);
        gl.uniform3fv(u("u_hot"), hotColor);
        gl.uniform3fv(u("u_snow"), dry);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.POINTS, 0, n);
        gl.bindVertexArray(null);
        settled = !moving;
        dirty = false;
        drawn = { theme: pal.theme, color };

        return (
          phase === "assembling" || phase === "snow" || moving || presence > 0 || ambient > 0 || waterMoving
        );
      },

      dispose() {
        io.disconnect();
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
      },
    };
  };
}
