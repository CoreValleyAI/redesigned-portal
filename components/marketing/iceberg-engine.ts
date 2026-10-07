/**
 * "The Iceberg": a point-cloud iceberg in WebGL (Three.js).
 *
 * Two modes, one scene:
 *   · dive     /platform. Page scroll drives the camera: the GPU rack on the
 *              tip, the waterline, nine lit strata, then the whole berg with
 *              every layer pinned. Captions, pins, a leader line and a depth
 *              gauge are DOM elements the page renders; this module moves them.
 *              Past the dive, the stage is clipped at the end of the scroll
 *              track (--ib-out, platform.css), so the footer rises over plain
 *              page ground instead of showing the berg through its glass.
 *   · preview  the homepage teaser. A fixed view of the whole berg in a card,
 *              turning slowly while a scan lights the strata one by one.
 *
 * Both: particles part around the pointer, a click sends a sonar ping through
 * ice and water, drag spins the berg. Colours follow the site theme
 * (lib/theme.ts); ambient motion stops under prefers-reduced-motion.
 *
 * Loaded with a dynamic import, so Three.js only ships to pages that use it.
 * Returns a cleanup function that releases every GPU resource and listener.
 */
import * as THREE from "three";
import { readTheme, subscribeTheme } from "@/lib/theme";
import { DIVE_STEPS, PLATFORM_LAYERS } from "@/lib/platform-layers";

