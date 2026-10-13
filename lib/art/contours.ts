/**
 * Generative "contour prints" (S14): a small topographic map seeded by a
 * slug — every post and use case gets its own place in the valley, the same
 * on every build. A noise heightfield is contoured with marching squares;
 * the segments are joined into continuous lines (so a line can be traced
 * end to end, like a plotter drawing it) and smoothed, and returned as SVG
 * path data, plus a sprinkling of dots on the high ground. Pure and
 * deterministic: it runs on the server and in the browser alike.
 */

export interface ContourArt {
  width: number;
  height: number;
  /** One entry per level, lowest first: `d` is the whole level as one
      path; `lines` the same contours as separate paths, one per line. */
  levels: { d: string; lines: string[]; t: number }[];
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

/**
 * Join segments into lines. Segment n runs from point 2n to 2n + 1; its
 * ends are named by the cell edge they lie on, and an edge is shared by at
 * most two segments, so following names walks each line from end to end.
 */
function chain(ends: string[], pts: [number, number][]): [number, number][][] {
  const at = new Map<string, number[]>();
  ends.forEach((k, i) => {
    const list = at.get(k);
    if (list) list.push(i);
    else at.set(k, [i]);
  });
  const used = new Uint8Array(ends.length / 2);
  const lines: [number, number][][] = [];
  // From end `i` of a segment, the other end of the segment sharing its edge.
  const next = (i: number) => {
    const k = ends[i]!;
    for (const j of at.get(k) ?? []) if (j !== i && !used[j >> 1]) return j;
    return -1;
  };
  for (let s = 0; s < used.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const line: [number, number][] = [pts[2 * s]!, pts[2 * s + 1]!];
    // Grow forward from the segment's second end, then backward from its first.
    for (const [from, push] of [
      [2 * s + 1, (p: [number, number]) => line.push(p)],
      [2 * s, (p: [number, number]) => line.unshift(p)],
    ] as const) {
      let j = next(from);
      while (j >= 0) {
        used[j >> 1] = 1;
        const other = j ^ 1;
        push(pts[other]!);
        j = next(other);
      }
    }
    if (line.length >= 3) lines.push(line);
  }
  return lines;
}

/** Two rounds of Chaikin corner cutting: the cell grid's kinks become curves. */
function smooth(line: [number, number][]): [number, number][] {
  let out = line;
  for (let r = 0; r < 2; r++) {
    const closed = out.length > 3 && Math.hypot(out[0]![0] - out.at(-1)![0], out[0]![1] - out.at(-1)![1]) < 0.01;
    const next: [number, number][] = closed ? [] : [out[0]!];
    for (let i = 0; i < out.length - 1; i++) {
      const [ax, ay] = out[i]!;
      const [bx, by] = out[i + 1]!;
      next.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
    }
    if (closed) next.push(next[0]!);
    else next.push(out.at(-1)!);
    out = next;
  }
  return out;
}

function toPath(line: [number, number][]): string {
  const f = (v: number) => String(Math.round(v * 10) / 10);
  return line.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join("");
}

export function contourArt(seed: string, opts: { cols?: number; rows?: number; levels?: number } = {}): ContourArt {
  const cols = opts.cols ?? 56;
  const rows = opts.rows ?? 35;
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
  const levels: { d: string; lines: string[]; t: number }[] = [];
  for (let L = 1; L <= nLevels; L++) {
    const t = L / (nLevels + 1);
    const iso = lo + (hi - lo) * t;

    // Marching squares. Each crossing lies on one cell edge, named so that
    // the two cells sharing an edge name it the same: that is how segments
    // are joined into lines below.
    const ends: string[] = [];
    const pts: [number, number][] = [];
    const lerp = (p: number, q: number) => (iso - p) / (q - p);
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
        const top = { k: `h${i},${j}`, p: [x + sx * lerp(a, b), y] as [number, number] };
        const right = { k: `v${i + 1},${j}`, p: [x + sx, y + sy * lerp(b, c)] as [number, number] };
        const bottom = { k: `h${i},${j + 1}`, p: [x + sx * lerp(e, c), y + sy] as [number, number] };
        const left = { k: `v${i},${j}`, p: [x, y + sy * lerp(a, e)] as [number, number] };
        const seg = (u: typeof top, v: typeof top) => {
          ends.push(u.k, v.k);
          pts.push(u.p, v.p);
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

    const lines = chain(ends, pts).map((line) => toPath(smooth(line)));
    levels.push({ d: lines.join(""), lines, t });
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
