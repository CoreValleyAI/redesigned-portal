/**
 * The Kathmandu Valley, built as points.
 *
 * Everything is placed in basin-local coordinates (+x east, +z north, the
 * camera arriving from the south) and stood on the real ground via
 * basinHeight(), the CPU mirror of the terrain shader. The layout is a
 * stylised map, not a survey: the old city around Durbar Square, the
 * Dharahara at its heart, Patan across the Bagmati, Bhaktapur to the east,
 * Pashupatinath on the Bagmati's west bank, Boudhanath beyond it and
 * Swayambhunath on its hill to the west, the Ring Road around them all, the
 * Bagmati and Bishnumati meeting in the south, and the rim of hills and
 * Himalaya closing the view to the north.
 *
 * Each point carries a kind (what it is, for the shader's colour and motion),
 * a parameter t (brightness, colour index or distance along a path) and a
 * random seed. See KIND below.
 */
import * as THREE from "three";
import { BASIN_X, BASIN_Z, basinHeight, SWAYAMBHU } from "../terrain/field";

export const KIND = {
  building: 0,
  window: 1,
  temple: 2,
  stupa: 3,
  flag: 4,
  river: 5,
  dharahara: 6,
  beam: 7,
  ridge: 8, // 8, 9, 10: the three ridge layers, near to far
  street: 11,
} as const;

class Cloud {
  P: number[] = [];
  K: number[] = [];
  T: number[] = [];
  R: number[] = [];
  /** Add a point at basin-local (x, z), `y` above the ground there. */
  onGround(x: number, y: number, z: number, kind: number, t = 0) {
    this.at(x, basinHeight(x, z) + y, z, kind, t);
  }
  /** Add a point at basin-local (x, z) and absolute height y. */
  at(x: number, y: number, z: number, kind: number, t = 0) {
    this.P.push(BASIN_X + x, y, BASIN_Z + z);
    this.K.push(kind);
    this.T.push(t);
    this.R.push(Math.random());
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.P, 3));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(this.K, 1));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(this.T, 1));
    g.setAttribute("aRand", new THREE.Float32BufferAttribute(this.R, 1));
    g.computeBoundingSphere();
    return g;
  }
}

/* ── Paths ─────────────────────────────────────────────────────────────── */

const v = (x: number, z: number) => new THREE.Vector3(x, 0, z);
/** The Bagmati: from Sundarijal in the north-east, past Pashupati, out through Chobhar. */
const BAGMATI = new THREE.CatmullRomCurve3([v(36, 58), v(30, 40), v(24, 24), v(20, 14), v(15, 4), v(9, -8), v(4, -18), v(0, -26), v(-1, -40), v(0, -64)]);
/** The Bishnumati: down the west of the old city to meet the Bagmati at Teku. */
const BISHNUMATI = new THREE.CatmullRomCurve3([v(-15, 56), v(-15, 38), v(-13, 20), v(-11, 6), v(-8, -8), v(-4, -19), v(0, -26)]);
const RIVER_SAMPLES = [BAGMATI, BISHNUMATI].map((c) => c.getSpacedPoints(400));

function distToRivers(x: number, z: number) {
  let d = Infinity;
  for (const pts of RIVER_SAMPLES) for (const p of pts) d = Math.min(d, Math.hypot(p.x - x, p.z - z));
  return d;
}

/* ── Landmarks ─────────────────────────────────────────────────────────── */

export const DHARAHARA = { x: -2, z: -4, h: 18 };

interface Pagoda { x: number; z: number; tiers: number; w: number; steps: number; s: number }
const PAGODAS: Pagoda[] = [
  { x: -9, z: 7, tiers: 3, w: 2.4, steps: 5, s: 1.2 }, // Taleju, Kathmandu Durbar Square
  { x: -12, z: 3, tiers: 3, w: 2.2, steps: 2, s: 1.0 }, // Kasthamandap
  { x: -6.5, z: 9.5, tiers: 2, w: 1.6, steps: 2, s: 0.85 },
  { x: 8, z: -11, tiers: 2, w: 1.6, steps: 2, s: 0.9 }, // Patan Durbar Square
  { x: 10, z: -13.5, tiers: 3, w: 1.8, steps: 3, s: 0.95 },
  { x: 12, z: -16, tiers: 2, w: 1.5, steps: 2, s: 0.85 },
  { x: 17, z: 19, tiers: 2, w: 3.0, steps: 1, s: 1.15 }, // Pashupatinath
  { x: 40, z: 5, tiers: 5, w: 2.2, steps: 5, s: 1.0 }, // Nyatapola, Bhaktapur
];
interface Stupa { x: number; z: number; r: number; flags: number }
const STUPAS: Stupa[] = [
  { x: 30, z: 25, r: 3.2, flags: 16 }, // Boudhanath
  { x: SWAYAMBHU.x, z: SWAYAMBHU.z, r: 1.6, flags: 10 }, // Swayambhunath, on its hill
];