export interface DiveElements {
  /** The tall scroll track whose progress drives the dive. */
  track: HTMLElement;
  /** Fixed wrapper of the canvas, sky and overlays; hidden once the track is off screen. */
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

type Options = { mode: "dive"; els: DiveElements } | { mode: "preview" };
type Vec3 = [number, number, number];

const NB = PLATFORM_LAYERS.length;
const STEPS = DIVE_STEPS;
const TAU = Math.PI * 2;
const BAND_TOP = -0.55;
const BAND_H = 10 / NB;
const BOTTOM = -11.2;
const bandY = (b: number) => BAND_TOP - (b + 0.5) * BAND_H;
const fract = (x: number) => x - Math.floor(x);
const subC = (y: number): [number, number] => [0.55 * Math.sin(y * 0.33), 0.45 * Math.cos(y * 0.26) - 0.45];

/** Radius of the submerged mass at depth y and angle th. */
function subR(y: number, th: number) {
  const u = Math.min(1, Math.max(0, -y / -BOTTOM));
  let r = u < 0.24 ? 3.55 + 1.85 * Math.sin((u / 0.24) * (Math.PI / 2)) : 5.4 * Math.pow(1 - (u - 0.24) / 0.76, 0.72) + 0.12;
  r *= 1 + 0.15 * Math.sin(3 * th + 1.3) + 0.09 * Math.sin(5 * th + y * 0.42) + 0.05 * Math.sin(9 * th - y * 0.9);
  r *= 1 + 0.07 * (Math.abs(fract((th * 7) / TAU + y * 0.13) - 0.5) * 2 - 0.5);
  r *= 1 + 0.05 * (Math.abs(fract((th * 3) / TAU - y * 0.31) - 0.5) * 2 - 0.5);
  return r;
}

interface Spire { x: number; z: number; h: number; r: number; s: number }
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

interface Palette {
  add: boolean; bgTop: Vec3; bgBot: Vec3;
  iceTop: Vec3; iceSub: Vec3; deep: Vec3; hot: Vec3; rack: Vec3; lit: Vec3; water: Vec3; snow: Vec3;
  ring: number; gain: number;
}
const PALETTES: Record<"dark" | "light", Palette> = {
  dark: {
    add: true, bgTop: [5, 8, 13], bgBot: [2, 26, 30],
    iceTop: [0.88, 0.96, 0.95], iceSub: [0.4, 0.92, 0.72], deep: [0.06, 0.52, 0.62],
    hot: [0.78, 1.0, 0.88], rack: [0.3, 0.36, 0.44], lit: [0.29, 0.95, 0.52],
    water: [0.2, 0.85, 0.76], snow: [0.55, 0.95, 0.85], ring: 0x6ee7b7, gain: 1.0,
  },
  light: {
    add: false, bgTop: [243, 245, 247], bgBot: [207, 233, 228],
    iceTop: [0.32, 0.42, 0.47], iceSub: [0.02, 0.56, 0.4], deep: [0.05, 0.33, 0.42],
    hot: [0.01, 0.3, 0.2], rack: [0.1, 0.13, 0.18], lit: [0.06, 0.62, 0.28],
    water: [0.05, 0.44, 0.42], snow: [0.06, 0.4, 0.4], ring: 0x047857, gain: 1.0,
  },
};
const pal = () => PALETTES[readTheme()];

const COMMON = /* glsl */ `
  uniform float uTime, uPR, uSize, uIntro, uMouseK, uActive, uAll, uCamY, uGain, uMotion;
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
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.12, d));
  }
`;

const BERG_VERT = COMMON + /* glsl */ `
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
    vAlpha = clamp(a, 0.0, 1.0) * uGain * smoothstep(80.0, 18.0, -mv.z) * k;
  }`;

const SEA_VERT = COMMON + /* glsl */ `
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

const SNOW_VERT = COMMON + /* glsl */ `
  attribute float aRand; uniform vec3 uSnow;
  void main() {
    vec3 p = position; float t = uTime * uMotion;
    p.y = -14.0 + mod(p.y + t * (0.06 + 0.12 * aRand), 13.6);
    p.x += sin(t * 0.21 + aRand * 12.0) * 0.4;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vColor = uSnow;
    vAlpha = (0.12 + 0.28 * aRand) * smoothstep(0.6, -0.6, uCamY) * smoothstep(40.0, 6.0, -mv.z) * uGain;
    gl_PointSize = min(10.0, uSize * 0.5 * (0.4 + aRand) * uPR / -mv.z);
  }`;

export function startIceberg(canvas: HTMLCanvasElement, opts: Options): () => void {
  const dive = opts.mode === "dive" ? opts.els : null;
  const preview = opts.mode === "preview";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let small = window.matchMedia("(max-width: 900px)").matches;
  // Touch devices get a lighter cloud: phones are also carrying the rest of
  // the page, and the difference doesn't show at their pixel sizes.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const Q = preview ? (coarse ? 0.5 : 0.7) : small || coarse ? 0.52 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const berg = new THREE.Group();
  scene.add(berg);
  const disposables: { dispose(): void }[] = [renderer];

  /* ── Sample the berg. kind: 0 ice above · 1 submerged surface · 2 interior ·
        3 rack frame · 4 lit blade · 5 waterline shelf ─────────────────────── */
  const P: number[] = [], R: number[] = [], K: number[] = [], B: number[] = [];
  const push = (x: number, y: number, z: number, kind: number, band: number) => { P.push(x, y, z); R.push(Math.random()); K.push(kind); B.push(band); };
  const bandOf = (y: number) => { const b = Math.floor((BAND_TOP - y) / BAND_H); return b >= 0 && b < NB ? b : -1; };
  {
    let n = Math.round(78000 * Q), guard = 0;
    while (n > 0 && guard++ < 2e6) {
      const y = BOTTOM + Math.random() * -BOTTOM, th = Math.random() * TAU, r = subR(y, th);
      if (Math.random() > r / 6.2) continue;
      const [cx, cz] = subC(y), rr = r - Math.random() * 0.1;
      push(cx + rr * Math.cos(th), y, cz + rr * Math.sin(th), 1, bandOf(y)); n--;
    }
    n = Math.round(15000 * Q);
    while (n-- > 0) {
      const y = BOTTOM * 0.95 * Math.random(), th = Math.random() * TAU, [cx, cz] = subC(y);
      const rr = subR(y, th) * Math.sqrt(Math.random()) * 0.94;
      push(cx + rr * Math.cos(th), y, cz + rr * Math.sin(th), 2, bandOf(y));
    }
    n = Math.round(6000 * Q);
    while (n-- > 0) {
      const th = Math.random() * TAU, [cx, cz] = subC(0), rr = subR(0, th) * Math.sqrt(Math.random());
      push(cx + rr * Math.cos(th), (Math.random() - 0.5) * 0.08, cz + rr * Math.sin(th), 5, -1);
    }
    const area = SPIRES.map((s) => s.r * Math.hypot(s.h, s.r));
    const total = area.reduce((a, b) => a + b, 0);
    SPIRES.forEach((sp, i) => {
      let m = Math.round((20000 * Q * area[i]!) / total), g = 0;
      while (m > 0 && g++ < 1e6) {
        const y = Math.random() * sp.h, th = Math.random() * TAU, r = spireR(sp, y, th);
        if (Math.random() > r / (sp.r * 1.25)) continue;
        if (sp === APEX && y > RACK.y0 - 0.05) continue;
        const rr = r - Math.random() * 0.06;
        push(sp.x + rr * Math.cos(th), y, sp.z + rr * Math.sin(th), 0, -1); m--;
      }
    });
    const st = small || preview ? 0.045 : 0.03, { x, z, y0, w, d, h } = RACK;
    for (let yy = 0; yy <= h; yy += st) {
      const row = fract((yy / h) * 13), lit = row > 0.2 && row < 0.62 && yy > 0.08 && yy < h - 0.06;
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
    for (let a = -w / 2; a <= w / 2; a += st) for (let c = -d / 2; c <= d / 2; c += st) push(x + a, y0 + h, z + c, 3, -1);
  }

  const U = {
    uTime: { value: 0 }, uPR: { value: 1 }, uSize: { value: 38 }, uIntro: { value: reduced ? 1 : 0 },
    uMouse: { value: new THREE.Vector3(0, -99, 0) }, uMouseK: { value: 0 },
    uPing: { value: new THREE.Vector4(0, -99, 0, -99) },
    uActive: { value: -10 }, uAll: { value: 0 }, uCamY: { value: 10 }, uGain: { value: 1 },
    uIceTop: { value: new THREE.Vector3() }, uIceSub: { value: new THREE.Vector3() }, uDeep: { value: new THREE.Vector3() },
    uHot: { value: new THREE.Vector3() }, uRack: { value: new THREE.Vector3() }, uLit: { value: new THREE.Vector3() },
    uWater: { value: new THREE.Vector3() }, uSnow: { value: new THREE.Vector3() }, uMotion: { value: reduced ? 0 : 1 },
  };
  const mat = (vertexShader: string) => {
    const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, vertexShader, fragmentShader: FRAG });
    disposables.push(m);
    return m;
  };
  const points = (geo: THREE.BufferGeometry, m: THREE.ShaderMaterial) => {
    disposables.push(geo);
    const p = new THREE.Points(geo, m);
    p.frustumCulled = false;
    return p;
  };

  const bergGeo = new THREE.BufferGeometry();
  bergGeo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  bergGeo.setAttribute("aRand", new THREE.Float32BufferAttribute(R, 1));
  bergGeo.setAttribute("aKind", new THREE.Float32BufferAttribute(K, 1));
  bergGeo.setAttribute("aBand", new THREE.Float32BufferAttribute(B, 1));
  const bergMat = mat(BERG_VERT);
  berg.add(points(bergGeo, bergMat));

  /* Strata rings: one contour per layer. */
  const rings: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
  for (let b = 0; b < NB; b++) {
    const y = bandY(b), [cx, cz] = subC(y), pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i++) {
      const th = (i / 220) * TAU, r = subR(y, th) + 0.32;
      pts.push(new THREE.Vector3(cx + r * Math.cos(th), y, cz + r * Math.sin(th)));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    disposables.push(g, m);
    const line = new THREE.Line(g, m);
    berg.add(line); rings.push(line);
  }

  /* The sea surface and the marine snow below it. */
  const W: number[] = [];
  {
    const N = small || preview ? 150 : 230, S = 72, [cx, cz] = subC(0);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const x = (i / (N - 1) - 0.5) * S, z = (j / (N - 1) - 0.5) * S;
      const th = Math.atan2(z - cz, x - cx);
      if (Math.hypot(x - cx, z - cz) < subR(0, th) + 0.25) continue;
      W.push(x + (Math.random() - 0.5) * 0.08, 0, z + (Math.random() - 0.5) * 0.08);
    }
  }
  const seaGeo = new THREE.BufferGeometry();
  seaGeo.setAttribute("position", new THREE.Float32BufferAttribute(W, 3));
  const seaMat = mat(SEA_VERT);
  scene.add(points(seaGeo, seaMat));

  const SN = small || preview ? 1400 : 3200, snow = new Float32Array(SN * 3), snowR = new Float32Array(SN);
  for (let i = 0; i < SN; i++) {
    snow[i * 3] = (Math.random() - 0.5) * 50; snow[i * 3 + 1] = Math.random() * 14; snow[i * 3 + 2] = (Math.random() - 0.5) * 50;
    snowR[i] = Math.random();
  }
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute("position", new THREE.BufferAttribute(snow, 3));
  snowGeo.setAttribute("aRand", new THREE.BufferAttribute(snowR, 1));
  const snowMat = mat(SNOW_VERT);
  scene.add(points(snowGeo, snowMat));

  const applyTheme = () => {
    const p = pal();
    U.uIceTop.value.set(...p.iceTop); U.uIceSub.value.set(...p.iceSub); U.uDeep.value.set(...p.deep);
    U.uHot.value.set(...p.hot); U.uRack.value.set(...p.rack); U.uLit.value.set(...p.lit);
    U.uWater.value.set(...p.water); U.uSnow.value.set(...p.snow); U.uGain.value = p.gain;
    for (const m of [bergMat, seaMat, snowMat]) { m.blending = p.add ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true; }
    rings.forEach((r) => r.material.color.setHex(p.ring));
  };
  applyTheme();
  const offTheme = subscribeTheme(applyTheme);

  /* ── Camera path ─────────────────────────────────────────────────────── */
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const RACK_C = V(RACK.x, RACK.y0 + RACK.h * 0.55, RACK.z);
  interface Key { p: THREE.Vector3; t: THREE.Vector3; s: number }
  const key = (i: number): Key => {
    if (i <= 0) return { p: V(10.5, 5.2, 22), t: V(-0.5, 0.6, 0), s: 0.33 };
    if (i === 1) return { p: V(5.4, 5.9, 9.6), t: RACK_C.clone().add(V(0, -0.4, 0)), s: 0.3 };
    if (i === 2) return { p: V(8.5, 0.9, 16.5), t: V(0, -1.6, 0), s: 0.3 };
    if (i <= NB + 2) {
      const b = i - 3, y = bandY(b), ph = 0.55 + b * 0.3, dist = 25 - b * 0.4;
      return { p: V(Math.sin(ph) * dist, y + 2.6, Math.cos(ph) * dist), t: V(0, y - 0.3, 0), s: 0.36 };
    }
    return { p: V(-4, -3.2, 41), t: V(0, -3.9, 0), s: 0.38 };
  };
  const KEYS = Array.from({ length: STEPS + 1 }, (_, i) => key(i));
  const PREVIEW_KEY: Key = { p: V(-8, 3.2, 25), t: V(0, -3.7, 0), s: 0 };
  const ease = (x: number) => x * x * x * (x * (6 * x - 15) + 10);
  const camP = V(0, 0, 0), camT = V(0, 0, 0);
  let camS = 0;
  const pose = (t: number) => {
    if (preview) { camP.copy(PREVIEW_KEY.p); camT.copy(PREVIEW_KEY.t); camS = 0; return; }
    const i = Math.min(STEPS - 1, Math.max(0, Math.floor(t))), f = ease(Math.min(1, Math.max(0, t - i)));
    const a = KEYS[i]!, b = KEYS[i + 1]!;
    camP.lerpVectors(a.p, b.p, f); camT.lerpVectors(a.t, b.t, f); camS = a.s + (b.s - a.s) * f;
  };

  /* ── Size ────────────────────────────────────────────────────────────── */
  let vw = 1, vh = 1;
  /** Pin label widths, measured on first use and again after a resize. */
  const labelW: number[] = [];
  const resize = () => {
    labelW.length = 0;
    small = window.matchMedia("(max-width: 900px)").matches;
    const rect = canvas.getBoundingClientRect();
    vw = Math.max(1, rect.width); vh = Math.max(1, rect.height);
    const pr = Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    U.uPR.value = pr;
    U.uSize.value = preview ? 36 : small ? 34 : 38;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ── Input ───────────────────────────────────────────────────────────── */
  const ndc = new THREE.Vector2(9, 9);
  let hasPointer = false, lastMove = -1e9, yaw = 0, yawVel = 0, dragging = false, downX = 0, downY = 0, moved = 0;
  const parallax = new THREE.Vector2(), parallaxT = new THREE.Vector2();
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(), hit = V(0, 0, 0), mouseW = V(0, -99, 0);
  const skip = (e: Event) => !!(e.target as Element | null)?.closest?.("a, button, header, footer, input, textarea");
  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    return inside;
  };
  let active = true; // dive: the track is on screen; preview: the card is visible
  const onMove = (e: PointerEvent) => {
    const inside = toNdc(e);
    hasPointer = inside && active;
    if (hasPointer) { parallaxT.set(ndc.x, ndc.y); lastMove = performance.now(); }
    if (dragging) { moved = Math.max(moved, Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY)); yawVel += (e.movementX || 0) * 0.0035; }
  };
  const onDown = (e: PointerEvent) => {
    if (skip(e) || !toNdc(e) || !active) return;
    dragging = e.pointerType === "mouse"; downX = e.clientX; downY = e.clientY; moved = 0;
  };
  const onUp = (e: PointerEvent) => {
    const wasDown = dragging || e.pointerType !== "mouse";
    dragging = false;
    if (!wasDown || skip(e) || !toNdc(e) || !active || moved >= 6) return;
    ray.setFromCamera(ndc, camera);
    const p = ray.ray.intersectPlane(plane, hit) ? hit.clone() : camT.clone();
    U.uPing.value.set(p.x, p.y, p.z, U.uTime.value);
  };
  const onLeave = () => { hasPointer = false; };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  document.addEventListener("pointerleave", onLeave);

  /* ── Scroll (dive) ───────────────────────────────────────────────────── */
  let tTarget = 0, tNow = 0, out = 0;
  const readScroll = () => {
    if (!dive) return;
    const r = dive.track.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    tTarget = Math.min(1, Math.max(0, -r.top / span)) * STEPS;
    // How far the page has scrolled past the dive: the footer rises over it.
    out = Math.min(1, Math.max(0, (window.innerHeight - r.bottom) / window.innerHeight));
    active = out < 0.5;
  };
  const stepTo = (s: number) => {
    if (!dive) return;
    const r = dive.track.getBoundingClientRect();
    const top = r.top + window.scrollY, span = r.height - window.innerHeight;
    window.scrollTo({ top: top + (Math.max(0, Math.min(STEPS, s)) / STEPS) * span, behavior: reduced ? "auto" : "smooth" });
  };
  const onKey = (e: KeyboardEvent) => {
    if (!dive || !active || (e.target as Element | null)?.closest?.("input, textarea")) return;
    if (["ArrowDown", "PageDown"].includes(e.key) && tTarget < STEPS - 0.02) { e.preventDefault(); stepTo(Math.floor(tTarget + 0.02) + 1); }
    if (["ArrowUp", "PageUp"].includes(e.key) && tTarget > 0.02) { e.preventDefault(); stepTo(Math.ceil(tTarget - 0.02) - 1); }
  };
  const onGauge = (e: Event) => { const b = (e.target as Element).closest("button"); if (b?.dataset.s) stepTo(Number(b.dataset.s)); };
  if (dive) {
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    window.addEventListener("keydown", onKey);
    dive.gaugeButtons.forEach((b) => b.addEventListener("click", onGauge));
    readScroll();
  }

  /* ── Pins (dive) ─────────────────────────────────────────────────────── */
  const mkPin = (label: string, quiet: boolean) => {
    const el = document.createElement("div");
    el.className = "ib-pin" + (quiet ? " ib-pin--quiet" : "");
    if (label) { const s = document.createElement("span"); s.textContent = label; el.appendChild(s); }
    dive?.pins.appendChild(el);
    return el;
  };
  const pinMain = dive ? mkPin("", false) : null;
  const pinsAll = dive ? PLATFORM_LAYERS.map((l) => mkPin(l.title, true)) : [];
  const tmp = V(0, 0, 0), local = V(0, 0, 0);
  const toScreen = (v: THREE.Vector3) => {
    tmp.copy(v).project(camera);
    return { x: (tmp.x * 0.5 + 0.5) * vw, y: (-tmp.y * 0.5 + 0.5) * vh, ok: tmp.z < 1 };
  };
  const layerAnchor = (b: number, side?: number) => {
    const y = bandY(b), [cx, cz] = subC(y);
    local.copy(camera.position); berg.worldToLocal(local);
    const thc = Math.atan2(local.z - cz, local.x - cx);
    const pick = (off: number) => { const th = thc + off, r = subR(y, th); return berg.localToWorld(V(cx + r * Math.cos(th), y, cz + r * Math.sin(th))); };
    if (side !== undefined) return pick(side);
    const a = pick(0.75), c = pick(-0.75);
    return toScreen(a).x < toScreen(c).x ? a : c;
  };
  const placePin = (el: HTMLElement, w: THREE.Vector3, opacity: number) => {
    const s = toScreen(w);
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
    el.style.opacity = s.ok ? opacity.toFixed(3) : "0";
    return s;
  };

  /* ── Frame ───────────────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  let introT = 0, mouseK = 0, first = true, raf = 0, running = false;
  const lerpC = (a: Vec3, b: Vec3, k: number) => a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(",");
  const zero = new THREE.Vector2();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const raw = clock.getDelta();
    const dt = Math.min(0.05, raw);
    // Past the end of the dive the stage is off screen: nothing to draw.
    if (dive) {
      dive.stage.style.visibility = out >= 1 ? "hidden" : "visible";
      // Captions, pins and gauge clear out as the footer rises; the berg stays.
      dive.stage.style.setProperty("--ib-out", out.toFixed(3));
    }
    if (dive && out >= 1 && tNow > STEPS - 0.01) return;
    const now = performance.now();
    U.uTime.value += dt;
    // The fade-in runs on wall-clock time, not on the capped frame step: on a
    // slow device the berg still assembles in about 2.6 s instead of sitting
    // as a ghost for half a minute.
    if (!reduced && introT < 1) { introT = Math.min(1, introT + Math.min(0.5, raw) / 2.6); U.uIntro.value = introT; }

    tNow += (tTarget - tNow) * (1 - Math.exp(-dt * (reduced ? 60 : 5.5)));
    pose(tNow);
    if (camera.aspect < 1.1) camP.sub(camT).multiplyScalar(Math.min(2.1, Math.max(1, 1.0 / camera.aspect))).add(camT);
    parallax.lerp(hasPointer && !small ? parallaxT : zero, 1 - Math.exp(-dt * 3));
    const fwd = V(0, 0, 0).subVectors(camT, camP).normalize();
    const right = V(0, 0, 0).crossVectors(fwd, V(0, 1, 0)).normalize();
    camera.position.copy(camP).addScaledVector(right, parallax.x * 0.9).add(V(0, parallax.y * 0.55, 0));
    camera.lookAt(camT);
    camera.updateProjectionMatrix();
    const shiftX = small || preview ? 0 : camS, shiftY = small && !preview ? 0.32 : 0;
    camera.projectionMatrix.elements[8] = -shiftX;
    camera.projectionMatrix.elements[9] = -shiftY;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    camera.updateMatrixWorld();
    U.uCamY.value = camera.position.y;

    yaw += yawVel; yawVel *= Math.pow(0.9, dt * 60);
    berg.rotation.y = yaw + (reduced ? 0 : U.uTime.value * (preview ? 0.08 : 0.035)) + parallax.x * 0.12;

    plane.setFromNormalAndCoplanarPoint(fwd.clone().negate(), camT);
    ray.setFromCamera(ndc, camera);
    if (hasPointer && ray.ray.intersectPlane(plane, hit)) mouseW.lerp(hit, first ? 1 : 1 - Math.exp(-dt * 10));
    const wantK = hasPointer && !reduced && now - lastMove < 2200 ? 1 : 0;
    mouseK += (wantK - mouseK) * (1 - Math.exp(-dt * 4));
    U.uMouse.value.copy(mouseW); U.uMouseK.value = mouseK;
    first = false;

    // Layer lighting: the dive follows the scroll; the preview scans the strata.
    const act = preview ? (reduced ? -10 : (U.uTime.value * 0.7) % (NB + 2)) - 1 : tNow - 3;
    U.uActive.value = act > -0.6 && act < NB - 0.4 ? act : -10;
    U.uAll.value = preview ? 0.35 : Math.min(1, Math.max(0, (tNow - (STEPS - 0.7)) / 0.7));
    rings.forEach((r, b) => { r.material.opacity = Math.max(1 - Math.min(1, Math.abs(b - act) * 1.4), U.uAll.value * 0.35) * 0.85; });

    if (dive) {
      const depthK = Math.min(1, Math.max(0, (0.8 - camera.position.y) / 11));
      const p = pal();
      dive.sky.style.background = `linear-gradient(rgb(${lerpC(p.bgTop, p.bgBot, depthK)}), rgb(${lerpC(p.bgTop, p.bgBot, Math.min(1, depthK + 0.45))}))`;

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

      const step = Math.round(tNow), stepO = Math.max(0, 1 - Math.abs(tNow - step) * 2.1);
      let target: THREE.Vector3 | null = null;
      if (step === 1) target = berg.localToWorld(V(RACK.x + RACK.w / 2, RACK.y0 + RACK.h * 0.7, RACK.z + RACK.d / 2));
      else if (step >= 3 && step <= NB + 2) target = layerAnchor(step - 3);
      const ps = target && pinMain ? placePin(pinMain, target, stepO * U.uIntro.value) : null;
      if (!ps && pinMain) pinMain.style.opacity = "0";
      const capEl = dive.caps[step];
      const title = capEl?.querySelector<HTMLElement>(".ib-cap__title");
      if (ps && ps.ok && !small && title) {
        const t = title.getBoundingClientRect();
        const x1 = t.right + 28, y1 = t.top + t.height / 2;
        const xm = x1 + Math.max(30, (ps.x - x1) * 0.45);
        const d = `M${x1.toFixed(1)},${y1.toFixed(1)} H${xm.toFixed(1)} L${ps.x.toFixed(1)},${ps.y.toFixed(1)}`;
        dive.leaderPath.setAttribute("d", d); dive.leaderHalo.setAttribute("d", d);
        dive.leaderDot.setAttribute("cx", x1.toFixed(1)); dive.leaderDot.setAttribute("cy", y1.toFixed(1));
        dive.leader.style.opacity = (stepO * stepO).toFixed(3);
      } else dive.leader.style.opacity = "0";

      const centerX = toScreen(camT).x;
      pinsAll.forEach((el, b) => {
        if (U.uAll.value <= 0.01) { el.style.opacity = "0"; return; }
        const s = placePin(el, layerAnchor(b, b % 2 ? 1.25 : -1.25), U.uAll.value);
        // Labels point away from the berg, unless that side runs off a
        // narrow screen and the other side has the room.
        if (labelW[b] === undefined) labelW[b] = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        const need = labelW[b]! + 24;
        let toR = s.x > centerX;
        if (toR && s.x + need > vw && s.x - need >= 0) toR = false;
        else if (!toR && s.x - need < 0 && s.x + need <= vw) toR = true;
        el.classList.toggle("to-r", toR); el.classList.toggle("to-l", !toR);
      });

      const g = Math.min(1, tNow / STEPS);
      dive.gaugeFill.style.height = `${g * 100}%`;
      dive.gaugeNow.style.top = `${g * 100}%`;
      dive.gaugeRead.style.top = `${g * 100}%`;
      const metres = Math.max(0, Math.round(-camera.position.y * 38));
      dive.gaugeRead.textContent = metres > 0 ? `−${metres} m` : "surface";
      dive.gaugeButtons.forEach((b) => b.classList.toggle("is-on", Math.abs(Number(b.dataset.s) - tNow) < 0.5));
    }

    renderer.render(scene, camera);
    if (!canvas.classList.contains("is-ready")) canvas.classList.add("is-ready");
  };
  const start = () => { if (running) return; running = true; clock.getDelta(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // Only render while visible (preview: the card on screen; both: tab visible).
  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (preview) active = visible;
    if (visible && !document.hidden) start(); else stop();
  }, { rootMargin: "100px" });
  io.observe(canvas);
  const onVis = () => (document.hidden || !visible ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  start();

  return () => {
    stop();
    io.disconnect(); ro.disconnect(); offTheme();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointerleave", onLeave);
    if (dive) {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      window.removeEventListener("keydown", onKey);
      dive.gaugeButtons.forEach((b) => b.removeEventListener("click", onGauge));
      dive.pins.replaceChildren();
    }
    disposables.forEach((d) => d.dispose());
  };
}
