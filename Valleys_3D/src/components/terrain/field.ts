/**
 * The shape of the world, written twice: once in GLSL for the shaders and
 * once in TypeScript for everything the CPU must agree with (the flight path
 * keeping clear of the ground, the compute nodes on real peaks, the city of
 * the finale standing on the valley floor). The two versions are the same
 * formulas line for line; change one, change the other.
 *
 * The world is a valley that never ends, until it opens. A river meanders
 * along +z (centreline riverX(z), half-width valleyW(z)) between ridged
 * mountains. At the end of the flight the valley widens into a basin: the
 * Kathmandu Valley, a flat floor ringed by a high rim, with a gorge cut
 * through the southern rim where the river leaves (Chobhar) and the hill of
 * Swayambhu rising on the west.
 */

/* ── Layout ─────────────────────────────────────────────────────────────── */

/** Where the flight ends, and where the basin sits beyond it. */
export const Z_START = 0;
export const Z_END = 1100;
export const BASIN_R = 58;
export const BASIN_Z = Z_END + 52;

export const riverX = (z: number) => 14 * Math.sin(z * 0.018) + 7 * Math.sin(z * 0.041 + 1.3) + 3 * Math.sin(z * 0.093 + 0.4);
export const valleyW = (z: number) => 9 + 4 * Math.sin(z * 0.013 + 2.0);

/** The basin is centred on the river where it leaves, so the gorge lines up. */
export const BASIN_X = riverX(BASIN_Z - BASIN_R);

/** Swayambhu's hill, in basin-local coordinates (+x east, +z north). */
export const SWAYAMBHU = { x: -24, z: 8, h: 6, s2: 40 };

const f = (n: number) => n.toFixed(4);

/* ── GLSL ──────────────────────────────────────────────────────────────── */

export const FIELD_GLSL = /* glsl */ `
  const vec2 BASIN_C = vec2(${f(BASIN_X)}, ${f(BASIN_Z)});
  const float BASIN_R = ${f(BASIN_R)};

  // Hash without sine (Dave Hoskins): stable on every GPU at large inputs.
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash12(i), b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float riverX(float z) {
    return 14.0 * sin(z * 0.018) + 7.0 * sin(z * 0.041 + 1.3) + 3.0 * sin(z * 0.093 + 0.4);
  }
  float valleyW(float z) {
    return 9.0 + 4.0 * sin(z * 0.013 + 2.0);
  }
  // Ridged fractal: sharp crests, soft gullies. .x height, .y crest (1 on a ridge line).
  vec2 ridged(vec2 p) {
    float sum = 0.0, amp = 0.5, crest = 0.0;
    for (int i = 0; i < 5; i++) {
      float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
      n *= n;
      sum += n * amp;
      if (i < 2) crest += n * amp;
      p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03;
      amp *= 0.5;
    }
    return vec2(sum, crest / 0.75);
  }
  // x: height · y: crest · z: 0 on the river, 1 on the mountains · w: 1 on the basin floor.
  vec4 terrain(float x, float z) {
    float w = valleyW(z);
    float a = abs(x - riverX(z));
    float valley = smoothstep(w * 0.35, w * 2.6, a);
    vec2 r = ridged(vec2(x, z) * 0.028);
    float peaks = pow(vnoise(vec2(x, z) * 0.011 + 7.0), 2.0) * 34.0;
    float mountains = (r.x * 28.0 + peaks + 3.0) * pow(valley, 1.6);
    float ground = 0.7 * vnoise(vec2(x, z) * 0.12) - 0.9 * (1.0 - smoothstep(0.0, w * 0.55, a));
    float h = mountains + ground;

    // The basin: a flat floor, a rim around it, a gorge where the river leaves.
    vec2 q = vec2(x, z) - BASIN_C;
    float rr = length(q);
    float inB = 1.0 - smoothstep(BASIN_R * 0.72, BASIN_R, rr);
    float gorge = exp(-a * a / (w * w * 1.6)) * (1.0 - smoothstep(-BASIN_R * 0.8, -BASIN_R * 0.4, q.y));
    float rimK = exp(-pow((rr - (BASIN_R + 16.0)) / 14.0, 2.0)) * (1.0 - gorge);
    float rim = rimK * (r.x * 30.0 + 16.0);
    vec2 sq = q - vec2(${f(SWAYAMBHU.x)}, ${f(SWAYAMBHU.z)});
    float floorH = 0.25 * vnoise(vec2(x, z) * 0.2) + ${f(SWAYAMBHU.h)} * exp(-dot(sq, sq) / ${f(SWAYAMBHU.s2)});
    h = mix(max(h, rim), floorH, inB);
    float crest = r.y * (1.0 - inB);
    float mount = mix(max(valley, rimK), 0.85, inB);
    return vec4(h, crest, mount, inB);
  }
`;

