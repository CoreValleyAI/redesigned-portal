"use client";

/**
 * The hero backdrop: the brand's dot-matrix ridgeline, in motion.
 *
 * A Himalayan range built from a grid of Hydro-green points on Carbon, seen in
 * perspective — rolling dot dunes in the foreground, ridged peaks behind, a
 * glowing river of light winding down the valley, and fog thinning the far
 * ridges into the sky. It is the animated form of `assets/ridgeline.svg`:
 * monochrome green, never recoloured, the only glow on the page.
 *
 * WHY RAW WEBGL, NOT A LIBRARY
 * The obvious tool is react-three-fiber. It would add the three.js runtime —
 * roughly 150 KB gzipped — to the LCP-critical homepage for one effect. Every
 * dot here is computed in a vertex shader from a (u, v) grid coordinate, so
 * there is no geometry to manage, no scene graph, and no per-frame JavaScript
 * beyond a handful of uniform writes. ~40,000 points cost the GPU nothing.
 *
 * WHAT MOVES
 *  · The terrain noise drifts slowly, so the range breathes rather than
 *    scrolls — a landscape, not a treadmill.
 *  · Each dot flickers on its own phase, the way the ridgeline's dots fade
 *    with depth in the static asset.
 *  · The pointer lifts the ground under it and lights the dots around it —
 *    the surface reacts to attention, it does not flinch from it.
 *
 * WHAT IT RESPECTS
 *  · `prefers-reduced-motion`: one frame is rendered and the loop never
 *    starts. The composition stays; it simply holds still.
 *  · Coarse pointers: no pointer coupling at all.
 *  · Out of view / tab hidden: the loop sleeps. A hero that keeps rendering
 *    while the visitor reads pricing is a battery bug.
 *  · No WebGL: renders nothing. The section behind it is already Carbon.
 */

import * as React from "react";

/* ── Tunables ────────────────────────────────────────────────────────────── */

/** Grid resolution. Columns × rows = points drawn per frame. */
const COLS = 360;
const ROWS = 200;
/** World-unit footprint of the grid: width across, depth away from camera. */
const EXTENT_X = 110;
const EXTENT_Z = 120;
const MAX_DPR = 2;
/** Camera. Eye sits low and looks slightly down the valley. */
const EYE: [number, number, number] = [0, 10, -8];
const TARGET: [number, number, number] = [0, 6, 60];
const FOV_DEG = 58;

/* Hydro #4ADE80 and hydro-200 #A7F3CB, as 0–1 RGB. The only two colours in
   the scene; the hot core of a lit dot leans toward the lighter step. */
const HYDRO = [74 / 255, 222 / 255, 128 / 255] as const;
const HYDRO_HOT = [167 / 255, 243 / 255, 203 / 255] as const;

/* ── Shaders ─────────────────────────────────────────────────────────────── */

