// The real Kathmandu Valley as contour lines, computed in Node from the
// elevation image the WebGL valley uses (public/gl/valley.png): cropped to
// the valley and its rim, contoured every 100 m with the site's own contour
// code (lib/art/contours.ts, run directly by Node 24). Shared by
// scripts/build-valley-contours.mjs (the site's print) and
// scripts/generate-brand-images.mjs (the link-preview card).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import zlib from "node:zlib";

const { isoLines } = await import(new URL("../../lib/art/contours.ts", import.meta.url).href);

/** The crop, in the image's 0–1 coordinates, and the levels in metres. */
export const CROP = { x0: 0.29, x1: 0.62, y0: 0.6, y1: 0.87 };
export const LEVELS = { from: 1300, to: 2800, step: 100, accent: 1400 };

function decodePng(buf) {
  let off = 8;
  let width = 0;
  let colorType = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const height = raw.length / (stride + 1);
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
  return { width, bpp, data: out };
}

/**
 * The print as ContourArt (lib/art/contours.ts): levels lowest first, the
 * 1,400 m line as the accent, the three cities as markers. Lines shorter
 * than `minChars` of path data (tiny closed loops on hilltops) are dropped.
 */
export function valleyContourArt({ cols = 120, thinTo = 2.2, minChars = 70 } = {}) {
  const meta = JSON.parse(readFileSync(resolve("public/gl/valley.json"), "utf8"));
  const png = decodePng(readFileSync(resolve("public/gl/valley.png")));
  const size = png.width;
  const { min, max, gamma } = meta.height;
  const h = (x, y) =>
    min +
    Math.pow(png.data[(Math.min(size - 1, y) * size + Math.min(size - 1, x)) * png.bpp] / 255, 1 / gamma) * (max - min);
  const heightAt = (u, v) => {
    const x = u * (size - 1);
    const y = v * (size - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const a = h(x0, y0);
    const b = h(x0 + 1, y0);
    const c = h(x0, y0 + 1);
    const d = h(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const wKm = (CROP.x1 - CROP.x0) * meta.km[0];
  const hKm = (CROP.y1 - CROP.y0) * meta.km[1];
  const rows = Math.round((cols * hKm) / wKm);
  const W = 640;
  const H = Math.round((W * hKm) / wKm);
  const field = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++)
      field[j * (cols + 1) + i] = heightAt(
        CROP.x0 + ((CROP.x1 - CROP.x0) * i) / cols,
        CROP.y0 + ((CROP.y1 - CROP.y0) * j) / rows,
      );

  const levels = [];
  let accent = 0;
  const n = (LEVELS.to - LEVELS.from) / LEVELS.step;
  for (let k = 0; k <= n; k++) {
    const iso = LEVELS.from + k * LEVELS.step;
    if (iso === LEVELS.accent) accent = k;
    const lines = isoLines(field, cols, rows, iso, W, H, { thinTo, rounds: 1 }).filter(
      (d) => iso === LEVELS.accent || d.length >= minChars,
    );
    levels.push({ d: lines.join(""), lines, t: Number(((k + 1) / (n + 2)).toFixed(3)) });
  }
  const markers = Object.entries(meta.places).map(([label, [u, v]]) => ({
    label,
    x: Number((((u - CROP.x0) / (CROP.x1 - CROP.x0)) * W).toFixed(1)),
    y: Number((((v - CROP.y0) / (CROP.y1 - CROP.y0)) * H).toFixed(1)),
  }));
  return { width: W, height: H, levels, accent, dots: [], markers };
}
