/**
 * Generative "contour prints" (S14): a small topographic map seeded by a
 * slug — every post and use case gets its own place in the valley, the same
 * on every build. A noise heightfield is contoured with marching squares
 * and returned as SVG path data, plus a sprinkling of dots on the high
 * ground. Pure and deterministic, so it runs on the server, in the build
 * script for OG images, and on the client alike.
 */

export interface ContourArt {
  width: number;
  height: number;
  /** One path per level, lowest first. */
  levels: { d: string; t: number }[];
  /** The level drawn in the accent colour. */
  accent: number;
  dots: { x: number; y: number; r: number }[];
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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

/** Value noise on a lattice, smoothly interpolated. */
function makeNoise(rnd: () => number, size = 64) {
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  const at = (x: number, y: number) => grid[((y & (size - 1)) * size + (x & (size - 1))) >>> 0]!;
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

export function contourArt(seed: string, opts: { cols?: number; rows?: number; levels?: number } = {}): ContourArt {
  const cols = opts.cols ?? 64;
  const rows = opts.rows ?? 40;
  const nLevels = opts.levels ?? 11;
  const W = 640;
  const H = 400;
  const rnd = mulberry32(hashString(seed));
  const noise = makeNoise(rnd);

  // A valley-ish field: fbm noise plus a basin, so most prints read as a
  // valley among ridges rather than random blobs.
  const ox = rnd() * 50;
  const oy = rnd() * 50;
  const bx = 0.3 + rnd() * 0.4;
  const by = 0.35 + rnd() * 0.3;
  const field = new Float32Array((cols + 1) * (rows + 1));
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      let n = 0;
      let amp = 1;
      let f = 3.2;
      for (let o = 0; o < 4; o++) {
        n += amp * noise(ox + u * f * 1.6, oy + v * f);
        amp *= 0.5;
        f *= 2;
      }
      const basin = Math.hypot((u - bx) * 1.3, v - by);
      const h = n * 0.75 + basin * 0.9;
      field[j * (cols + 1) + i] = h;
      lo = Math.min(lo, h);
      hi = Math.max(hi, h);
    }
  }

  const sx = W / cols;
  const sy = H / rows;
  const levels: { d: string; t: number }[] = [];
  for (let L = 1; L <= nLevels; L++) {
    const t = L / (nLevels + 1);
    const iso = lo + (hi - lo) * t;
    let d = "";
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = field[j * (cols + 1) + i]!;
        const b = field[j * (cols + 1) + i + 1]!;
        const c = field[(j + 1) * (cols + 1) + i + 1]!;
        const e = field[(j + 1) * (cols + 1) + i]!;
        const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (e > iso ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const x = i * sx;
        const y = j * sy;
        const lerp = (p: number, q: number) => (iso - p) / (q - p);
        const top: [number, number] = [x + sx * lerp(a, b), y];
        const right: [number, number] = [x + sx, y + sy * lerp(b, c)];
        const bottom: [number, number] = [x + sx * lerp(e, c), y + sy];
        const left: [number, number] = [x, y + sy * lerp(a, e)];
        const seg = (p: [number, number], q: [number, number]) => {
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        };
        switch (code) {
          case 1:
          case 14:
            seg(left, bottom);
            break;
          case 2:
          case 13:
            seg(bottom, right);
            break;
          case 3:
          case 12:
            seg(left, right);
            break;
          case 4:
          case 11:
            seg(top, right);
            break;
          case 5:
            seg(left, top);
            seg(bottom, right);
            break;
          case 6:
          case 9:
            seg(top, bottom);
            break;
          case 7:
          case 8:
            seg(left, top);
            break;
          case 10:
            seg(top, right);
            seg(left, bottom);
            break;
        }
      }
    }
    levels.push({ d, t });
  }

  // Dots on the high ground: a sparse grid where the field is above 75 %.
  const dots: { x: number; y: number; r: number }[] = [];
  for (let j = 1; j < rows; j += 2) {
    for (let i = 1; i < cols; i += 2) {
      const h = (field[j * (cols + 1) + i]! - lo) / (hi - lo);
      if (h > 0.72) dots.push({ x: i * sx, y: j * sy, r: 1 + (h - 0.72) * 6 });
    }
  }

  return { width: W, height: H, levels, accent: Math.floor(nLevels * (0.25 + rnd() * 0.2)), dots };
}