const VERT = /* glsl */ `
precision highp float;

attribute vec2 aGrid;          // u across [0,1], v into the distance [0,1]

uniform mat4  uViewProj;
uniform float uTime;
uniform vec2  uExtent;         // world width, world depth
uniform vec2  uMouse;          // pointer on the ground plane, world xz
uniform float uMouseGain;      // 0 when no pointer, eases to 1
uniform float uDpr;
uniform float uHalo;           // 0 = crisp core pass, 1 = wide soft halo pass

varying float vBright;

// Cheap hash + value noise. Good enough for terrain at this scale, and far
// cheaper than simplex on the low-end GPUs a marketing page must not stall.
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
// Fractal noise for the soft foreground dunes.
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return s;
}
// Ridged noise: folding the noise about its midline turns smooth hills into
// sharp crests, which is what makes the far range read as mountains.
float ridged(vec2 p) {
  float s = 0.0, a = 0.55;
  for (int i = 0; i < 4; i++) {
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    n *= n;
    s += a * n;
    p = p * 2.1 + vec2(5.2, 1.3);
    a *= 0.5;
  }
  return s;
}
// The river's course down the valley, as x for a given depth.
float riverX(float z) {
  return sin(z * 0.075 + 1.4) * 7.0 + sin(z * 0.23 + 0.6) * 2.4;
}

void main() {
  float x = (aGrid.x - 0.5) * uExtent.x;
  float z = aGrid.y * uExtent.y;
  vec2  p = vec2(x, z);
  float drift = uTime * 0.05;

  // Foreground: low rolling dunes of dots.
  float dunes = fbm(p * 0.05 + vec2(drift * 0.5, drift * 0.25)) * 3.2;

  // Distance: the range rises with depth, so peaks stand behind the dunes.
  float far = smoothstep(0.16, 0.70, aGrid.y);
  // Low frequency, so the range reads as a few big masses rather than a
  // field of spikes; the second layer adds the sharp summits on top.
  float peaks = ridged(p * 0.028 + vec2(0.0, drift * 0.12)) * 28.0 * far;
  float spire = ridged(p * 0.07 + vec2(3.1, drift * 0.08));
  peaks += spire * spire * spire * 9.0 * far;

  float h = dunes + peaks;

  // Carve the valley: the ground dips toward the river.
  float rx = riverX(z);
  float dr = abs(x - rx);
  float valley = smoothstep(0.0, 11.0, dr);
  h *= mix(0.12, 1.0, valley);

  // Pointer: a soft lift in the ground where the cursor rests.
  float md = distance(p, uMouse);
  float mg = exp(-md * md / 80.0) * uMouseGain;
  h += mg * 2.0;

  // Breathing — slow, low, mechanical.
  h += sin(uTime * 0.45 + z * 0.18 + x * 0.09) * 0.3;

  vec4 clip = uViewProj * vec4(x, h, z, 1.0);
  gl_Position = clip;

  // Brightness. Crests are lit, the river glows, fog eats the distance, and
  // every dot flickers on its own phase.
  float crest  = clamp(h / 22.0, 0.0, 1.0);
  // The river fades in a little way out: at the very near edge its constant
  // world width covers a huge screen area and blows out into a blob.
  float river  = exp(-dr * dr / 4.0) * (1.0 - far * 0.5) * smoothstep(0.04, 0.22, aGrid.y);
  float flick  = 0.72 + 0.28 * sin(uTime * 1.6 + hash(aGrid) * 6.2832);
  float fog    = exp(-aGrid.y * 1.25);
  float bright = (0.42 + crest * 1.25 + river * 1.3 + mg * 1.5) * flick * fog;
  // The halo pass is the same dots, three times wider and much fainter;
  // stacked additively on the core pass they read as a glow.
  vBright = bright * mix(1.0, 0.16, uHalo);

  // Near dots are larger; the far range dissolves into a fine grain.
  float size = (3.0 + crest * 1.6 + river * 1.4 + mg * 1.2) * uDpr;
  float px = max(size * 34.0 / max(clip.w, 1.0), 1.2 * uDpr);
  gl_PointSize = mix(px, px * 3.2 + 2.0 * uDpr, uHalo);
}
`;

const FRAG = /* glsl */ `
precision mediump float;

uniform vec3 uColor;
uniform vec3 uHot;
// Declared highp to match the vertex shader: a uniform shared by both stages
// must agree on precision or the program fails to link.
uniform highp float uHalo;

varying float vBright;

void main() {
  // Core pass: a crisp disc with a short feather. Halo pass: a wide, soft
  // falloff. max() keeps the corners of the point sprite from wrapping back
  // to positive alpha, since gl_PointCoord reaches r ≈ 1.41 there.
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float soft = max(0.0, 1.0 - r);
  float a = mix(smoothstep(1.0, 0.35, r), soft * soft, uHalo);
  float b = vBright;
  vec3 c = mix(uColor, uHot, clamp(b - 0.8, 0.0, 1.0));
  // Premultiplied, additive: overlapping dots add up to a glow.
  gl_FragColor = vec4(c * b * a, b * a);
}
`;

/* ── Minimal mat4 helpers (column-major, as WebGL expects) ───────────────── */

