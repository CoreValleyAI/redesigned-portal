"use client";

/**
 * The hero backdrop: the brand's dot-matrix ridgeline, in motion.
 *
 * A Himalayan range built from Hydro-green dots on Carbon, seen in
 * perspective — rolling dot dunes in the foreground, four ranges of pyramidal
 * peaks stacked behind one another, every rock face textured with dots that
 * brighten toward the crest, a river of light threading through the gaps
 * between the ranges, and fog thinning the far ridges into the sky. It is the
 * animated form of `assets/ridgeline.svg`: monochrome green, never
 * recoloured, the only glow on the page.
 *
 * HOW IT IS DRAWN
 *  · Pass 0 — the terrain body. An opaque mesh, displaced in the vertex
 *    shader, that writes depth. Its FRAGMENT shader paints the dot matrix:
 *    a world-space grid of dots projected onto every face, lit by where the
 *    fragment sits on its range (crest bright, base dim), by the river and
 *    by the pointer. Because the dots are painted per fragment rather than
 *    placed per vertex, a steep face is as densely dotted as flat ground —
 *    which is what makes the slopes read as solid, textured rock.
 *  · Passes 1–2 — point sprites, depth-tested against the body, additive.
 *    Only the crest lines, the river and the pointer light emit them; they
 *    are the glow, not the surface.
 *
 * WHY RAW WEBGL, NOT A LIBRARY
 * react-three-fiber would add the three.js runtime — roughly 150 KB gzipped —
 * to the LCP-critical homepage for one effect. Everything here is one
 * program, one vertex buffer and one index buffer.
 *
 * WHAT MOVES
 *  · Light flows down the river; each dot flickers on its own phase; the
 *    dunes breathe. The ranges themselves hold still — mountains do.
 *  · The pointer lifts the ground under it and lights the dots around it.
 *
 * WHAT IT RESPECTS
 *  · `prefers-reduced-motion`: one frame, no loop. Coarse pointers: no
 *    pointer coupling. Out of view / tab hidden: the loop sleeps.
 *  · No WebGL: renders nothing. The section behind it is already Carbon.
 */

import * as React from "react";
import { canvasPalette, subscribeTheme } from "@/lib/theme";

/* ── Tunables ────────────────────────────────────────────────────────────── */

/** Mesh resolution. COLS × ROWS must stay under 65,536 for 16-bit indices. */
const COLS = 320;
const ROWS = 200;
/** World-unit footprint: width across, depth away from the camera. */
/* Total width of the ground. The x grid is warped (dense in the middle,
   coarser toward the sides), so the centre keeps its old detail while the
   ranges run well past the edge of any viewport. */
const EXTENT_X = 260;
const EXTENT_Z = 130;
const MAX_DPR = 1.5;
/** Camera. Eye sits low and looks slightly down the valley. */
const EYE: [number, number, number] = [0, 9, -8];
const TARGET: [number, number, number] = [0, 2, 60];
const FOV_DEG = 58;

/* Ground and mark colours are uniforms fed from lib/theme.ts (applyPalette
   below), so the range follows the theme. */

/* ── Shaders ─────────────────────────────────────────────────────────────── */

const NOISE = /* glsl */ `
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
`;

