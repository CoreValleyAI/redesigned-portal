/**
 * Builds the hero's terrain data (S1) from public elevation tiles.
 *
 *   node scripts/build-terrain.mjs
 *
 * Source: the open Terrain Tiles dataset on AWS (Mapzen "terrarium" PNGs,
 * derived from SRTM, GMTED and other public sources). Attribution is shown
 * in the site footer's credits.
 *
 * Area: the Kathmandu Valley and its rim, with the Himalaya to the north —
 * the view from the south that the hero camera takes. Only public
 * geography: no facility location is involved anywhere.
 *
 * Output: public/gl/valley.png — one RGB texture, 512 × 512:
 *   R  height, normalised and gamma-encoded (more precision low down)
 *   G  river intensity (log of D8 flow accumulation)
 *   B  "power arrives" time: rivers light first, upstream from the valley's
 *      southern outlet, then the land outward from the nearest river
 * and public/gl/valley.json with the numbers the shader needs.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "gl");
const CACHE = path.join(ROOT, ".cache", "terrain");

/* Bounding box (degrees) and output size. */
const BBOX = { west: 84.86, east: 85.94, south: 27.42, north: 28.42 };
const SIZE = 512;
const ZOOM = 11;
const GAMMA = 0.55;

/* The valley's southern outlet: the Bagmati leaves through the Chobhar
   gorge and runs south. Power "arrives" from here, upstream. */
const OUTLET = { lon: 85.285, lat: 27.62 };
/* Labels, for optional use by the page. Public city centres. */
const PLACES = {
  Kathmandu: { lon: 85.324, lat: 27.7172 },
  Lalitpur: { lon: 85.3206, lat: 27.6644 },
  Bhaktapur: { lon: 85.4298, lat: 27.671 },
};

/* ── PNG: a small decoder for 8-bit RGB(A) tiles and an RGB encoder ─────── */

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
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
      if (data[8] !== 8) throw new Error("only 8-bit PNGs");
      colorType = data[9];
      if (data[12] !== 0) throw new Error("no interlacing");
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!bpp) throw new Error(`colour type ${colorType}`);
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
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  // Filter each row with "Up" (2): smooth data compresses far better.
  const stride = width * 3;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 2;
    for (let x = 0; x < stride; x++) {
      const v = rgb[y * stride + x];
      const up = y > 0 ? rgb[(y - 1) * stride + x] : 0;
      raw[y * (stride + 1) + 1 + x] = (v - up) & 255;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ── Tiles ──────────────────────────────────────────────────────────────── */

const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z;
const lat2y = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};

async function tile(x, y) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${ZOOM}-${x}-${y}.png`);
  if (!fs.existsSync(file)) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${x}/${y}.png`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return decodePng(fs.readFileSync(file));
}

async function elevationSampler() {
  const x0 = Math.floor(lon2x(BBOX.west, ZOOM));
  const x1 = Math.floor(lon2x(BBOX.east, ZOOM));
  const y0 = Math.floor(lat2y(BBOX.north, ZOOM));
  const y1 = Math.floor(lat2y(BBOX.south, ZOOM));
  const tiles = new Map();
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) tiles.set(`${tx},${ty}`, await tile(tx, ty));
  }
  console.log(`terrain: ${tiles.size} tiles at zoom ${ZOOM}`);
  const px = (gx, gy) => {
    const tx = Math.floor(gx / 256);
    const ty = Math.floor(gy / 256);
    const t = tiles.get(`${tx},${ty}`);
    if (!t) return 0;
    const ix = Math.min(255, Math.max(0, Math.floor(gx - tx * 256)));
    const iy = Math.min(255, Math.max(0, Math.floor(gy - ty * 256)));
    const i = (iy * 256 + ix) * t.bpp;
    return t.data[i] * 256 + t.data[i + 1] + t.data[i + 2] / 256 - 32768;
  };
  // Bilinear sample at a lon/lat.
  return (lon, lat) => {
    const gx = lon2x(lon, ZOOM) * 256 - 0.5;
    const gy = lat2y(lat, ZOOM) * 256 - 0.5;
    const ix = Math.floor(gx);
    const iy = Math.floor(gy);
    const fx = gx - ix;
    const fy = gy - iy;
    const a = px(ix, iy);
    const b = px(ix + 1, iy);
    const c = px(ix, iy + 1);
    const d = px(ix + 1, iy + 1);
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
  };
}

/* ── Hydrology: D8 flow, accumulation, distance along rivers ────────────── */

const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

