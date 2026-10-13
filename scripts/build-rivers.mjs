// The valley's rivers as a distance field, for the daylight relief
// (components/gl/scenes/valley-relief.ts).
//
// The terrain texture (public/gl/valley.png, scripts/build-terrain.mjs)
// stores the rivers in its green channel as lines one texel wide. Sampled
// directly they draw as steps. Here they are traced into polylines, smoothed
// (Chaikin), and baked into a field at 2× the resolution:
//
//   R  distance to the nearest river centreline, 0…RANGE texels (of this
//      field), 0 = on the line
//   G  that river's strength, 0…1 (the source's green value: the Bagmati
//      high, small tributaries low)
//
// A distance field interpolates smoothly, so the shader can draw a crisp,
// anti-aliased line of any width at any magnification.
//
//   node scripts/build-rivers.mjs
import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";

const SRC = "public/gl/valley.png";
const OUT = "public/gl/valley-rivers.png";
const SCALE = 2; // field texels per source texel
const RANGE = 8; // distances stored up to this many field texels
const THRESHOLD = 34; // source green above this is a river

function decodePng(buf) {
  let off = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { width, height, bpp, data: out };
}

function encodePngRgb(width, height, rgb) {
  const crcTable = (td) => {
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return crc;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
    return Buffer.concat([len, td, crcTable(td)]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const src = decodePng(readFileSync(SRC));
const N = src.width;
const g = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : src.data[(y * N + x) * src.bpp + 1]);
const on = (x, y) => g(x, y) > THRESHOLD;

// Graph edges: 8-neighbours, minus diagonals that cut a corner already
// joined orthogonally (keeps one-texel lines a simple chain).
const key = (x, y) => y * N + x;
const neighbours = (x, y) => {
  const out = [];
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ])
    if (on(x + dx, y + dy)) out.push([x + dx, y + dy]);
  for (const [dx, dy] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    if (on(x + dx, y + dy) && !on(x + dx, y) && !on(x, y + dy)) out.push([x + dx, y + dy]);
  return out;
};

// Trace chains between nodes (ends and junctions).
const visitedEdge = new Set();
const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const degree = (x, y) => neighbours(x, y).length;
const lines = [];
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    if (!on(x, y) || degree(x, y) === 2) continue;
    for (const [nx, ny] of neighbours(x, y)) {
      if (visitedEdge.has(ek(key(x, y), key(nx, ny)))) continue;
      const path = [[x, y]];
      let [px, py] = [x, y];
      let [cx, cy] = [nx, ny];
      visitedEdge.add(ek(key(px, py), key(cx, cy)));
      for (;;) {
        path.push([cx, cy]);
        const next = neighbours(cx, cy).filter(([ax, ay]) => !(ax === px && ay === py));
        if (degree(cx, cy) !== 2 || next.length !== 1) break;
        const [ax, ay] = next[0];
        if (visitedEdge.has(ek(key(cx, cy), key(ax, ay)))) break;
        visitedEdge.add(ek(key(cx, cy), key(ax, ay)));
        [px, py, cx, cy] = [cx, cy, ax, ay];
      }
      if (path.length >= 3) lines.push(path);
    }
  }

// Smooth: Chaikin twice, ends kept.
const chaikin = (p) => {
  if (p.length < 3) return p;
  const out = [p[0]];
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b] = [p[i], p[i + 1]];
    out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25, a[2]]);
    out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75, b[2]]);
  }
  out.push(p[p.length - 1]);
  return out;
};
const smooth = lines.map((path) => {
  // Points at texel centres, with their strength.
  let p = path.map(([x, y]) => [x + 0.5, y + 0.5, g(x, y) / 255]);
  // A moving average over ±3 points takes out the pixel staircase; the
  // ends stay put so tributaries still meet their river.
  for (let pass = 0; pass < 3; pass++) {
    const q = p.map((pt) => [...pt]);
    for (let i = 1; i < p.length - 1; i++) {
      const r = Math.min(3, i, p.length - 1 - i);
      let sx = 0;
      let sy = 0;
      for (let j = -r; j <= r; j++) {
        sx += p[i + j][0];
        sy += p[i + j][1];
      }
      q[i][0] = sx / (2 * r + 1);
      q[i][1] = sy / (2 * r + 1);
    }
    p = q;
  }
  p = chaikin(chaikin(p));
  return p;
});

// Bake the field.
const M = N * SCALE;
const dist = new Float32Array(M * M).fill(RANGE);
const str = new Float32Array(M * M);
for (const p of smooth) {
  for (let i = 0; i < p.length - 1; i++) {
    const ax = p[i][0] * SCALE;
    const ay = p[i][1] * SCALE;
    const bx = p[i + 1][0] * SCALE;
    const by = p[i + 1][1] * SCALE;
    const s = (p[i][2] + p[i + 1][2]) / 2;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - RANGE));
    const x1 = Math.min(M - 1, Math.ceil(Math.max(ax, bx) + RANGE));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - RANGE));
    const y1 = Math.min(M - 1, Math.ceil(Math.max(ay, by) + RANGE));
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        const d = Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
        const k = y * M + x;
        if (d < dist[k]) {
          dist[k] = d;
          str[k] = s;
        } else if (d < dist[k] + 0.75) str[k] = Math.max(str[k], s);
      }
  }
}

const rgb = Buffer.alloc(M * M * 3);
for (let k = 0; k < M * M; k++) {
  rgb[k * 3] = Math.round((Math.min(dist[k], RANGE) / RANGE) * 255);
  rgb[k * 3 + 1] = Math.round(Math.min(1, str[k]) * 255);
  rgb[k * 3 + 2] = 0;
}
writeFileSync(OUT, encodePngRgb(M, M, rgb));
console.log(`${OUT}: ${M}×${M}, ${smooth.length} rivers, range ${RANGE} texels`);