const VERT = /* glsl */ `
precision highp float;

attribute vec2 aGrid;          // u across [0,1], v into the distance [0,1]

uniform mat4  uViewProj;
uniform float uTime;
uniform vec2  uExtent;
uniform vec2  uMouse;          // pointer on the ground plane, world xz
uniform float uMouseGain;
uniform float uDpr;
uniform float uPass;           // 0 = body, 1 = halo sprites, 2 = core sprites
uniform float uRiverGain;      // river weight: 1 on Carbon, higher on paper (also in FRAG)
uniform float uMouseLight;     // how much the pointer lights the ground (also in FRAG); the swell is always on
uniform float uDot;            // dot boldness: base disc radius in a grid cell (also in FRAG)

varying vec3  vWorld;
varying float vSec;            // 0 on flat ground → 1 on a crest
varying float vFar;            // grid depth 0..1
varying float vRiver;          // river glow, 0..1
varying float vMouse;          // pointer light, 0..1
varying float vBright;         // sprite intensity
varying float vEdge;           // 1 in the middle, 0 at the far left/right ends of the ground

${NOISE}

// Fractal noise for the foreground dunes.
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return s;
}
// A 1-D skyline along x: noise folded about its midline, so summits are
// pointed and the faces between them are straight. A very low-frequency
// swell in amplitude gives each range one dominant summit and lower
// shoulders instead of an even row of teeth.
// A skyline built from a handful of placed summits rather than from noise:
// n peaks spread across a width W, each a narrow rounded summit
// (exp(−d^1.5): zero slope at the top, steep flanks) standing on a broad
// skirt that joins it to its neighbours. Positions, heights and widths come
// from a hash of the index, so the range is the same on every load. The
// tallest summit is nudged right of centre.
float skyline(float x, float n, float W, float baseW, float seed) {
  float s = 0.07;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    if (fi >= n) break;
    float px = ((fi + 0.5 + (hash(vec2(fi, seed)) - 0.5) * 0.7) / n) * W - W * 0.5;
    float ph = 0.5 + 0.5 * hash(vec2(fi + 3.0, seed));
    ph *= 0.75 + 0.45 * exp(-(px - 24.0) * (px - 24.0) / 900.0);
    float pw = baseW * (0.7 + 0.6 * hash(vec2(fi + 7.0, seed)));
    float d = abs(x - px) / pw;
    float summit = ph * exp(-pow(d, 1.5));
    float skirt = 0.5 * ph * exp(-pow(d / 2.8, 1.8));
    s = max(s, max(summit, skirt));
  }
  // Fine relief on the flanks, too small to change the silhouette.
  s += 0.03 * vnoise(vec2(x * 0.35 + seed * 9.0, seed));
  return s;
}
// The river's course down the valley, as x for a given depth.
float riverX(float z) {
  return sin(z * 0.075 + 1.4) * 7.0 + sin(z * 0.23 + 0.6) * 2.4;
}
// One range: a ridge line at depth zc, w units thick, amp units tall,
// carrying n summits across a width W. The cross-section is a pyramid in z,
// slightly concave. gap lowers the range where the river passes through.
float range(vec2 p, float zc, float w, float amp, float n, float W, float baseW, float seed, float gap, out float sec) {
  float bend = (vnoise(vec2(p.x * 0.04 + seed * 11.0, seed)) - 0.5) * w * 0.6;
  float dz = abs(p.y - zc - bend);
  float t = max(0.0, 1.0 - dz / w);
  sec = pow(t, 1.3);
  float prof = skyline(p.x, n, W, baseW, seed);
  float open = gap > 0.0 ? mix(0.25, 1.0, smoothstep(0.0, gap, abs(p.x - riverX(zc)))) : 1.0;
  return prof * amp * sec * open;
}

void main() {
  // Warped x: s in [-1, 1] maps to 0.55s + 0.45s^3, so grid spacing near the
  // centre matches the old 130-unit mesh while the ends reach 260 units.
  float gs = (aGrid.x - 0.5) * 2.0;
  float x = (gs * 0.55 + gs * gs * gs * 0.45) * uExtent.x * 0.5;
  float z = aGrid.y * uExtent.y;
  vec2  p = vec2(x, z);
  float drift = uTime * 0.05;

  // Foreground dunes, carved down toward the river.
  float dunes = fbm(p * 0.05 + vec2(drift * 0.4, drift * 0.2)) * 3.0;
  float rx = riverX(z);
  float dr = abs(x - rx);
  dunes *= mix(0.1, 1.0, smoothstep(0.0, 10.0, dr));

  // Three ranges — front, middle, back — with two or three summits in front
  // and three or four behind. Height is the max, so each stands in front of
  // the next; the winning range's cross-section drives the lighting.
  float h = dunes;
  float sec = 0.0;
  float s;
  float r;
  //          zc     w     amp   n    W      baseW seed gap
  r = range(p, 34.0,  15.0, 10.0, 3.0, 76.0,  7.0,  1.0, 12.0, s); if (r > h) { h = r; sec = s; }
  r = range(p, 66.0,  21.0, 24.0, 4.0, 130.0, 11.0, 2.0, 0.0,  s); if (r > h) { h = r; sec = s; }
  r = range(p, 104.0, 27.0, 42.0, 4.0, 200.0, 17.0, 3.0, 0.0,  s); if (r > h) { h = r; sec = s; }

  // Surface detail on the rock faces.
  h += fbm(p * 0.16 + 3.7) * 1.2 * sec;

  // Pointer: a soft lift in the ground where the cursor rests. Scaled with
  // depth, so a far range answers the cursor as visibly on screen as the
  // dunes at the viewer's feet (a 3-unit swell 100 units away is a pixel).
  float mk = mix(1.0, 3.2, smoothstep(12.0, 100.0, uMouse.y));
  float md = distance(p, uMouse);
  float mg = exp(-md * md / (150.0 * mk * mk)) * uMouseGain;
  h += mg * 3.4 * mk;

  // Breathing on the dunes only — slow, low, mechanical. Mountains hold.
  h += sin(uTime * 0.45 + z * 0.18 + x * 0.09) * 0.25 * (1.0 - sec);

  gl_Position = uViewProj * vec4(x, h, z, 1.0);

  float far = aGrid.y;
  float fog = exp(-far * 0.55);
  // Twice the old width, so the river reads as a body of water, not a seam.
  float river = exp(-dr * dr / 6.0) * (1.0 - sec) * smoothstep(0.03, 0.16, far);
  vEdge = smoothstep(uExtent.x * 0.5, uExtent.x * 0.5 - 40.0, abs(x));

  vWorld = vec3(x, h, z);
  vSec   = sec;
  vFar   = far;
  vRiver = river;
  vMouse = mg;

  // Sprites: crest lines, river and pointer only. The body paints the rest.
  float crest = pow(sec, 6.0) * (0.6 + 0.4 * clamp(h / 30.0, 0.0, 1.0));
  float flow  = 0.75 + 0.45 * sin(z * 0.5 - uTime * 2.2);
  float flick = 0.72 + 0.28 * sin(uTime * 1.6 + hash(aGrid) * 6.2832);
  float bright = crest * 1.5 * mix(0.5, 1.0, fog)
               + river * flow * 1.7 * fog * uRiverGain
               + mg * 1.3 * uMouseLight;
  float halo = step(0.5, uPass) * (1.0 - step(1.5, uPass));
  vBright = bright * flick * mix(1.0, 0.16, halo) * vEdge;

  float size = (2.4 + crest * 2.4 + river * 2.2 * uRiverGain + mg * 1.6) * uDpr;
  float px = max(size * 34.0 / max(gl_Position.w, 1.0), 1.2 * uDpr);
  // Vertices with nothing to emit get a zero-size sprite: no fill cost.
  gl_PointSize = mix(px, px * 3.2 + 2.0 * uDpr, halo) * step(0.03, bright);
}
`;