function hydrology(h, n) {
  // Fill small pits so water keeps flowing (a simple priority-flood).
  const filled = Float32Array.from(h);
  const done = new Uint8Array(n * n);
  const heap = [];
  const push = (i, v) => {
    heap.push([v, i]);
    let k = heap.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (heap[p][0] <= heap[k][0]) break;
      [heap[p], heap[k]] = [heap[k], heap[p]];
      k = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  for (let i = 0; i < n; i++) {
    for (const j of [i, (n - 1) * n + i, i * n, i * n + n - 1]) {
      if (!done[j]) {
        done[j] = 1;
        push(j, filled[j]);
      }
    }
  }
  while (heap.length) {
    const [v, i] = pop();
    const x = i % n;
    const y = (i / n) | 0;
    for (const [dx, dy] of DIRS) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
      const j = yy * n + xx;
      if (done[j]) continue;
      done[j] = 1;
      if (filled[j] < v + 0.01) filled[j] = v + 0.01;
      push(j, filled[j]);
    }
  }

  // D8 receivers.
  const recv = new Int32Array(n * n).fill(-1);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      let best = 0;
      for (const [dx, dy] of DIRS) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        const j = yy * n + xx;
        const drop = (filled[i] - filled[j]) / Math.hypot(dx, dy);
        if (drop > best) {
          best = drop;
          recv[i] = j;
        }
      }
    }
  }
  // Accumulation: process cells from highest to lowest.
  const order = Array.from({ length: n * n }, (_, i) => i).sort((a, b) => filled[b] - filled[a]);
  const acc = new Float32Array(n * n).fill(1);
  for (const i of order) if (recv[i] >= 0) acc[recv[i]] += acc[i];
  return { recv, acc, order };
}

/* ── Build ──────────────────────────────────────────────────────────────── */

const sample = await elevationSampler();
const n = SIZE;
const h = new Float32Array(n * n);
let lo = Infinity;
let hi = -Infinity;
for (let y = 0; y < n; y++) {
  // Row 0 is the north edge.
  const lat = BBOX.north - ((y + 0.5) / n) * (BBOX.north - BBOX.south);
  for (let x = 0; x < n; x++) {
    const lon = BBOX.west + ((x + 0.5) / n) * (BBOX.east - BBOX.west);
    const v = Math.max(0, sample(lon, lat));
    h[y * n + x] = v;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
}
console.log(`terrain: height ${lo.toFixed(0)}–${hi.toFixed(0)} m`);

let tt = Date.now();
const lap = (label) => {
  console.log(`terrain: ${label} ${Date.now() - tt} ms`);
  tt = Date.now();
};
const { recv, acc } = hydrology(h, n);
lap("hydrology");

// River intensity: log accumulation above a threshold (cells of upstream area).
const T = 260;
const river = new Float32Array(n * n);
let accMax = 0;
for (let i = 0; i < n * n; i++) accMax = Math.max(accMax, acc[i]);
for (let i = 0; i < n * n; i++) {
  if (acc[i] < T) continue;
  river[i] = Math.min(1, Math.log(acc[i] / T) / Math.log(accMax / T));
}

// Distance along the network, upstream from the outlet. Walk every river
// cell downstream until it reaches the outlet's catchment exit; cells that
// drain elsewhere (other valleys) light later, after the valley's own.
const toIndex = (lon, lat) => {
  const x = Math.round(((lon - BBOX.west) / (BBOX.east - BBOX.west)) * n - 0.5);
  const y = Math.round(((BBOX.north - lat) / (BBOX.north - BBOX.south)) * n - 0.5);
  return y * n + x;
};
// Snap the outlet to the strongest river cell nearby.
let outlet = toIndex(OUTLET.lon, OUTLET.lat);
{
  const ox = outlet % n;
  const oy = (outlet / n) | 0;
  let best = -1;
  for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
      const j = (oy + dy) * n + (ox + dx);
      if (acc[j] > best) {
        best = acc[j];
        outlet = j;
      }
    }
  }
}
const along = new Float32Array(n * n).fill(-1);
along[outlet] = 0;
// Upstream breadth-first walk from the outlet over the river network.
const upstream = new Map();
for (let i = 0; i < n * n; i++) {
  if (river[i] <= 0 || recv[i] < 0) continue;
  const r = recv[i];
  if (!upstream.has(r)) upstream.set(r, []);
  upstream.get(r).push(i);
}
const queue = [outlet];
for (let q = 0; q < queue.length; q++) {
  const i = queue[q];
  for (const j of upstream.get(i) ?? []) {
    if (along[j] >= 0) continue;
    along[j] = along[i] + Math.hypot((j % n) - (i % n), ((j / n) | 0) - ((i / n) | 0));
    queue.push(j);
  }
}
lap("network");
// The outlet's own downstream run (southward), lit first of all.
{
  let i = outlet;
  let d = 0;
  const chain = [];
  while (recv[i] >= 0 && chain.length < n * 2) {
    const j = recv[i];
    d += Math.hypot((j % n) - (i % n), ((j / n) | 0) - ((i / n) | 0));
    chain.push([j, d]);
    i = j;
  }
  for (const [j, dd] of chain) if (along[j] < 0) along[j] = -dd; // negative: before the outlet
}