/* ── TypeScript mirror ─────────────────────────────────────────────────── */

const fract = (x: number) => x - Math.floor(x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash12(x: number, y: number) {
  let p0 = fract(x * 0.1031), p1 = fract(y * 0.1031), p2 = fract(x * 0.1031);
  const d = p0 * (p1 + 33.33) + p1 * (p2 + 33.33) + p2 * (p0 + 33.33);
  p0 += d; p1 += d; p2 += d;
  return fract((p0 + p1) * p2);
}

function vnoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash12(ix, iy), b = hash12(ix + 1, iy);
  const c = hash12(ix, iy + 1), d = hash12(ix + 1, iy + 1);
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
}

function ridged(x: number, y: number) {
  let sum = 0, amp = 0.5;
  for (let i = 0; i < 5; i++) {
    let n = 1 - Math.abs(vnoise(x, y) * 2 - 1);
    n *= n;
    sum += n * amp;
    // GLSL mat2(0.8, 0.6, -0.6, 0.8) is column-major: (0.8x - 0.6y, 0.6x + 0.8y).
    const nx = (0.8 * x - 0.6 * y) * 2.03, ny = (0.6 * x + 0.8 * y) * 2.03;
    x = nx; y = ny;
    amp *= 0.5;
  }
  return sum;
}

/** Ground height at world (x, z). */
export function heightAt(x: number, z: number) {
  const w = valleyW(z);
  const a = Math.abs(x - riverX(z));
  const valley = smoothstep(w * 0.35, w * 2.6, a);
  const r = ridged(x * 0.028, z * 0.028);
  const peaks = Math.pow(vnoise(x * 0.011 + 7, z * 0.011 + 7), 2) * 34;
  const mountains = (r * 28 + peaks + 3) * Math.pow(valley, 1.6);
  const ground = 0.7 * vnoise(x * 0.12, z * 0.12) - 0.9 * (1 - smoothstep(0, w * 0.55, a));
  let h = mountains + ground;

  const qx = x - BASIN_X, qz = z - BASIN_Z;
  const rr = Math.hypot(qx, qz);
  const inB = 1 - smoothstep(BASIN_R * 0.72, BASIN_R, rr);
  const gorge = Math.exp((-a * a) / (w * w * 1.6)) * (1 - smoothstep(-BASIN_R * 0.8, -BASIN_R * 0.4, qz));
  const rimK = Math.exp(-Math.pow((rr - (BASIN_R + 16)) / 14, 2)) * (1 - gorge);
  const rim = rimK * (r * 30 + 16);
  const sx = qx - SWAYAMBHU.x, sz = qz - SWAYAMBHU.z;
  const floorH = 0.25 * vnoise(x * 0.2, z * 0.2) + SWAYAMBHU.h * Math.exp(-(sx * sx + sz * sz) / SWAYAMBHU.s2);
  h = Math.max(h, rim) * (1 - inB) + floorH * inB;
  return h;
}

/** Ground height in basin-local coordinates. */
export const basinHeight = (lx: number, lz: number) => heightAt(BASIN_X + lx, BASIN_Z + lz);
