/**
 * The real Kathmandu Valley as a contour print: the elevation data the
 * home page's WebGL valley is drawn from (public/gl/valley.png, built by
 * scripts/build-terrain.mjs from public terrain tiles), cropped to the
 * valley and its rim and contoured every 100 m. The 1,400 m line, close to
 * the edge of the valley floor, is the accent; Kathmandu, Lalitpur and
 * Bhaktapur are marked. Browser only (it decodes the image on a canvas).
 */
import { asset } from "@/lib/links";
import { isoLines, type ContourArt } from "./contours";

interface Meta {
  size: number;
  km: [number, number];
  height: { min: number; max: number; gamma: number };
  places: Record<string, [number, number]>;
}

/** The crop, in the image's 0–1 coordinates: the valley and its rim. */
const CROP = { x0: 0.29, x1: 0.62, y0: 0.6, y1: 0.87 };
const LEVELS = { from: 1300, to: 2800, step: 100, accent: 1400 };

export async function valleyArt(): Promise<ContourArt> {
  const [meta, bitmap] = await Promise.all([
    fetch(asset("/gl/valley.json")).then((r) => r.json() as Promise<Meta>),
    fetch(asset("/gl/valley.png"))
      .then((r) => r.blob())
      .then((b) => createImageBitmap(b, { colorSpaceConversion: "none", premultiplyAlpha: "none" })),
  ]);
  const size = bitmap.width;
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement("canvas"), { width: size, height: size });
  const ctx = canvas.getContext("2d", { willReadFrequently: true }) as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.drawImage(bitmap, 0, 0);
  const px = ctx.getImageData(0, 0, size, size).data;

  // Heights in metres, bilinear between pixels (red channel, gamma-coded).
  const { min, max, gamma } = meta.height;
  const heightAt = (u: number, v: number) => {
    const x = u * (size - 1);
    const y = v * (size - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const r = (xx: number, yy: number) =>
      min + Math.pow(px[(Math.min(size - 1, yy) * size + Math.min(size - 1, xx)) * 4]! / 255, 1 / gamma) * (max - min);
    const a = r(x0, y0);
    const b = r(x0 + 1, y0);
    const c = r(x0, y0 + 1);
    const d = r(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  // Square cells on the ground: the crop's shape in kilometres sets the rows.
  const wKm = (CROP.x1 - CROP.x0) * meta.km[0];
  const hKm = (CROP.y1 - CROP.y0) * meta.km[1];
  const cols = 150;
  const rows = Math.round((cols * hKm) / wKm);
  const W = 640;
  const H = Math.round((W * hKm) / wKm);
  const field = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      field[j * (cols + 1) + i] = heightAt(
        CROP.x0 + ((CROP.x1 - CROP.x0) * i) / cols,
        CROP.y0 + ((CROP.y1 - CROP.y0) * j) / rows,
      );
    }
  }

  const levels: ContourArt["levels"] = [];
  let accent = 0;
  const n = (LEVELS.to - LEVELS.from) / LEVELS.step;
  for (let k = 0; k <= n; k++) {
    const iso = LEVELS.from + k * LEVELS.step;
    if (iso === LEVELS.accent) accent = k;
    const lines = isoLines(field, cols, rows, iso, W, H, { thinTo: 1.6, rounds: 1 });
    levels.push({ d: lines.join(""), lines, t: (k + 1) / (n + 2) });
  }

  const markers = Object.entries(meta.places).map(([label, [u, v]]) => ({
    label,
    x: ((u - CROP.x0) / (CROP.x1 - CROP.x0)) * W,
    y: ((v - CROP.y0) / (CROP.y1 - CROP.y0)) * H,
  }));

  return { width: W, height: H, levels, accent, dots: [], markers };
}