// Arrival time for every cell: rivers by their distance along the network;
// land by the nearest lit river cell plus its distance from it (a
// multi-source Dijkstra over the grid).
const arrival = new Float64Array(n * n).fill(Infinity);
let minAlong = Infinity;
for (let i = 0; i < n * n; i++) if (river[i] > 0 && along[i] !== -1) minAlong = Math.min(minAlong, along[i]);
{
  // Multi-source Dijkstra with a binary heap in typed arrays (indices plus
  // keys), lazily skipping stale entries.
  const cap = n * n * 9;
  const keys = new Float64Array(cap);
  const ids = new Int32Array(cap);
  let size = 0;
  const push = (v, i) => {
    let k = size++;
    keys[k] = v;
    ids[k] = i;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (keys[p] <= keys[k]) break;
      const tk = keys[p];
      keys[p] = keys[k];
      keys[k] = tk;
      const ti = ids[p];
      ids[p] = ids[k];
      ids[k] = ti;
      k = p;
    }
  };
  const pop = () => {
    const v = keys[0];
    const i = ids[0];
    size--;
    if (size > 0) {
      keys[0] = keys[size];
      ids[0] = ids[size];
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < size && keys[l] < keys[m]) m = l;
        if (r < size && keys[r] < keys[m]) m = r;
        if (m === k) break;
        const tk = keys[m];
        keys[m] = keys[k];
        keys[k] = tk;
        const ti = ids[m];
        ids[m] = ids[k];
        ids[k] = ti;
        k = m;
      }
    }
    return [v, i];
  };
  for (let i = 0; i < n * n; i++) {
    if (river[i] > 0 && along[i] !== -1) {
      arrival[i] = (along[i] - minAlong) * 0.6;
      push(arrival[i], i);
    }
  }
  const done = new Uint8Array(n * n);
  while (size > 0) {
    const [v, i] = pop();
    if (done[i]) continue;
    done[i] = 1;
    const x = i % n;
    const y = (i / n) | 0;
    for (const [dx, dy] of DIRS) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
      const j = yy * n + xx;
      if (done[j]) continue;
      // Climbing costs more: light pools on the valley floor before the rim.
      const climb = Math.max(0, h[j] - h[i]) / 40;
      const c = v + Math.hypot(dx, dy) * (1 + climb);
      if (c < arrival[j]) {
        arrival[j] = c;
        push(c, j);
      }
    }
  }
}
lap("arrival");
let arrMax = 0;
for (let i = 0; i < n * n; i++) if (Number.isFinite(arrival[i])) arrMax = Math.max(arrMax, arrival[i]);

// Pack.
const rgb = Buffer.alloc(n * n * 3);
for (let i = 0; i < n * n; i++) {
  const t = (h[i] - lo) / (hi - lo);
  rgb[i * 3] = Math.round(255 * Math.pow(Math.min(1, Math.max(0, t)), GAMMA));
  rgb[i * 3 + 1] = Math.round(255 * river[i]);
  const a = Number.isFinite(arrival[i]) ? arrival[i] / arrMax : 1;
  rgb[i * 3 + 2] = Math.round(255 * Math.sqrt(a));
}

fs.mkdirSync(OUT, { recursive: true });
const png = encodePngRgb(n, n, rgb);
fs.writeFileSync(path.join(OUT, "valley.png"), png);

const uv = ({ lon, lat }) => [
  +((lon - BBOX.west) / (BBOX.east - BBOX.west)).toFixed(4),
  +((BBOX.north - lat) / (BBOX.north - BBOX.south)).toFixed(4),
];
const kmX = (BBOX.east - BBOX.west) * 111.32 * Math.cos(((BBOX.north + BBOX.south) / 2) * (Math.PI / 180));
const kmZ = (BBOX.north - BBOX.south) * 110.57;
const meta = {
  source: "Terrain Tiles (Mapzen terrarium, from SRTM and other public data) via AWS Open Data",
  bbox: BBOX,
  size: n,
  km: [+kmX.toFixed(2), +kmZ.toFixed(2)],
  height: { min: Math.round(lo), max: Math.round(hi), gamma: GAMMA },
  outlet: [+((outlet % n) / n).toFixed(4), +(((outlet / n) | 0) / n).toFixed(4)],
  places: Object.fromEntries(Object.entries(PLACES).map(([k, v]) => [k, uv(v)])),
};
fs.writeFileSync(path.join(OUT, "valley.json"), JSON.stringify(meta, null, 2) + "\n");
console.log(`terrain: wrote public/gl/valley.png (${(png.length / 1024).toFixed(0)} KB) and valley.json`);