/** Where no ordinary building may stand. */
const CLEAR: { x: number; z: number; r: number }[] = [
  { x: DHARAHARA.x, z: DHARAHARA.z, r: 4 },
  ...PAGODAS.map((p) => ({ x: p.x, z: p.z, r: p.w * p.s * 1.1 + p.steps * 0.35 + 1.2 })),
  ...STUPAS.map((s) => ({ x: s.x, z: s.z, r: s.r * 2.6 })),
  { x: SWAYAMBHU.x, z: SWAYAMBHU.z, r: 8 },
];
const isClear = (x: number, z: number) => CLEAR.every((c) => Math.hypot(x - c.x, z - c.z) > c.r);

/* ── Builders ──────────────────────────────────────────────────────────── */

function squareOutline(c: Cloud, x: number, z: number, half: number, y: number, kind: number, t: number, step: number) {
  const n = Math.max(2, Math.round((half * 2) / step));
  for (let i = 0; i < n; i++) {
    const u = -half + (i / n) * half * 2;
    c.onGround(x + u, y, z - half, kind, t);
    c.onGround(x + half, y, z + u, kind, t);
    c.onGround(x - u, y, z + half, kind, t);
    c.onGround(x - half, y, z - u, kind, t);
  }
}

function building(c: Cloud, x: number, z: number, w: number, d: number, h: number, rot: number, detail: number) {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const put = (u: number, y: number, w2: number, kind: number, t: number) =>
    c.onGround(x + u * cs - w2 * sn, y, z + u * sn + w2 * cs, kind, t);
  const step = 0.42 / detail;
  // Four vertical edges.
  for (const [u, w2] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]] as const) {
    for (let y = 0; y <= h; y += step) put(u, y, w2, KIND.building, y / h);
  }
  // Roof outline.
  for (let u = -w / 2; u <= w / 2; u += step) { put(u, h, -d / 2, KIND.building, 1); put(u, h, d / 2, KIND.building, 1); }
  for (let w2 = -d / 2; w2 <= d / 2; w2 += step) { put(-w / 2, h, w2, KIND.building, 1); put(w / 2, h, w2, KIND.building, 1); }
  // Windows: a sparse grid on the four faces, some lit.
  for (let y = 0.45; y < h - 0.15; y += 0.55) {
    for (let u = -w / 2 + 0.25; u < w / 2 - 0.1; u += 0.42) {
      if (Math.random() < 0.3 * detail) put(u, y, -d / 2, KIND.window, 0);
      if (Math.random() < 0.3 * detail) put(u, y, d / 2, KIND.window, 0);
    }
    for (let w2 = -d / 2 + 0.25; w2 < d / 2 - 0.1; w2 += 0.42) {
      if (Math.random() < 0.3 * detail) put(-w / 2, y, w2, KIND.window, 0);
      if (Math.random() < 0.3 * detail) put(w / 2, y, w2, KIND.window, 0);
    }
  }
}

