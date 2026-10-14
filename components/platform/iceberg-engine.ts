/**
 * "The Iceberg": a point-cloud iceberg in WebGL2, drawn with the site's own
 * toolkit (lib/gl/core.ts) rather than three.js. Ported from the preview
 * site's iceberg-engine.ts; the scene, the camera path and the shaders are
 * the same.
 *
 * Page scroll drives the camera: the GPU rack on the tip, the waterline,
 * one lit stratum per platform layer, then the whole berg with every layer
 * pinned. Captions, pins, a leader line and a depth gauge are DOM elements
 * the page renders (iceberg-dive.tsx); this module only moves them. Past
 * the dive the stage is clipped at the end of the scroll track (--ib-out,
 * app/styles/iceberg.css), so the next section rises over plain page ground.
 *
 * Particles part around the pointer, a click or tap sends a sonar ping
 * through ice and water, and a mouse drag spins the berg. Colours follow
 * the site theme (readPalette); ambient motion stops when motion is reduced.
 *
 * Loaded with a dynamic import, so only /platform pays for it. Returns a
 * cleanup function that releases every GPU resource and listener.
 */
import { compileProgram, lookAt, multiply, perspective, uniforms, type Mat4 } from "@/lib/gl/core";
import { readMotion, readPalette, subscribePrefs, type RGB } from "@/lib/theme";

export interface DiveElements {
  /** The tall scroll track whose progress drives the dive. */
  track: HTMLElement;
  /** Fixed wrapper of the canvas, sky and overlays. */
  stage: HTMLElement;
  sky: HTMLElement;
  caps: HTMLElement[];
  pins: HTMLElement;
  leaderPath: SVGPathElement;
  leaderHalo: SVGPathElement;
  leaderDot: SVGCircleElement;
  leader: SVGElement;
  gaugeFill: HTMLElement;
  gaugeNow: HTMLElement;
  gaugeRead: HTMLElement;
  gaugeButtons: HTMLButtonElement[];
}

export interface DiveOptions {
  els: DiveElements;
  /** Layer titles, top to bottom: one stratum and one pin each. */
  layers: readonly string[];
  /** Read-out at the top of the gauge. */
  surface: string;
}

type V3 = [number, number, number];

const TAU = Math.PI * 2;
const BAND_TOP = -0.55;
const BOTTOM = -11.2;
const FOV = (38 * Math.PI) / 180;
const fract = (x: number) => x - Math.floor(x);
const subC = (y: number): [number, number] => [0.55 * Math.sin(y * 0.33), 0.45 * Math.cos(y * 0.26) - 0.45];

/* ── Small vector helpers ─────────────────────────────────────────────── */
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => scale(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
const mix3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Radius of the submerged mass at depth y and angle th. */
function subR(y: number, th: number) {
  const u = Math.min(1, Math.max(0, -y / -BOTTOM));
  let r =
    u < 0.24 ? 3.55 + 1.85 * Math.sin((u / 0.24) * (Math.PI / 2)) : 5.4 * Math.pow(1 - (u - 0.24) / 0.76, 0.72) + 0.12;
  r *= 1 + 0.15 * Math.sin(3 * th + 1.3) + 0.09 * Math.sin(5 * th + y * 0.42) + 0.05 * Math.sin(9 * th - y * 0.9);
  r *= 1 + 0.07 * (Math.abs(fract((th * 7) / TAU + y * 0.13) - 0.5) * 2 - 0.5);
  r *= 1 + 0.05 * (Math.abs(fract((th * 3) / TAU - y * 0.31) - 0.5) * 2 - 0.5);
  return r;
}

interface Spire {
  x: number;
  z: number;
  h: number;
  r: number;
  s: number;
}
const SPIRES: Spire[] = [
  { x: 0.35, z: -0.25, h: 3.5, r: 2.5, s: 1 },
  { x: -1.55, z: 0.75, h: 2.25, r: 1.9, s: 2 },
  { x: 1.7, z: 0.95, h: 1.55, r: 1.7, s: 3 },
  { x: -0.35, z: 1.75, h: 1.15, r: 1.6, s: 4 },
  { x: 2.3, z: -1.2, h: 0.9, r: 1.3, s: 5 },
];
function spireR(sp: Spire, y: number, th: number) {
  const k = Math.pow(Math.max(0, 1 - y / sp.h), 0.82);
  let r = sp.r * k * (1 + 0.13 * Math.sin(4 * th + sp.s * 2.1) + 0.07 * Math.sin(7 * th + y * 2 + sp.s));
  r *= 1 + 0.08 * (Math.abs(fract((th * 5) / TAU + y * 0.7 + sp.s * 0.3) - 0.5) * 2 - 0.5);
  return r;
}
const APEX = SPIRES[0]!;
const RACK = { x: APEX.x, z: APEX.z, y0: APEX.h * 0.87, w: 0.66, d: 0.48, h: 1.25 };

/* ── Palette, from the site's tokens ──────────────────────────────────── */
interface Palette {
  add: boolean;
  bgTop: V3;
  bgBot: V3;
  iceTop: V3;
  iceSub: V3;
  deep: V3;
  hot: V3;
  rack: V3;
  lit: V3;
  water: V3;
  snow: V3;
  ring: V3;
}
const toS = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const srgb = (c: RGB): V3 => [toS(c[0]), toS(c[1]), toS(c[2])];
const WHITE: V3 = [1, 1, 1];

function makePalette(): Palette {
  const p = readPalette();
  const hydro = srgb(p.hydro);
  const bg = srgb(p.bg).map((c) => c * 255) as V3;
  if (p.theme === "dark") {
    return {
      add: true,
      bgTop: [20, 22, 26],
      bgBot: [0, 0, 0],
      iceTop: [0.9, 0.9, 0.92],
      iceSub: hydro,
      deep: scale(hydro, 0.5),
      hot: mix3(hydro, WHITE, 0.65),
      rack: [0.32, 0.32, 0.36],
      lit: hydro,
      water: hydro,
      snow: mix3(hydro, WHITE, 0.55),
      ring: hydro,
    };
  }
  return {
    add: false,
    bgTop: bg,
    bgBot: mix3(bg, scale(hydro, 255), 0.16),
    iceTop: [0.32, 0.42, 0.47],
    iceSub: hydro,
    deep: mix3(hydro, [0.05, 0.22, 0.32], 0.55),
    hot: scale(hydro, 0.55),
    rack: [0.1, 0.13, 0.18],
    lit: hydro,
    water: scale(hydro, 0.85),
    snow: scale(hydro, 0.75),
    ring: hydro,
  };
}

/* ── Shaders (GLSL ES 1.00, which WebGL2 accepts) ─────────────────────── */
const COMMON = /* glsl */ `
  precision highp float;
  uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
  attribute vec3 position;
  uniform float uTime, uPR, uSize, uIntro, uMouseK, uActive, uAll, uCamY, uGain, uMotion, uFar;
  uniform vec3 uMouse; uniform vec4 uPing;
  varying vec3 vColor; varying float vAlpha;
  float pingAt(vec3 w) {
    float age = uTime - uPing.w;
    if (age < 0.0 || age > 6.0) return 0.0;
    float front = age * 5.5;
    return exp(-pow(length(w - uPing.xyz) - front, 2.0) * 0.9) * exp(-age * 0.55);
  }
`;
const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.12, d));
  }
