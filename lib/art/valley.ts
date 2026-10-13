/**
 * The real Kathmandu Valley as a contour print: the elevation data the
 * home page's WebGL valley is drawn from, cropped to the valley and its rim
 * and contoured every 100 m (the 1,400 m line, close to the edge of the
 * valley floor, is the accent; Kathmandu, Lalitpur and Bhaktapur are
 * marked). Computed once at build time by scripts/build-valley-contours.mjs
 * into public/gl/valley-contours.json; the browser only fetches and draws it.
 */
import { asset } from "@/lib/links";
import type { ContourArt } from "./contours";

type Stored = Omit<ContourArt, "levels"> & { levels: { lines: string[]; t: number }[] };

export async function valleyArt(): Promise<ContourArt> {
  const res = await fetch(asset("/gl/valley-contours.json"));
  if (!res.ok) throw new Error(`valley-contours.json: ${res.status}`);
  const art = (await res.json()) as Stored;
  return { ...art, levels: art.levels.map((l) => ({ ...l, d: l.lines.join("") })) };
}