/** A multi-tiered Newar pagoda on a stepped plinth, with a gilded finial. */
function pagoda(c: Cloud, p: Pagoda) {
  const { x, z, tiers, w, steps, s } = p;
  let y = 0;
  for (let i = 0; i < steps; i++) {
    const half = (w / 2) * s + (steps - i) * 0.38 * s;
    squareOutline(c, x, z, half, y + 0.28 * s, KIND.temple, 0.25, 0.22);
    y += 0.3 * s;
  }
  let body = (w / 2) * s;
  for (let i = 0; i < tiers; i++) {
    const bh = 0.95 * s * (1 - i * 0.1);
    for (const [cx, cz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      for (let yy = 0; yy <= bh; yy += 0.2) c.onGround(x + cx * body, y + yy, z + cz * body, KIND.temple, 0.4);
    }
    y += bh;
    const eave = body + 0.6 * s;
    const top = i === tiers - 1 ? 0.06 : body * 0.8;
    const rh = 0.62 * s;
    // Eaves, hips and roof surface.
    squareOutline(c, x, z, eave, y, KIND.temple, 1, 0.16);
    for (let k = 1; k <= 5; k++) {
      const f = k / 6;
      squareOutline(c, x, z, eave + (top - eave) * f, y + rh * f, KIND.temple, 0.6, 0.28);
    }
    for (const [cx, cz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      for (let k = 0; k <= 10; k++) {
        const f = k / 10, hw = eave + (top - eave) * f;
        c.onGround(x + cx * hw, y + rh * f, z + cz * hw, KIND.temple, 1);
      }
    }
    y += rh;
    body = top;
  }
  for (let yy = 0; yy < 0.9 * s; yy += 0.1) c.onGround(x, y + yy, z, KIND.temple, 1);
}

/** A stupa: stepped base, white dome, harmika, thirteen rings, and prayer flags. */
function stupa(c: Cloud, st: Stupa, detail: number) {
  const { x, z, r, flags } = st;
  let y = 0;
  for (let i = 0; i < 3; i++) {
    squareOutline(c, x, z, r * (1.65 - i * 0.18), y + 0.3, KIND.stupa, 0.4, 0.22);
    y += r * 0.14;
  }
  // Dome: a Fibonacci hemisphere.
  const n = Math.round(150 * r * r * detail);
  for (let i = 0; i < n; i++) {
    const yy = i / n;
    const rad = Math.sqrt(1 - yy * yy), th = i * 2.39996;
    c.onGround(x + Math.cos(th) * rad * r, y + yy * r * 0.92, z + Math.sin(th) * rad * r, KIND.stupa, 0.7);
  }
  y += r * 0.92;
  // Harmika, with the eyes on each face.
  const hh = r * 0.28;
  for (let yy = 0; yy <= r * 0.34; yy += 0.12) squareOutline(c, x, z, hh, y + yy, KIND.stupa, 1, 0.14);
  for (const [fx, fz] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
    for (const e of [-0.4, 0.4]) {
      const ox = fz !== 0 ? e * hh : fx * (hh + 0.02), oz = fx !== 0 ? e * hh : fz * (hh + 0.02);
      c.onGround(x + ox, y + r * 0.2, z + oz, KIND.temple, 1);
    }
  }
  y += r * 0.34;
  // Thirteen rings of the spire.
  for (let k = 0; k < 13; k++) {
    const rr = r * 0.3 * (1 - k / 14), m = Math.max(6, Math.round(rr * 22));
    for (let j = 0; j < m; j++) {
      const a = (j / m) * Math.PI * 2;
      c.onGround(x + Math.cos(a) * rr, y + k * r * 0.1, z + Math.sin(a) * rr, KIND.temple, 0.9);
    }
  }
  const tip = y + 13 * r * 0.1;
  for (let yy = 0; yy < r * 0.3; yy += 0.08) c.onGround(x, tip + yy, z, KIND.temple, 1);
  // Prayer flags: strings from the spire down to a ring on the ground, sagging.
  const top = basinHeight(x, z) + tip;
  for (let f = 0; f < flags; f++) {
    const a = (f / flags) * Math.PI * 2 + 0.2;
    const ex = x + Math.cos(a) * r * 2.3, ez = z + Math.sin(a) * r * 2.3;
    const ey = basinHeight(ex, ez) + 0.2;
    const len = Math.hypot(ex - x, ez - z, ey - top), m = Math.round(len / 0.16);
    for (let j = 0; j <= m; j++) {
      const s = j / m;
      const yy = top + (ey - top) * s - Math.sin(Math.PI * s) * len * 0.08;
      c.at(x + (ex - x) * s, yy, z + (ez - z) * s, KIND.flag, (Math.floor(j / 2) % 5) / 4);
    }
  }
}

/** The Dharahara: a slender white tower with a balcony, a dome and a spire of light. */
function dharahara(c: Cloud) {
  const { x, z, h } = DHARAHARA;
  for (let i = 0; i < 3; i++) squareOutline(c, x, z, 1.7 - i * 0.25, i * 0.22 + 0.2, KIND.dharahara, 0.02, 0.18);
  const y0 = 0.66;
  let k = 0;
  for (let y = y0; y < h * 0.84; y += 0.2, k++) {
    const f = (y - y0) / (h * 0.84 - y0);
    const r = 0.95 + (0.6 - 0.95) * f;
    const m = 16;
    for (let j = 0; j < m; j++) {
      const a = ((j + (k % 2) * 0.5) / m) * Math.PI * 2;
      c.onGround(x + Math.cos(a) * r, y, z + Math.sin(a) * r, KIND.dharahara, y / h);
    }
  }
  // Balcony: two rails and posts.
  const by = h * 0.8;
  for (const [ry, rr] of [[by, 1.15], [by + 0.45, 1.15]] as const) {
    for (let j = 0; j < 30; j++) {
      const a = (j / 30) * Math.PI * 2;
      c.onGround(x + Math.cos(a) * rr, ry, z + Math.sin(a) * rr, KIND.dharahara, ry / h);
    }
  }
  // Upper drum, dome and spire.
  for (let y = h * 0.84; y < h * 0.94; y += 0.18) {
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2;
      c.onGround(x + Math.cos(a) * 0.5, y, z + Math.sin(a) * 0.5, KIND.dharahara, y / h);
    }
  }
  for (let i = 0; i < 70; i++) {
    const yy = i / 70, rad = Math.sqrt(1 - yy * yy) * 0.58, th = i * 2.39996;
    c.onGround(x + Math.cos(th) * rad, h * 0.94 + yy * 0.58, z + Math.sin(th) * rad, KIND.dharahara, 0.98);
  }
  const tip = h * 0.94 + 0.58;
  for (let y = 0; y < 1.8; y += 0.1) c.onGround(x, tip + y, z, KIND.dharahara, 1);
  // The spine of light above it.
  for (let j = 0; j < 280; j++) c.onGround(x, tip + 1.8 + j * 0.26, z, KIND.beam, j / 280);
  // A halo on the square around it (t < 0 marks the ring).
  for (let j = 0; j < 90; j++) {
    const a = (j / 90) * Math.PI * 2;
    c.onGround(x + Math.cos(a) * 3.2, 0.06, z + Math.sin(a) * 3.2, KIND.dharahara, -1);
  }
}

/** A cluster of city blocks on a street grid inside an ellipse. */
function district(
  c: Cloud,
  o: { cx: number; cz: number; ax: number; az: number; maxH: number; cell: number; rot: number; density: number },
  detail: number,
) {
  const { cx, cz, ax, az, maxH, cell, rot, density } = o;
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const span = Math.max(ax, az) + cell;
  const inside = (x: number, z: number) => ((x - cx) / ax) ** 2 + ((z - cz) / az) ** 2;
  for (let i = -span; i <= span; i += cell) {
    for (let j = -span; j <= span; j += cell) {
      const x = cx + i * cs - j * sn, z = cz + i * sn + j * cs;
      const nr = inside(x, z);
      if (nr > 1 || Math.random() > density * (1 - nr * 0.45)) continue;
      if (!isClear(x, z) || distToRivers(x, z) < 1.9) continue;
      // One to four buildings per block.
      const parts = Math.random() < 0.35 ? 1 : Math.random() < 0.6 ? 2 : 4;
      const inner = cell - 0.75;
      const cols = parts === 4 ? 2 : parts, rows = parts === 4 ? 2 : 1;
      for (let a = 0; a < cols; a++) {
        for (let b = 0; b < rows; b++) {
          const w = inner / cols - 0.25, d = inner / rows - 0.25;
          const ox = -inner / 2 + (a + 0.5) * (inner / cols), oz = -inner / 2 + (b + 0.5) * (inner / rows);
          const bx = x + ox * cs - oz * sn, bz = z + ox * sn + oz * cs;
          const h = (0.7 + (maxH - 0.7) * Math.pow(1 - Math.sqrt(nr), 1.3)) * (0.6 + Math.random() * 0.7);
          building(c, bx, bz, w * (0.8 + Math.random() * 0.2), d * (0.8 + Math.random() * 0.2), h, rot, detail);
        }
      }
    }
  }
  // Streets between the blocks, carrying light.
  for (let i = -span - cell / 2; i <= span; i += cell) {
    for (let s = -span; s <= span; s += 0.45) {
      for (const [x, z, t] of [
        [cx + i * cs - s * sn, cz + i * sn + s * cs, s + span],
        [cx + s * cs - i * sn, cz + s * sn + i * cs, s + span + 1000],
      ] as const) {
        if (inside(x, z) < 1.02 && isClear(x, z) && distToRivers(x, z) > 1.2) c.onGround(x, 0.05, z, KIND.street, t);
      }
    }
  }
}

function ringRoad(c: Cloud) {
  const n = 900;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = -2 + Math.cos(a) * 25, z = 3 + Math.sin(a) * 21;
    if (Math.hypot(x - SWAYAMBHU.x, z - SWAYAMBHU.z) < 6) continue;
    c.onGround(x, 0.06, z, KIND.street, i * 0.4);
  }
}