`;

const BERG_VERT =
  COMMON +
  /* glsl */ `
  attribute float aRand, aKind, aBand;
  uniform vec3 uIceTop, uIceSub, uDeep, uHot, uRack, uLit;
  void main() {
    vec3 p = position;
    vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 57.3) * 0.7, sin(aRand * 33.1 + 1.0)));
    float k = clamp(uIntro * 1.6 - aRand * 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    p += dir * (1.0 - k) * (9.0 + aRand * 6.0);
    if (aKind < 2.5) p.xz *= 1.0 + 0.006 * sin(uTime * 0.7 + aRand * 6.2832) * uMotion;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vec3 dv = w.xyz - uMouse; float dl = length(dv);
    float m = exp(-dl * dl / 2.6) * uMouseK;
    w.xyz += normalize(dv + 1e-4) * m * 0.6;
    float pg = pingAt(w.xyz);
    float act = aBand < -0.5 ? 0.0 : 1.0 - smoothstep(0.0, 0.75, abs(aBand - uActive));
    act = max(act, aBand < -0.5 ? 0.0 : uAll * 0.55);
    float dep = clamp(-position.y / 11.0, 0.0, 1.0);
    vec3 base; float a;
    if (aKind < 0.5 || aKind > 4.5) { base = uIceTop; a = aKind > 4.5 ? 0.55 : 0.85; }
    else if (aKind < 1.5) { base = mix(uIceSub, uDeep, dep); a = 0.78 - dep * 0.25; }
    else if (aKind < 2.5) { base = mix(uIceSub, uDeep, dep); a = 0.16; }
    else if (aKind < 3.5) { base = uRack; a = 0.9; }
    else { base = uLit; a = 0.55 + 0.45 * (0.5 + 0.5 * sin(uTime * 3.0 + aRand * 40.0) * uMotion); }
    if ((w.y < 0.0) != (uCamY < 0.0)) { a *= 0.55; base = mix(base, uDeep, 0.35); }
    vColor = mix(base, uHot, clamp(act * 0.7 + m * 0.55 + pg * 0.9, 0.0, 1.0));
    a *= 0.86 + 0.14 * sin(uTime * 1.3 + aRand * 60.0) * uMotion;
    a += act * 0.32 + m * 0.35 + pg * 0.8;
    vec4 mv = viewMatrix * w;
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + 0.75 * aRand) * (1.0 + act * 0.45 + m * 1.1 + pg * 1.3);
    if (aKind > 2.5 && aKind < 4.5) size *= 1.25;
    gl_PointSize = min(26.0, size * uPR / -mv.z);
    vAlpha = clamp(a, 0.0, 1.0) * uGain * smoothstep(80.0 * uFar, 18.0 * uFar, -mv.z) * k;
  }`;

const SEA_VERT =
  COMMON +
  /* glsl */ `
  uniform vec3 uWater;
  void main() {
    vec3 p = position; float t = uTime * uMotion;
    float wave = 0.07 * sin(p.x * 0.55 + t * 0.9) + 0.05 * sin(p.z * 0.8 - t * 1.2) + 0.03 * sin((p.x + p.z) * 1.4 + t * 1.7);
    float age = uTime - uPing.w;
    float pd = length(p.xz - uPing.xz);
    float ring = age > 0.0 && age < 6.0 ? sin(pd * 2.6 - age * 7.0) * exp(-abs(pd - age * 4.0) * 0.7) * exp(-age * 0.5) : 0.0;
    float md = length(p.xz - uMouse.xz);
    float mr = exp(-md * md / 6.0) * uMouseK * step(-2.5, uMouse.y) * step(uMouse.y, 2.5);
    p.y += wave + ring * 0.32 + mr * 0.25;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float crest = clamp(wave * 6.0 + 0.5, 0.0, 1.0);
    vColor = uWater;
    float fade = smoothstep(36.0, 7.0, length(p.xz));
    vAlpha = (0.22 + 0.35 * crest + abs(ring) * 0.9 + mr * 0.8) * fade * uGain * uIntro;
    gl_PointSize = min(18.0, uSize * 0.62 * (1.0 + abs(ring) * 1.2 + mr) * uPR / -mv.z);
  }`;

const SNOW_VERT =
  COMMON +
  /* glsl */ `
  attribute float aRand; uniform vec3 uSnow;
  void main() {
    vec3 p = position; float t = uTime * uMotion;
    p.y = -14.0 + mod(p.y + t * (0.06 + 0.12 * aRand), 13.6);
    p.x += sin(t * 0.21 + aRand * 12.0) * 0.4;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vColor = uSnow;
    vAlpha = (0.12 + 0.28 * aRand) * smoothstep(0.6, -0.6, uCamY) * smoothstep(40.0 * uFar, 6.0 * uFar, -mv.z) * uGain;
    gl_PointSize = min(10.0, uSize * 0.5 * (0.4 + aRand) * uPR / -mv.z);
  }`;

const RING_VERT = /* glsl */ `
  precision highp float;
  uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
  attribute vec3 position;
  void main() { gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`;
const RING_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor; uniform float uOpacity;
  void main() { gl_FragColor = vec4(uColor, uOpacity); }`;

export function startIceberg(canvas: HTMLCanvasElement, opts: DiveOptions): () => void {
  const dive = opts.els;
  const NB = opts.layers.length;
  const STEPS = NB + 3;
  const BAND_H = 10 / NB;
  const bandY = (b: number) => BAND_TOP - (b + 0.5) * BAND_H;

  let reduced = readMotion() === "reduce";
  let small = window.matchMedia("(max-width: 900px)").matches;
  // Touch devices get a lighter cloud: phones are also carrying the rest of
  // the page, and the difference doesn't show at their pixel sizes.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const Q = small || coarse ? 0.52 : 1;

  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: coarse ? "default" : "high-performance",
  });
  if (!gl) throw new Error("webgl2 unavailable");

  /* ── Sample the berg. kind: 0 ice above · 1 submerged surface · 2 interior ·
        3 rack frame · 4 lit blade · 5 waterline shelf ─────────────────────── */
  const P: number[] = [],
    R: number[] = [],
    K: number[] = [],
    B: number[] = [];
  const push = (x: number, y: number, z: number, kind: number, band: number) => {
    P.push(x, y, z);
    R.push(Math.random());
    K.push(kind);
    B.push(band);
  };
  const bandOf = (y: number) => {
    const b = Math.floor((BAND_TOP - y) / BAND_H);
    return b >= 0 && b < NB ? b : -1;
  };
  {
    let n = Math.round(78000 * Q),
      guard = 0;
    while (n > 0 && guard++ < 2e6) {
      const y = BOTTOM + Math.random() * -BOTTOM,
        th = Math.random() * TAU,
        r = subR(y, th);
      if (Math.random() > r / 6.2) continue;
      const [cx, cz] = subC(y),
        rr = r - Math.random() * 0.1;
      push(cx + rr * Math.cos(th), y, cz + rr * Math.sin(th), 1, bandOf(y));
      n--;
    }
    n = Math.round(15000 * Q);
    while (n-- > 0) {
      const y = BOTTOM * 0.95 * Math.random(),
        th = Math.random() * TAU,
        [cx, cz] = subC(y);
      const rr = subR(y, th) * Math.sqrt(Math.random()) * 0.94;
      push(cx + rr * Math.cos(th), y, cz + rr * Math.sin(th), 2, bandOf(y));
    }
    n = Math.round(6000 * Q);
    while (n-- > 0) {
      const th = Math.random() * TAU,
        [cx, cz] = subC(0),
        rr = subR(0, th) * Math.sqrt(Math.random());
      push(cx + rr * Math.cos(th), (Math.random() - 0.5) * 0.08, cz + rr * Math.sin(th), 5, -1);
    }
    const area = SPIRES.map((s) => s.r * Math.hypot(s.h, s.r));
    const total = area.reduce((a, b) => a + b, 0);
    SPIRES.forEach((sp, i) => {
      let m = Math.round((20000 * Q * area[i]!) / total),
        g = 0;
      while (m > 0 && g++ < 1e6) {
        const y = Math.random() * sp.h,
          th = Math.random() * TAU,
          r = spireR(sp, y, th);
        if (Math.random() > r / (sp.r * 1.25)) continue;
        if (sp === APEX && y > RACK.y0 - 0.05) continue;
        const rr = r - Math.random() * 0.06;
        push(sp.x + rr * Math.cos(th), y, sp.z + rr * Math.sin(th), 0, -1);
        m--;
      }
    });
    const st = small ? 0.045 : 0.03,
      { x, z, y0, w, d, h } = RACK;
    for (let yy = 0; yy <= h; yy += st) {
      const row = fract((yy / h) * 13),
        lit = row > 0.2 && row < 0.62 && yy > 0.08 && yy < h - 0.06;
      for (let a = -w / 2; a <= w / 2; a += st) {
        const inset = Math.abs(a) < w / 2 - 0.07;
        push(x + a, y0 + yy, z + d / 2, lit && inset ? 4 : 3, -1);
        push(x + a, y0 + yy, z - d / 2, 3, -1);
      }
      for (let c = -d / 2; c <= d / 2; c += st) {
        const inset = Math.abs(c) < d / 2 - 0.06;
        push(x + w / 2, y0 + yy, z + c, lit && inset ? 4 : 3, -1);
        push(x - w / 2, y0 + yy, z + c, 3, -1);
      }
    }
    for (let a = -w / 2; a <= w / 2; a += st)
      for (let c = -d / 2; c <= d / 2; c += st) push(x + a, y0 + h, z + c, 3, -1);
  }

  /* Strata rings: one contour per layer, in one buffer. */
  const RING_N = 221;
  const RINGS: number[] = [];
  for (let b = 0; b < NB; b++) {
    const y = bandY(b),
      [cx, cz] = subC(y);
    for (let i = 0; i < RING_N; i++) {
      const th = (i / (RING_N - 1)) * TAU,
        r = subR(y, th) + 0.32;
      RINGS.push(cx + r * Math.cos(th), y, cz + r * Math.sin(th));
    }
  }

  /* The sea surface and the marine snow below it. */
  const W: number[] = [];
  {
    const N = small ? 150 : 230,
      S = 72,
      [cx, cz] = subC(0);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const x = (i / (N - 1) - 0.5) * S,
          z = (j / (N - 1) - 0.5) * S;
        const th = Math.atan2(z - cz, x - cx);
        if (Math.hypot(x - cx, z - cz) < subR(0, th) + 0.25) continue;
        W.push(x + (Math.random() - 0.5) * 0.08, 0, z + (Math.random() - 0.5) * 0.08);
      }
  }
  const SN = small ? 1400 : 3200,
    snow = new Float32Array(SN * 3),
    snowR = new Float32Array(SN);
  for (let i = 0; i < SN; i++) {
    snow[i * 3] = (Math.random() - 0.5) * 50;
    snow[i * 3 + 1] = Math.random() * 14;
    snow[i * 3 + 2] = (Math.random() - 0.5) * 50;
    snowR[i] = Math.random();
  }

  /* ── GPU resources ───────────────────────────────────────────────────── */
  const buffers: WebGLBuffer[] = [];
  const vaos: WebGLVertexArrayObject[] = [];
  const programs: WebGLProgram[] = [];
  const program = (vs: string, fs: string) => {
    const p = compileProgram(gl, vs, fs);
    programs.push(p);
    return { p, u: uniforms(gl, p) };
  };
  const geometry = (p: WebGLProgram, attrs: Record<string, { data: Float32Array; size: number }>) => {
    const vao = gl.createVertexArray()!;
    vaos.push(vao);
    gl.bindVertexArray(vao);
    for (const [name, { data, size }] of Object.entries(attrs)) {
      const loc = gl.getAttribLocation(p, name);
      if (loc < 0) continue;
      const buf = gl.createBuffer()!;
      buffers.push(buf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }
    gl.bindVertexArray(null);
    return vao;
  };

  const berg = program(BERG_VERT, FRAG);
  const sea = program(SEA_VERT, FRAG);
  const snowP = program(SNOW_VERT, FRAG);
  const ring = program(RING_VERT, RING_FRAG);
  const bergCount = P.length / 3,
    seaCount = W.length / 3;
  const bergVao = geometry(berg.p, {
    position: { data: new Float32Array(P), size: 3 },
    aRand: { data: new Float32Array(R), size: 1 },
    aKind: { data: new Float32Array(K), size: 1 },
    aBand: { data: new Float32Array(B), size: 1 },
  });
  const seaVao = geometry(sea.p, { position: { data: new Float32Array(W), size: 3 } });
  const snowVao = geometry(snowP.p, { position: { data: snow, size: 3 }, aRand: { data: snowR, size: 1 } });
  const ringVao = geometry(ring.p, { position: { data: new Float32Array(RINGS), size: 3 } });

  /* Uniforms shared by the three point programs. */
  const U = {
    uTime: 0,
    uPR: 1,
    uSize: 38,
    uIntro: reduced ? 1 : 0,
    uMouse: [0, -99, 0] as V3,
    uMouseK: 0,
    uPing: [0, -99, 0, -99] as [number, number, number, number],
    uActive: -10,
    uAll: 0,
    uCamY: 10,
    uGain: 1,
    uMotion: reduced ? 0 : 1,
    /** How far a tall screen pulls the camera back; the depth fade follows. */
    uFar: 1,
  };
  let pal = makePalette();
  const applyPrefs = () => {
    pal = makePalette();
    reduced = readMotion() === "reduce";
    U.uMotion = reduced ? 0 : 1;
    if (reduced) U.uIntro = 1;
    labelW.length = 0;
  };
  const offPrefs = subscribePrefs(applyPrefs);

  /* ── Camera path ─────────────────────────────────────────────────────── */
  const RACK_C: V3 = [RACK.x, RACK.y0 + RACK.h * 0.55, RACK.z];
  interface Key {
    p: V3;
    t: V3;
    s: number;
  }
  const key = (i: number): Key => {
    if (i <= 0) return { p: [10.5, 5.2, 22], t: [-0.5, 0.6, 0], s: 0.33 };
    if (i === 1) return { p: [5.4, 5.9, 9.6], t: add(RACK_C, [0, -0.4, 0]), s: 0.3 };
    if (i === 2) return { p: [8.5, 0.9, 16.5], t: [0, -1.6, 0], s: 0.3 };
    if (i <= NB + 2) {
      const b = i - 3,
        y = bandY(b),
        ph = 0.55 + b * 0.3,
        dist = 25 - b * 0.4;
      return { p: [Math.sin(ph) * dist, y + 2.6, Math.cos(ph) * dist], t: [0, y - 0.3, 0], s: 0.36 };
    }
    return { p: [-4, -3.2, 41], t: [0, -3.9, 0], s: 0.38 };
  };
  const KEYS = Array.from({ length: STEPS + 1 }, (_, i) => key(i));
  const ease = (x: number) => x * x * x * (x * (6 * x - 15) + 10);
  let camP: V3 = [0, 0, 0],
    camT: V3 = [0, 0, 0],
    camS = 0;
  const pose = (t: number) => {
    const i = Math.min(STEPS - 1, Math.max(0, Math.floor(t))),
      f = ease(Math.min(1, Math.max(0, t - i)));
    const a = KEYS[i]!,
      b = KEYS[i + 1]!;
    camP = mix3(a.p, b.p, f);
    camT = mix3(a.t, b.t, f);
    camS = a.s + (b.s - a.s) * f;
  };

  /* The camera this frame: position, basis, projection and their product. */
  let eye: V3 = [0, 0, 10],
    right: V3 = [1, 0, 0],
    up: V3 = [0, 1, 0],
    back: V3 = [0, 0, 1];
  let shiftX = 0,
    shiftY = 0,
    aspect = 1;
  let view: Mat4 = new Float32Array(16),
    proj: Mat4 = new Float32Array(16),
    vp: Mat4 = new Float32Array(16);
  let rotY = 0;
  const model = new Float32Array(16);
  const setModel = (th: number) => {
    const c = Math.cos(th),
      s = Math.sin(th);
    model.fill(0);
    model[0] = c;
    model[2] = -s;
    model[5] = 1;
    model[8] = s;
    model[10] = c;
    model[15] = 1;
  };
  setModel(0);
  const localToWorld = (v: V3): V3 => {
    const c = Math.cos(rotY),
      s = Math.sin(rotY);
    return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]];
  };
  const worldToLocal = (v: V3): V3 => {
    const c = Math.cos(rotY),
      s = Math.sin(rotY);
    return [c * v[0] - s * v[2], v[1], s * v[0] + c * v[2]];
  };

  /* ── Size ────────────────────────────────────────────────────────────── */
  let vw = 1,
    vh = 1,
    pr = 1;
  /** Pin label widths, measured on first use and again after a resize. */
  const labelW: number[] = [];
  const resize = () => {
    labelW.length = 0;
    small = window.matchMedia("(max-width: 900px)").matches;
    const rect = canvas.getBoundingClientRect();
    vw = Math.max(1, rect.width);
    vh = Math.max(1, rect.height);
    pr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2);
    canvas.width = Math.round(vw * pr);
    canvas.height = Math.round(vh * pr);
    aspect = vw / vh;
    U.uPR = pr;
    U.uSize = small ? 34 : 38;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ── Projection helpers ──────────────────────────────────────────────── */
  const toScreen = (w: V3) => {
    const cx = vp[0]! * w[0] + vp[4]! * w[1] + vp[8]! * w[2] + vp[12]!;
    const cy = vp[1]! * w[0] + vp[5]! * w[1] + vp[9]! * w[2] + vp[13]!;
    const cz = vp[2]! * w[0] + vp[6]! * w[1] + vp[10]! * w[2] + vp[14]!;
    const cw = vp[3]! * w[0] + vp[7]! * w[1] + vp[11]! * w[2] + vp[15]!;
    const k = 1 / (cw || 1e-6);
    return { x: (cx * k * 0.5 + 0.5) * vw, y: (-cy * k * 0.5 + 0.5) * vh, ok: cw > 0 && cz * k < 1 };
  };
  /** The world ray through a point in normalised device coordinates. */
  const rayAt = (nx: number, ny: number) => {
    const f = 1 / Math.tan(FOV / 2);
    const xe = ((nx - shiftX) * aspect) / f,
      ye = (ny - shiftY) / f;
    return norm(sub(add(scale(right, xe), scale(up, ye)), back));
  };
  /** Where a ray from the eye meets the plane through camT facing the camera. */
  const hitPlane = (dir: V3): V3 | null => {
    const n = scale(back, 1);
    const den = dot(dir, n);
    if (Math.abs(den) < 1e-6) return null;
    const t = dot(sub(camT, eye), n) / den;
    return t >= 0 ? add(eye, scale(dir, t)) : null;
  };

  /* ── Input ───────────────────────────────────────────────────────────── */
  let nx = 9,
    ny = 9;
  let hasPointer = false,
    lastMove = -1e9,
    yaw = 0,
    yawVel = 0,
    dragging = false,
    downX = 0,
    downY = 0,
    moved = 0;
  let parallax: [number, number] = [0, 0];
  let parallaxT: [number, number] = [0, 0];
  let mouseW: V3 = [0, -99, 0];
  const skip = (e: Event) => !!(e.target as Element | null)?.closest?.("a, button, header, footer, input, textarea");
  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    return inside;
  };
  let active = true; // the track is on screen
  const onMove = (e: PointerEvent) => {
    const inside = toNdc(e);
    hasPointer = inside && active;
    if (hasPointer) {
      parallaxT = [nx, ny];
      lastMove = performance.now();
    }
    if (dragging) {
      moved = Math.max(moved, Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY));
      yawVel += (e.movementX || 0) * 0.0035;
    }
  };
  const onDown = (e: PointerEvent) => {
    if (skip(e) || !toNdc(e) || !active) return;
    dragging = e.pointerType === "mouse";
    downX = e.clientX;
    downY = e.clientY;
    moved = 0;
  };
  const onUp = (e: PointerEvent) => {
    const wasDown = dragging || e.pointerType !== "mouse";
    dragging = false;
    if (!wasDown || skip(e) || !toNdc(e) || !active || moved >= 6) return;
    const p = hitPlane(rayAt(nx, ny)) ?? camT;
    U.uPing = [p[0], p[1], p[2], U.uTime];
  };
  // A finger that scrolls the page is not a tap: cancel turns it into none.
  const onCancel = () => {
    dragging = false;
    moved = 99;
  };
  const onLeave = () => {
    hasPointer = false;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("pointercancel", onCancel, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  /* ── Scroll ──────────────────────────────────────────────────────────── */
  let tTarget = 0,
    tNow = 0,
    out = 0;
  const readScroll = () => {
    const r = dive.track.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    tTarget = Math.min(1, Math.max(0, -r.top / span)) * STEPS;
    // How far the page has scrolled past the dive: the next section rises over it.
    out = Math.min(1, Math.max(0, (window.innerHeight - r.bottom) / window.innerHeight));
    active = out < 0.5;
  };
  const stepTo = (s: number) => {
    const r = dive.track.getBoundingClientRect();
    const top = r.top + window.scrollY,
      span = r.height - window.innerHeight;
    window.scrollTo({
      top: top + (Math.max(0, Math.min(STEPS, s)) / STEPS) * span,
      behavior: reduced ? "auto" : "smooth",
    });
  };
  const onKey = (e: KeyboardEvent) => {
    if (!active || (e.target as Element | null)?.closest?.("input, textarea, select")) return;
    if (["ArrowDown", "PageDown"].includes(e.key) && tTarget < STEPS - 0.02) {
      e.preventDefault();
      stepTo(Math.floor(tTarget + 0.02) + 1);
    }
    if (["ArrowUp", "PageUp"].includes(e.key) && tTarget > 0.02) {
      e.preventDefault();
      stepTo(Math.ceil(tTarget - 0.02) - 1);
    }
  };
  const onGauge = (e: Event) => {
    const b = (e.target as Element).closest("button");
    if (b?.dataset.s) stepTo(Number(b.dataset.s));
  };
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll);
  window.addEventListener("keydown", onKey);
  dive.gaugeButtons.forEach((b) => b.addEventListener("click", onGauge));
  readScroll();

  /* ── Pins ────────────────────────────────────────────────────────────── */
  const mkPin = (label: string, quiet: boolean) => {
    const el = document.createElement("div");
    el.className = "ib-pin" + (quiet ? " ib-pin--quiet" : "");
    if (label) {
      const s = document.createElement("span");
      s.textContent = label;
      el.appendChild(s);
    }
    dive.pins.appendChild(el);
    return el;
  };
  const pinMain = mkPin("", false);
  const pinsAll = opts.layers.map((l) => mkPin(l, true));
  const layerAnchor = (b: number, side?: number): V3 => {
    const y = bandY(b),
      [cx, cz] = subC(y);
    const local = worldToLocal(eye);
    const thc = Math.atan2(local[2] - cz, local[0] - cx);
    const pick = (off: number) => {
      const th = thc + off,
        r = subR(y, th);
      return localToWorld([cx + r * Math.cos(th), y, cz + r * Math.sin(th)]);
    };
    if (side !== undefined) return pick(side);
    const a = pick(0.75),
      c = pick(-0.75);
    return toScreen(a).x < toScreen(c).x ? a : c;
  };
  const placePin = (el: HTMLElement, w: V3, opacity: number) => {
    const s = toScreen(w);
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
    el.style.opacity = s.ok ? opacity.toFixed(3) : "0";
    return s;
  };

  /* ── Draw ────────────────────────────────────────────────────────────── */
  type Prog = { p: WebGLProgram; u: (name: string) => WebGLUniformLocation | null };
  const setCommon = ({ u }: Prog) => {
    gl.uniformMatrix4fv(u("modelMatrix"), false, model);
    gl.uniformMatrix4fv(u("viewMatrix"), false, view);
    gl.uniformMatrix4fv(u("projectionMatrix"), false, proj);
    gl.uniform1f(u("uTime"), U.uTime);
    gl.uniform1f(u("uPR"), U.uPR);
    gl.uniform1f(u("uSize"), U.uSize);
    gl.uniform1f(u("uIntro"), U.uIntro);
    gl.uniform1f(u("uMouseK"), U.uMouseK);
    gl.uniform1f(u("uActive"), U.uActive);
    gl.uniform1f(u("uAll"), U.uAll);
    gl.uniform1f(u("uCamY"), U.uCamY);
    gl.uniform1f(u("uGain"), U.uGain);
    gl.uniform1f(u("uMotion"), U.uMotion);
    gl.uniform1f(u("uFar"), U.uFar);
    gl.uniform3fv(u("uMouse"), U.uMouse);
    gl.uniform4fv(u("uPing"), U.uPing);
  };
  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    const blendPoints = () =>
      pal.add
        ? gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        : gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    blendPoints();
    gl.useProgram(berg.p);
    setCommon(berg);
    gl.uniform3fv(berg.u("uIceTop"), pal.iceTop);
    gl.uniform3fv(berg.u("uIceSub"), pal.iceSub);
    gl.uniform3fv(berg.u("uDeep"), pal.deep);
    gl.uniform3fv(berg.u("uHot"), pal.hot);
    gl.uniform3fv(berg.u("uRack"), pal.rack);
    gl.uniform3fv(berg.u("uLit"), pal.lit);
    gl.bindVertexArray(bergVao);
    gl.drawArrays(gl.POINTS, 0, bergCount);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(ring.p);
    gl.uniformMatrix4fv(ring.u("modelMatrix"), false, model);
    gl.uniformMatrix4fv(ring.u("viewMatrix"), false, view);
    gl.uniformMatrix4fv(ring.u("projectionMatrix"), false, proj);
    gl.uniform3fv(ring.u("uColor"), pal.ring);
    gl.bindVertexArray(ringVao);
    for (let b = 0; b < NB; b++) {
      const o = Math.max(1 - Math.min(1, Math.abs(b - ringAct) * 1.4), U.uAll * 0.35) * 0.85;
      if (o <= 0.002) continue;
      gl.uniform1f(ring.u("uOpacity"), o);
      gl.drawArrays(gl.LINE_STRIP, b * RING_N, RING_N);
    }

    blendPoints();
    gl.useProgram(sea.p);
    setCommon(sea);
    gl.uniform3fv(sea.u("uWater"), pal.water);
    gl.bindVertexArray(seaVao);
    gl.drawArrays(gl.POINTS, 0, seaCount);

    gl.useProgram(snowP.p);
    setCommon(snowP);
    gl.uniform3fv(snowP.u("uSnow"), pal.snow);
    gl.bindVertexArray(snowVao);
    gl.drawArrays(gl.POINTS, 0, SN);
    gl.bindVertexArray(null);
  };

  /* ── Frame ───────────────────────────────────────────────────────────── */
  let introT = reduced ? 1 : 0,
    mouseK = 0,
    first = true,
    raf = 0,
    running = false,
    last = performance.now(),
    ringAct = -10;
  const lerpC = (a: V3, b: V3, k: number) => a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(",");

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const raw = (now - last) / 1000;
    last = now;
    const dt = Math.min(0.05, raw);
    dive.stage.style.visibility = out >= 1 ? "hidden" : "visible";
    // Captions, pins and gauge clear out as the next section rises; the berg stays.
    dive.stage.style.setProperty("--ib-out", out.toFixed(3));
    // Past the end of the dive the stage is off screen: nothing to draw.
    if (out >= 1 && tNow > STEPS - 0.01) return;
    U.uTime += dt;
    // The fade-in runs on wall-clock time, not on the capped frame step: on a
    // slow device the berg still assembles in about 2.6 s.
    if (!reduced && introT < 1) {
      introT = Math.min(1, introT + Math.min(0.5, raw) / 2.6);
      U.uIntro = introT;
    }

    tNow += (tTarget - tNow) * (1 - Math.exp(-dt * (reduced ? 60 : 5.5)));
    pose(tNow);
    // A tall screen pulls the camera back so the berg fits its width.
    U.uFar = aspect < 1.1 ? Math.min(2.1, Math.max(1, 1.0 / aspect)) : 1;
    camP = add(scale(sub(camP, camT), U.uFar), camT);
    const pk = 1 - Math.exp(-dt * 3);
    const pt = hasPointer && !small ? parallaxT : [0, 0];
    parallax = [parallax[0] + (pt[0]! - parallax[0]) * pk, parallax[1] + (pt[1]! - parallax[1]) * pk];
    const fwd = norm(sub(camT, camP));
    const side = norm(cross(fwd, [0, 1, 0]));
    eye = add(add(camP, scale(side, parallax[0] * 0.9)), [0, parallax[1] * 0.55, 0]);
    back = norm(sub(eye, camT));
    right = norm(cross([0, 1, 0], back));
    up = cross(back, right);
    view = lookAt(eye, camT);
    proj = perspective(FOV, aspect, 0.1, 200);
    shiftX = small ? 0 : camS;
    shiftY = small ? 0.32 : 0;
    proj[8] = -shiftX;
    proj[9] = -shiftY;
    vp = multiply(proj, view);
    U.uCamY = eye[1];

    yaw += yawVel;
    yawVel *= Math.pow(0.9, dt * 60);
    rotY = yaw + (reduced ? 0 : U.uTime * 0.035) + parallax[0] * 0.12;
    setModel(rotY);

    const hit = hasPointer ? hitPlane(rayAt(nx, ny)) : null;
    if (hit) mouseW = first ? hit : mix3(mouseW, hit, 1 - Math.exp(-dt * 10));
    const wantK = hasPointer && !reduced && now - lastMove < 2200 ? 1 : 0;
    mouseK += (wantK - mouseK) * (1 - Math.exp(-dt * 4));
    U.uMouse = mouseW;
    U.uMouseK = mouseK;
    first = false;

    // Layer lighting follows the scroll.
    const act = tNow - 3;
    ringAct = act;
    U.uActive = act > -0.6 && act < NB - 0.4 ? act : -10;
    U.uAll = Math.min(1, Math.max(0, (tNow - (STEPS - 0.7)) / 0.7));

    const depthK = Math.min(1, Math.max(0, (0.8 - eye[1]) / 11));
    dive.sky.style.background = `linear-gradient(rgb(${lerpC(pal.bgTop, pal.bgBot, depthK)}), rgb(${lerpC(pal.bgTop, pal.bgBot, Math.min(1, depthK + 0.45))}))`;

    dive.caps.forEach((el, s) => {
      const o = Math.max(0, 1 - Math.abs(tNow - s) * 2.1);
      el.style.opacity = o.toFixed(3);
      el.classList.toggle("is-live", o > 0.01);
      el.style.transform = `translate3d(0, calc(${small ? "0px" : "-50%"} + ${((s - tNow) * 46).toFixed(1)}px), 0)`;
      const ctas = el.querySelector<HTMLElement>(".ib-ctas");
      if (ctas) {
        const usable = o > 0.5 && active;
        ctas.style.pointerEvents = usable ? "auto" : "none";
        // Out of the tab order too while faded out, so keyboard focus never
        // lands on a button nobody can see.
        if (ctas.inert === usable) ctas.inert = !usable;
      }
    });

    const step = Math.round(tNow),
      stepO = Math.max(0, 1 - Math.abs(tNow - step) * 2.1);
    let target: V3 | null = null;
    if (step === 1) target = localToWorld([RACK.x + RACK.w / 2, RACK.y0 + RACK.h * 0.7, RACK.z + RACK.d / 2]);
    else if (step >= 3 && step <= NB + 2) target = layerAnchor(step - 3);
    const ps = target ? placePin(pinMain, target, stepO * U.uIntro) : null;
    if (!ps) pinMain.style.opacity = "0";
    const title = dive.caps[step]?.querySelector<HTMLElement>(".ib-cap__title");
    if (ps && ps.ok && !small && title) {
      const t = title.getBoundingClientRect();
      const x1 = t.right + 28,
        y1 = t.top + t.height / 2;
      const xm = x1 + Math.max(30, (ps.x - x1) * 0.45);
      const d = `M${x1.toFixed(1)},${y1.toFixed(1)} H${xm.toFixed(1)} L${ps.x.toFixed(1)},${ps.y.toFixed(1)}`;
      dive.leaderPath.setAttribute("d", d);
      dive.leaderHalo.setAttribute("d", d);
      dive.leaderDot.setAttribute("cx", x1.toFixed(1));
      dive.leaderDot.setAttribute("cy", y1.toFixed(1));
      dive.leader.style.opacity = (stepO * stepO).toFixed(3);
    } else dive.leader.style.opacity = "0";

    const centerX = toScreen(camT).x;
    pinsAll.forEach((el, b) => {
      if (U.uAll <= 0.01) {
        el.style.opacity = "0";
        return;
      }
      const s = placePin(el, layerAnchor(b, b % 2 ? 1.25 : -1.25), U.uAll);
      // Labels point away from the berg, unless that side runs off a
      // narrow screen and the other side has the room.
      if (labelW[b] === undefined) labelW[b] = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const need = labelW[b]! + 24;
      let toR = s.x > centerX;
      if (toR && s.x + need > vw && s.x - need >= 0) toR = false;
      else if (!toR && s.x - need < 0 && s.x + need <= vw) toR = true;
      el.classList.toggle("to-r", toR);
      el.classList.toggle("to-l", !toR);
    });

    const g = Math.min(1, tNow / STEPS);
    dive.gaugeFill.style.height = `${g * 100}%`;
    dive.gaugeNow.style.top = `${g * 100}%`;
    dive.gaugeRead.style.top = `${g * 100}%`;
    const metres = Math.max(0, Math.round(-eye[1] * 38));
    dive.gaugeRead.textContent = metres > 0 ? `−${metres} m` : opts.surface;
    dive.gaugeButtons.forEach((b) => b.classList.toggle("is-on", Math.abs(Number(b.dataset.s) - tNow) < 0.5));

    draw();
    if (!canvas.classList.contains("is-ready")) canvas.classList.add("is-ready");
  };
  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  let lost = false;
  const onVis = () => (document.hidden || lost ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    stop();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  start();

  return () => {
    stop();
    ro.disconnect();
    offPrefs();
    document.removeEventListener("visibilitychange", onVis);
    canvas.removeEventListener("webglcontextlost", onLost);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    document.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("resize", readScroll);
    window.removeEventListener("keydown", onKey);
    dive.gaugeButtons.forEach((b) => b.removeEventListener("click", onGauge));
    dive.pins.replaceChildren();
    vaos.forEach((v) => gl.deleteVertexArray(v));
    buffers.forEach((b) => gl.deleteBuffer(b));
    programs.forEach((p) => gl.deleteProgram(p));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