type Vec3 = [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function normalize(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye: Vec3, target: Vec3, up: Vec3) {
  const zAxis = normalize(sub(eye, target)); // camera looks down -z
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  // prettier-ignore
  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ]);
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r]! * b[c * 4]! +
        a[4 + r]! * b[c * 4 + 1]! +
        a[8 + r]! * b[c * 4 + 2]! +
        a[12 + r]! * b[c * 4 + 3]!;
    }
  }
  return out;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // Surfaced in dev only; in production the fallback is simply no backdrop.
    if (process.env.NODE_ENV !== "production") {
      console.error("[dot-terrain] shader:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function DotTerrain({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    // ── Program ─────────────────────────────────────────────────────────────
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[dot-terrain] link:", gl.getProgramInfoLog(program));
      }
      return;
    }
    gl.useProgram(program);

    // ── Geometry: one (u, v) pair per dot, nothing else ─────────────────────
    const grid = new Float32Array(COLS * ROWS * 2);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) * 2;
        grid[i] = c / (COLS - 1);
        grid[i + 1] = r / (ROWS - 1);
      }
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const aGrid = gl.getAttribLocation(program, "aGrid");
    gl.enableVertexAttribArray(aGrid);
    gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0);

    // ── Uniforms ────────────────────────────────────────────────────────────
    const u = {
      viewProj: gl.getUniformLocation(program, "uViewProj"),
      time: gl.getUniformLocation(program, "uTime"),
      extent: gl.getUniformLocation(program, "uExtent"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      mouseGain: gl.getUniformLocation(program, "uMouseGain"),
      dpr: gl.getUniformLocation(program, "uDpr"),
      halo: gl.getUniformLocation(program, "uHalo"),
      color: gl.getUniformLocation(program, "uColor"),
      hot: gl.getUniformLocation(program, "uHot"),
    };
    gl.uniform2f(u.extent, EXTENT_X, EXTENT_Z);
    gl.uniform3f(u.color, HYDRO[0], HYDRO[1], HYDRO[2]);
    gl.uniform3f(u.hot, HYDRO_HOT[0], HYDRO_HOT[1], HYDRO_HOT[2]);

    // Additive blending over a transparent canvas: dots pile into glow.
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    // ── Camera ──────────────────────────────────────────────────────────────
    const worldUp: Vec3 = [0, 1, 0];
    const forward = normalize(sub(TARGET, EYE));
    const right = normalize(cross(forward, worldUp));
    const up = cross(right, forward);
    const tanHalf = Math.tan((FOV_DEG * Math.PI) / 180 / 2);
    const view = lookAt(EYE, TARGET, worldUp);

    let width = 0;
    let height = 0;
    let aspect = 1;
    let dpr = 1;
    let running = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      aspect = width / height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniformMatrix4fv(
        u.viewProj,
        false,
        multiply(perspective((FOV_DEG * Math.PI) / 180, aspect, 0.5, 400), view),
      );
      gl.uniform1f(u.dpr, dpr);
      // Assigning canvas.width clears the bitmap; under reduced motion there
      // is no next frame to repaint it, so paint now.
      if (!running) draw(performance.now());
    };

    // ── Pointer → a point on the ground plane ───────────────────────────────
    // Cast a ray from the eye through the pointer and intersect it with the
    // plane at mid-terrain height. Tracked in refs; lerped in the loop so a
    // fast flick drags the light rather than teleporting it.
    let mx = 0;
    let mz = 0;
    let tx = 0;
    let tz = 0;
    let gain = 0;
    let targetGain = 0;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const dir: Vec3 = normalize([
        forward[0] + right[0] * nx * tanHalf * aspect + up[0] * ny * tanHalf,
        forward[1] + right[1] * nx * tanHalf * aspect + up[1] * ny * tanHalf,
        forward[2] + right[2] * nx * tanHalf * aspect + up[2] * ny * tanHalf,
      ]);
      const planeY = 3;
      if (dir[1] >= -1e-4) {
        // Looking at the sky: no ground point. Let the light fade out.
        targetGain = 0;
        return;
      }
      const t = (planeY - EYE[1]) / dir[1];
      tx = EYE[0] + dir[0] * t;
      tz = EYE[2] + dir[2] * t;
      targetGain = 1;
      wake();
    };
    const onLeave = () => {
      targetGain = 0;
      wake();
    };

    // ── Frame ───────────────────────────────────────────────────────────────
    const t0 = performance.now();
    // An arrow, not a function declaration: a declaration is hoisted above the
    // `if (!gl) return` guard and loses its narrowing.
    const draw = (now: number) => {
      mx += (tx - mx) * 0.1;
      mz += (tz - mz) * 0.1;
      gain += (targetGain - gain) * 0.08;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.time, reduced ? 0 : (now - t0) / 1000);
      gl.uniform2f(u.mouse, mx, mz);
      gl.uniform1f(u.mouseGain, gain);
      // Halo first, core on top. Additive blending is order-independent, but
      // drawing the faint pass first keeps the driver's early-out cheap.
      gl.uniform1f(u.halo, 1);
      gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
      gl.uniform1f(u.halo, 0);
      gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
    };

    // ── Loop, gated on visibility ───────────────────────────────────────────
    let frame = 0;
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
    // Under reduced motion the loop never runs, but the pointer light can
    // still settle: draw a few frames on demand until it has.
    function wake() {
      if (!reduced) return;
      let n = 0;
      const settle = (now: number) => {
        draw(now);
        if (++n < 40) requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
    }

    resize();
    draw(performance.now());

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
      document.addEventListener("pointerleave", onLeave, { passive: true });
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        // Two masks intersected: the sky fades to Carbon at the top, and the
        // field softens under the headline column on the left so the type
        // stays legible over the dots.
        WebkitMaskImage:
          "linear-gradient(180deg, transparent 0%, #000 34%, #000 100%), linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.5) 38%, #000 62%)",
        WebkitMaskComposite: "source-in",
        maskImage:
          "linear-gradient(180deg, transparent 0%, #000 34%, #000 100%), linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.5) 38%, #000 62%)",
        maskComposite: "intersect",
      }}
    />
  );
}