function rivers(c: Cloud) {
  for (const curve of [BAGMATI, BISHNUMATI]) {
    const len = curve.getLength(), m = Math.round(len / 0.26);
    const pts = curve.getSpacedPoints(m);
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i]!, q = pts[i + 1]!;
      const dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz) || 1;
      for (const lane of [-0.38, 0, 0.38]) c.onGround(p.x - (dz / l) * lane, 0.12, p.z + (dx / l) * lane, KIND.river, i * 0.26);
    }
  }
}

/* 1D ridged noise for the skyline. */
const h1 = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
function noise1(x: number) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return h1(i) + (h1(i + 1) - h1(i)) * u;
}
function ridge1(x: number, oct: number) {
  let s = 0, a = 0.5;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(noise1(x) * 2 - 1);
    s += n * n * a;
    x *= 2.1; a *= 0.5;
  }
  return s;
}

/** Three layers of ridges ringing the valley: the rim hills, then the Himalaya. */
function skyline(c: Cloud, detail: number) {
  const layers = [
    { R: 118, base: 12, amp: 20, freq: 3.2, ds: 0.55, n: 10, sharp: 1.2 },
    { R: 162, base: 20, amp: 30, freq: 2.6, ds: 0.75, n: 12, sharp: 1.5 },
    { R: 222, base: 30, amp: 70, freq: 3.8, ds: 0.95, n: 15, sharp: 2.4 },
  ];
  const span = (130 * Math.PI) / 180;
  layers.forEach((L, li) => {
    const cols = Math.round((L.R * span * 2) / L.ds);
    for (let i = 0; i <= cols; i++) {
      const th = -span + (i / cols) * span * 2;
      const env = 1 - Math.pow(Math.abs(th) / span, 3);
      const crest = -2 + (L.base + L.amp * Math.pow(ridge1(th * L.freq + li * 13.7 + 3, 4), L.sharp)) * env;
      const x = Math.sin(th) * L.R, z = Math.cos(th) * L.R;
      c.at(x, crest, z, KIND.ridge + li, 0);
      const depth = crest + 2;
      const m = Math.round(L.n * detail);
      for (let j = 0; j < m; j++) {
        const t = Math.pow(Math.random(), 1.7);
        c.at(x + (Math.random() - 0.5) * L.ds, crest - depth * t, z + (Math.random() - 0.5) * L.ds, KIND.ridge + li, t);
      }
    }
  });
}