const FRAG = /* glsl */ `
precision mediump float;

uniform vec3 uCarbon;
uniform vec3 uColor;
uniform float uSign; // +1: marks add light to the ground (Carbon). -1: they subtract (paper).
uniform float uGain; // lifts dot contrast on paper (1.0 on Carbon), clamped so bright dots saturate at the target green
uniform highp float uRiverGain; // shared with VERT (highp there): stages must agree or the program fails to link
uniform highp float uMouseLight;
uniform vec3 uTeal; // peak tint: the ridges shade from hydro toward teal with height
uniform vec3 uRiverTone; // the river's own colour (water: cyan), so it stands apart from the green
uniform highp float uDot;
uniform float uFill; // strength of the solid tint across the faces (mass), before uGain
uniform vec3 uHot;
// highp to match the vertex shader: a uniform shared by both stages must
// agree on precision or the program fails to link.
uniform highp float uPass;
uniform highp float uTime;

varying vec3  vWorld;
varying float vSec;
varying float vFar;
varying float vRiver;
varying float vMouse;
varying float vBright;
varying float vEdge;

${NOISE}

void main() {
  if (uPass < 0.5) {
    // ── The terrain body, painted as a dot matrix ─────────────────────────
    float fog = exp(-vFar * 0.55);

    // A world-space dot grid projected onto the surface. Adding height to
    // the depth axis makes the rows climb the faces like contour lines, so a
    // steep slope is dotted as evenly as flat ground.
    vec2 uv = vec2(vWorld.x, vWorld.z + vWorld.y * 1.2) * 2.8;
    vec2 cell = floor(uv);
    vec2 c = fract(uv) - 0.5;
    float d = length(c);

    // Lighting: faces brighten toward the crest, the crest itself is a lit
    // line, the river and the pointer add their own light, and the dunes
    // brighten with height so the foreground has relief.
    float flow  = 0.75 + 0.45 * sin(vWorld.z * 0.5 - uTime * 2.2);
    float light = 0.12
                + 0.7 * pow(vSec, 1.6)
                + pow(vSec, 8.0) * 0.9
                + vRiver * flow * 1.6 * uRiverGain
                + (1.0 - vSec) * clamp(vWorld.y / 3.0, 0.0, 1.0) * 0.25;
    light *= 0.82 + 0.18 * sin(uTime * 1.5 + hash(cell) * 6.2832);

    // Dot radius grows a little with light, so lit faces read denser.
    float rad = uDot + 0.12 * clamp(light, 0.0, 1.0);
    float dotv = smoothstep(rad, rad - 0.10, d);
    // Past the point where a cell is only a pixel or two wide the pattern
    // would alias, so the far ranges dissolve into an even haze.
    dotv = mix(dotv, 0.45, smoothstep(0.78, 1.0, vFar));

    light *= fog;
    // The pointer's light is added after the fog, so a far range lights up
    // under the cursor as clearly as a near one.
    light += vMouse * 0.9 * uMouseLight;
    light *= vEdge;
    vec3 fill = uCarbon + uSign * uColor * uFill * vSec * fog * uGain * vEdge;
    // Two-tone: the high ground leans teal, the valley floor stays hydro.
    float peak = smoothstep(9.0, 30.0, vWorld.y) * 0.55;
    vec3 tone = mix(uColor, uTeal, peak);
    vec3 glow = mix(tone, uHot, clamp(light - 0.9, 0.0, 1.0));
    glow = mix(glow, uRiverTone, clamp(vRiver * 1.4, 0.0, 0.9));
    // On Carbon light adds linearly. On paper a linear gain saturates every
    // lit face at the same dark green and the range goes flat; a soft
    // exponential keeps the gradation from haze to crest.
    float lit = uSign > 0.0 ? min(1.0, light * uGain) : 1.0 - exp(-light * uGain);
    gl_FragColor = vec4(fill + uSign * glow * lit * dotv, 1.0);
    return;
  }

  // ── Sprites. Core: a crisp disc with a short feather. Halo: a wide, soft
  //    falloff. max() stops the sprite's corners (r ≈ 1.41) wrapping back to
  //    positive alpha. ─────────────────────────────────────────────────────
  float halo = step(0.5, uPass) * (1.0 - step(1.5, uPass));
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float soft = max(0.0, 1.0 - r);
  float a = mix(smoothstep(1.0, 0.35, r), soft * soft, halo);
  float b = min(1.0, vBright * uGain);
  vec3 c = mix(mix(uColor, uTeal, smoothstep(9.0, 30.0, vWorld.y) * 0.55), uHot, clamp(b - 0.8, 0.0, 1.0));
  c = mix(c, uRiverTone, clamp(vRiver * 1.4, 0.0, 0.9));
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
  const zAxis = normalize(sub(eye, target));
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

/* ── The height field, on the CPU ─────────────────────────────────────────
   A line-for-line port of the vertex shader's terrain (minus the pointer
   lift and the dune breathing), so the pointer can be ray-marched against
   the actual surface — the mountain under the cursor — rather than dropped
   onto a flat plane far behind it. Keep in step with VERT above. */

function fract(v: number) {
  return v - Math.floor(v);
}
function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function hash2(x: number, y: number) {
  let px = fract(x * 123.34);
  let py = fract(y * 456.21);
  const d = px * (px + 45.32) + py * (py + 45.32);
  px += d;
  py += d;
  return fract(px * py);
}
function vnoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  const ab = a + (b - a) * fx;
  const cd = c + (d - c) * fx;
  return ab + (cd - ab) * fy;
}
function fbm(x: number, y: number) {
  let s = 0;
  let a = 0.5;
  for (let i = 0; i < 4; i++) {
    s += a * vnoise(x, y);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 9.7;
    a *= 0.5;
  }
  return s;
}
function skyline(x: number, n: number, W: number, baseW: number, seed: number) {
  let s = 0.07;
  for (let i = 0; i < 4; i++) {
    if (i >= n) break;
    const px = ((i + 0.5 + (hash2(i, seed) - 0.5) * 0.7) / n) * W - W * 0.5;
    let ph = 0.5 + 0.5 * hash2(i + 3, seed);
    ph *= 0.75 + 0.45 * Math.exp(-((px - 24) * (px - 24)) / 900);
    const pw = baseW * (0.7 + 0.6 * hash2(i + 7, seed));
    const d = Math.abs(x - px) / pw;
    const summit = ph * Math.exp(-Math.pow(d, 1.5));
    const skirt = 0.5 * ph * Math.exp(-Math.pow(d / 2.8, 1.8));
    s = Math.max(s, summit, skirt);
  }
  s += 0.03 * vnoise(x * 0.35 + seed * 9, seed);
  return s;
}
function riverX(z: number) {
  return Math.sin(z * 0.075 + 1.4) * 7 + Math.sin(z * 0.23 + 0.6) * 2.4;
}
function rangeAt(
  x: number,
  z: number,
  zc: number,
  w: number,
  amp: number,
  n: number,
  W: number,
  baseW: number,
  seed: number,
  gap: number,
): [number, number] {
  const bend = (vnoise(x * 0.04 + seed * 11, seed) - 0.5) * w * 0.6;
  const dz = Math.abs(z - zc - bend);
  const t = Math.max(0, 1 - dz / w);
  const sec = Math.pow(t, 1.3);
  const prof = skyline(x, n, W, baseW, seed);
  const open =
    gap > 0 ? 0.25 + 0.75 * smoothstep(0, gap, Math.abs(x - riverX(zc))) : 1;
  return [prof * amp * sec * open, sec];
}
/** World height at (x, z) at a given animation time. */
function terrainHeight(x: number, z: number, time: number) {
  const drift = time * 0.05;
  let dunes = fbm(x * 0.05 + drift * 0.4, z * 0.05 + drift * 0.2) * 3;
  const dr = Math.abs(x - riverX(z));
  dunes *= 0.1 + 0.9 * smoothstep(0, 10, dr);
  let h = dunes;
  let sec = 0;
  let r: [number, number];
  r = rangeAt(x, z, 34, 15, 10, 3, 76, 7, 1, 12);
  if (r[0] > h) [h, sec] = r;
  r = rangeAt(x, z, 66, 21, 24, 4, 130, 11, 2, 0);
  if (r[0] > h) [h, sec] = r;
  r = rangeAt(x, z, 104, 27, 42, 4, 200, 17, 3, 0);
  if (r[0] > h) [h, sec] = r;
  h += fbm(x * 0.16 + 3.7, z * 0.16 + 3.7) * 1.2 * sec;
  return h;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
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
      depth: true,
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

    // ── Geometry: one (u, v) pair per vertex, plus a triangle index ─────────
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

    const index = new Uint16Array((ROWS - 1) * (COLS - 1) * 6);
    let k = 0;
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const a = r * COLS + c;
        const b = a + 1;
        const d = a + COLS;
        const e = d + 1;
        index[k++] = a;
        index[k++] = d;
        index[k++] = b;
        index[k++] = b;
        index[k++] = d;
        index[k++] = e;
      }
    }
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

    // ── Uniforms ────────────────────────────────────────────────────────────
    const u = {
      viewProj: gl.getUniformLocation(program, "uViewProj"),
      time: gl.getUniformLocation(program, "uTime"),
      extent: gl.getUniformLocation(program, "uExtent"),
      mouse: gl.getUniformLocation(program, "uMouse"),
      mouseGain: gl.getUniformLocation(program, "uMouseGain"),
      dpr: gl.getUniformLocation(program, "uDpr"),
      pass: gl.getUniformLocation(program, "uPass"),
      carbon: gl.getUniformLocation(program, "uCarbon"),
      color: gl.getUniformLocation(program, "uColor"),
      hot: gl.getUniformLocation(program, "uHot"),
      sign: gl.getUniformLocation(program, "uSign"),
      gain: gl.getUniformLocation(program, "uGain"),
      riverGain: gl.getUniformLocation(program, "uRiverGain"),
      mouseLight: gl.getUniformLocation(program, "uMouseLight"),
      teal: gl.getUniformLocation(program, "uTeal"),
      riverTone: gl.getUniformLocation(program, "uRiverTone"),
      dot: gl.getUniformLocation(program, "uDot"),
      fill: gl.getUniformLocation(program, "uFill"),
    };
    gl.uniform2f(u.extent, EXTENT_X, EXTENT_Z);
    // Ground and mark colours follow the theme. On paper the marks SUBTRACT
    // from the ground (uSign = -1) and the sprite blend flips to match, so
    // one shader serves both themes.
    const applyPalette = () => {
      const pal = canvasPalette();
      gl.uniform3f(u.carbon, ...pal.ground);
      gl.uniform3f(u.color, ...pal.hydroVec);
      gl.uniform3f(u.hot, ...pal.hotVec);
      gl.uniform1f(u.sign, pal.subtractive ? -1 : 1);
      gl.uniform1f(u.gain, pal.gain);
      gl.uniform1f(u.riverGain, pal.riverGain);
      gl.uniform1f(u.mouseLight, pal.mouseLight);
      gl.uniform3f(u.teal, ...pal.tealVec);
      gl.uniform3f(u.riverTone, ...pal.riverVec);
      gl.uniform1f(u.dot, pal.dot);
      gl.uniform1f(u.fill, pal.fill);
      return pal.subtractive;
    };
    let subtractive = applyPalette();

    gl.clearColor(0, 0, 0, 0);
    gl.depthFunc(gl.LEQUAL);
    // Push the body a hair further from the camera than the sprites that sit
    // on it, so crest sprites pass the depth test instead of z-fighting.
    gl.polygonOffset(2.0, 4.0);

    // ── Camera ──────────────────────────────────────────────────────────────
    const worldUp: Vec3 = [0, 1, 0];
    const tanHalf = Math.tan((FOV_DEG * Math.PI) / 180 / 2);

    let aspect = 1;
    let dpr = 1;
    let running = false;
    let proj = perspective((FOV_DEG * Math.PI) / 180, 1, 0.5, 400);

    // Scroll scrub: as the hero scrolls away the camera pitches down and
    // pulls back a little, so the range parallaxes against the copy.
    const cameraNow = (): { eye: Vec3; target: Vec3 } => {
      const sp = reduced
        ? 0
        : Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * 0.55)));
      return {
        eye: [EYE[0], EYE[1] + sp * 3, EYE[2] - sp * 8],
        target: [TARGET[0], TARGET[1] - sp * 10, TARGET[2]],
      };
    };
    const viewNow = () => {
      const c = cameraNow();
      return lookAt(c.eye, c.target, worldUp);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      aspect = rect.width / rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      proj = perspective((FOV_DEG * Math.PI) / 180, aspect, 0.5, 400);
      gl.uniform1f(u.dpr, dpr);
      // Assigning canvas.width clears the bitmap; under reduced motion there
      // is no next frame to repaint it, so paint now.
      if (!running) draw(performance.now());
    };

    // ── Pointer → the point on the SURFACE under it ─────────────────────────
    // The ray from the eye through the cursor is marched against the CPU
    // copy of the height field until it enters the terrain, then refined by
    // bisection. So the light lands on the face of the far mountain the
    // cursor is over, not on the ground plane somewhere behind it — and a
    // cursor over the sky lights nothing.
    let mx = 0;
    let mz = 0;
    let tx = 0;
    let tz = 0;
    let gain = 0;
    let targetGain = 0;
    let simTime = 0;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const { eye, target } = cameraNow();
      const fwd = normalize(sub(target, eye));
      const rgt = normalize(cross(fwd, worldUp));
      const upv = cross(rgt, fwd);
      const dir: Vec3 = normalize([
        fwd[0] + rgt[0] * nx * tanHalf * aspect + upv[0] * ny * tanHalf,
        fwd[1] + rgt[1] * nx * tanHalf * aspect + upv[1] * ny * tanHalf,
        fwd[2] + rgt[2] * nx * tanHalf * aspect + upv[2] * ny * tanHalf,
      ]);
      const under = (t: number) =>
        eye[1] + dir[1] * t < terrainHeight(eye[0] + dir[0] * t, eye[2] + dir[2] * t, simTime);
      let hit = -1;
      let prev = 0.5;
      for (let t = 1; t < 280; t += t < 60 ? 0.75 : 1.5) {
        const z = eye[2] + dir[2] * t;
        if (z > EXTENT_Z) break;
        if (z >= 0 && Math.abs(eye[0] + dir[0] * t) <= EXTENT_X / 2 && under(t)) {
          let a = prev;
          let b = t;
          for (let i = 0; i < 7; i++) {
            const m = (a + b) / 2;
            if (under(m)) b = m;
            else a = m;
          }
          hit = b;
          break;
        }
        prev = t;
      }
      if (hit < 0) {
        // The ray missed the range (the pointer is above the ridgeline, in
        // the sky, or beside the canvas). Still light the nearest point on
        // the ground under that screen column, so the range keeps answering
        // the cursor wherever it is on the page, instead of going dark the
        // moment it leaves the slopes.
        const t = 140;
        tx = Math.max(-EXTENT_X / 2, Math.min(EXTENT_X / 2, eye[0] + dir[0] * t));
        tz = Math.max(4, Math.min(EXTENT_Z - 4, eye[2] + dir[2] * t));
        targetGain = 0.8;
        wake();
        return;
      }
      tx = eye[0] + dir[0] * hit;
      tz = eye[2] + dir[2] * hit;
      targetGain = 1;
      wake();
    };
    const onLeave = () => {
      targetGain = 0;
      wake();
    };

    // ── Frame ───────────────────────────────────────────────────────────────
    const t0 = performance.now();
    let lastNow = 0;
    // An arrow, not a function declaration: a declaration is hoisted above the
    // `if (!gl) return` guard and loses its narrowing.
    const draw = (now: number) => {
      subtractive = applyPalette();
      // Time-based easing, so the swell glides at the same speed on a 60 Hz
      // and a 144 Hz screen and never jumps after a dropped frame. A low rate
      // turns the raycast's discrete jumps (the pointer crossing from one
      // ridge to the range behind it) into a smooth travel across the ground.
      const dt = Math.min(0.05, lastNow ? (now - lastNow) / 1000 : 0.016);
      lastNow = now;
      const kPos = 1 - Math.exp(-dt * 6.5);
      const kGain = 1 - Math.exp(-dt * 4);
      mx += (tx - mx) * kPos;
      mz += (tz - mz) * kPos;
      // The range swells under the pointer in both themes. How much the
      // swell also darkens/lights the dots is uMouseLight (palette), kept low
      // on paper so it reads as relief rather than a shadow.
      gain += (targetGain - gain) * kGain;

      gl.uniformMatrix4fv(u.viewProj, false, multiply(proj, viewNow()));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      simTime = reduced ? 0 : (now - t0) / 1000;
      gl.uniform1f(u.time, simTime);
      gl.uniform2f(u.mouse, mx, mz);
      gl.uniform1f(u.mouseGain, gain);

      // Pass 0 — the dotted body. Opaque, writes depth.
      gl.uniform1f(u.pass, 0);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.POLYGON_OFFSET_FILL);

      // Passes 1–2 — the glow sprites, depth-tested, additive.
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      if (subtractive) gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
      else gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform1f(u.pass, 1);
      gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
      gl.uniform1f(u.pass, 2);
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

    // Touch: a tap lights the ground under the finger for a moment, then
    // the light lets go. The continuous coupling stays mouse-only.
    let tapTimer = 0;
    const onTap = (e: PointerEvent) => {
      if (fine) return;
      onPointer(e);
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(onLeave, 1100);
    };
    canvas.addEventListener("pointerdown", onTap, { passive: true });
    if (fine) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      // Only when the pointer leaves the window itself does the light let
      // go; leaving the canvas or the hero is not a reason to stop.
      document.documentElement.addEventListener("pointerleave", onLeave, { passive: true });
    }

    // A theme change repaints once even while the loop is parked.
    const offTheme = subscribeTheme(() => draw(performance.now()));

    return () => {
      offTheme();
      stop();
      canvas.removeEventListener("pointerdown", onTap);
      window.clearTimeout(tapTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(indexBuffer);
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
          "linear-gradient(180deg, transparent 0%, #000 22%, #000 100%), linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.5) 38%, #000 62%)",
        WebkitMaskComposite: "source-in",
        maskImage:
          "linear-gradient(180deg, transparent 0%, #000 22%, #000 100%), linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.5) 38%, #000 62%)",
        maskComposite: "intersect",
      }}
    />
  );
}
