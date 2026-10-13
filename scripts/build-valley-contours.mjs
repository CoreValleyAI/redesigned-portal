// Writes public/gl/valley-contours.json: the real Kathmandu Valley as a
// contour print (scripts/lib/valley-contours.mjs), computed once here so
// the browser only fetches and draws it. Re-run after the terrain changes.
//   node scripts/build-valley-contours.mjs
import { writeFileSync } from "node:fs";
import { valleyContourArt } from "./lib/valley-contours.mjs";

const art = valleyContourArt();
// Per-line paths are enough: the whole-level path is their concatenation.
const out = { ...art, levels: art.levels.map(({ lines, t }) => ({ lines, t })) };
const json = JSON.stringify(out);
writeFileSync("public/gl/valley-contours.json", json);
const lines = art.levels.reduce((n, l) => n + l.lines.length, 0);
console.log(`wrote public/gl/valley-contours.json: ${lines} lines, ${(json.length / 1024).toFixed(0)} KB`);