/** Build the whole valley. `detail` 0.5..1 scales point density with the GPU tier. */
export function buildValley(detail: number) {
  const c = new Cloud();
  skyline(c, detail);
  rivers(c);
  // The old city, Patan across the river, Bhaktapur, and sprawl toward Boudha.
  district(c, { cx: -4, cz: 5, ax: 20, az: 18, maxH: 4.2, cell: 3.0, rot: 0.14, density: 0.95 }, detail);
  district(c, { cx: 9, cz: -14, ax: 9, az: 8, maxH: 2.6, cell: 2.7, rot: 0.05, density: 0.9 }, detail);
  district(c, { cx: 40, cz: 5, ax: 7, az: 6, maxH: 2.2, cell: 2.5, rot: -0.1, density: 0.9 }, detail);
  district(c, { cx: 22, cz: 12, ax: 12, az: 16, maxH: 2.0, cell: 3.2, rot: 0.3, density: 0.6 }, detail);
  district(c, { cx: -6, cz: 24, ax: 16, az: 9, maxH: 1.8, cell: 3.3, rot: 0.2, density: 0.55 }, detail);
  ringRoad(c);
  PAGODAS.forEach((p) => pagoda(c, p));
  STUPAS.forEach((s) => stupa(c, s, detail));
  dharahara(c);
  return c.geometry();
}
