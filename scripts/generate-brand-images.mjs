/**
 * Renders the raster brand images the site needs but the brand kit ships
 * only as SVG:
 *
 *   app/opengraph-image.png        1200×630  link previews (Open Graph / X)
 *   app/apple-icon.png              180×180  iOS home-screen icon
 *   public/icons/icon-192.png       192×192  web manifest
 *   public/icons/icon-512.png       512×512  web manifest
 *   public/icons/icon-512-maskable.png 512×512  manifest, safe-zone padded
 *
 * Dependency-free: it drives a local Chrome over the DevTools protocol with
 * Node's built-in fetch and WebSocket. Set CHROME to the browser executable
 * if it is not at the default Windows path.
 *
 *   npm run generate:brand
 *
 * Re-run after a brand change; the outputs are committed.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import zlib from "node:zlib";
// The site's own contour code (TypeScript, run directly by Node 24).
const { isoLines } = await import(new URL("../lib/art/contours.ts", import.meta.url).href);

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9337;

const brandmark = readFileSync(resolve("public/brand/cv-brandmark.svg"), "utf8");
const wordmarkWhite = readFileSync(resolve("public/brand/cv-wordmark-white.svg"), "utf8");
const combined = readFileSync(resolve("public/brand/cv-combinedmark-green.svg"), "utf8");

const CARBON = "#05080D";
const HYDRO = "#4ADE80";

const page = (body, w, h) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=JetBrains+Mono:wght@500&display=block">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${CARBON};}
  body{font-family:Manrope,"Segoe UI",system-ui,-apple-system,sans-serif;color:#E8ECEF;-webkit-font-smoothing:antialiased;}
  svg{display:block}
</style></head><body>${body}</body></html>`;

/* ── The Open Graph card ──────────────────────────────────────────────────
   Night Valley colours (app/styles/tokens.css, dark), the home hero's
   words, and the real Kathmandu Valley contoured beside them: the same
   elevation data and contour code as the site (lib/art/valley.ts). */
const NIGHT = { bg: "#0a0f14", hydro: "#59ec85", ink: "#eff2f5", ink2: "#b3b8be", ink3: "#90969c" };

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
  return { width, bpp, data: out };
}

function valleySvg() {
  const meta = JSON.parse(readFileSync(resolve("public/gl/valley.json"), "utf8"));
  const png = decodePng(readFileSync(resolve("public/gl/valley.png")));
  const size = png.width;
  const { min, max, gamma } = meta.height;
  const h = (x, y) =>
    min + Math.pow(png.data[(Math.min(size - 1, y) * size + Math.min(size - 1, x)) * png.bpp] / 255, 1 / gamma) * (max - min);
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
  const CROP = { x0: 0.29, x1: 0.62, y0: 0.6, y1: 0.87 };
  const wKm = (CROP.x1 - CROP.x0) * meta.km[0];
  const hKm = (CROP.y1 - CROP.y0) * meta.km[1];
  const cols = 150;
  const rows = Math.round((cols * hKm) / wKm);
  const W = 640;
  const H = Math.round((W * hKm) / wKm);
  const field = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i <= cols; i++)
      field[j * (cols + 1) + i] = heightAt(CROP.x0 + ((CROP.x1 - CROP.x0) * i) / cols, CROP.y0 + ((CROP.y1 - CROP.y0) * j) / rows);
  let paths = "";
  for (let iso = 1300, k = 0; iso <= 2800; iso += 100, k++) {
    const d = isoLines(field, cols, rows, iso, W, H, { thinTo: 1.6, rounds: 1 }).join("");
    const accent = iso === 1400;
    paths += `<path d="${d}" fill="none" stroke="${accent ? NIGHT.hydro : NIGHT.ink3}" stroke-width="${accent ? 2.2 : 1}" opacity="${accent ? 1 : (0.22 + k * 0.03).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
  }
  for (const [label, [u, v]] of Object.entries(meta.places)) {
    const x = ((u - CROP.x0) / (CROP.x1 - CROP.x0)) * W;
    const y = ((v - CROP.y0) / (CROP.y1 - CROP.y0)) * H;
    paths += `<circle cx="${x}" cy="${y}" r="9" fill="${NIGHT.hydro}" opacity=".18"/><circle cx="${x}" cy="${y}" r="3.6" fill="${NIGHT.hydro}"/><text x="${x + 12}" y="${y + 4}" font-family="JetBrains Mono" font-size="11" letter-spacing="1.4" fill="${NIGHT.ink2}">${label.toUpperCase()}</text>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" width="760" height="${Math.round((760 * H) / W)}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

const og = page(
  `<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:${NIGHT.bg}">
    <div style="position:absolute;right:-70px;top:-40px;-webkit-mask-image:linear-gradient(to right,transparent,#000 38%);mask-image:linear-gradient(to right,transparent,#000 38%)">${valleySvg()}</div>
    <div style="position:absolute;left:80px;top:72px;display:flex;align-items:center;gap:20px">
      <div style="width:64px">${brandmark.replace("<svg", '<svg width="64"')}</div>
      <div style="width:210px">${wordmarkWhite.replace("<svg", '<svg width="210"')}</div>
    </div>
    <div style="position:absolute;left:80px;top:196px;font-family:'JetBrains Mono',monospace;font-size:17px;letter-spacing:.16em;text-transform:uppercase;color:${NIGHT.ink3}">Kathmandu Valley · NVIDIA H200 NVL · Coming soon</div>
    <div style="position:absolute;left:80px;top:236px;font-family:Inter,sans-serif;font-optical-sizing:auto;font-size:84px;font-weight:650;letter-spacing:-0.035em;line-height:1.02;color:${NIGHT.ink}">The valley is<br>coming <span style="color:${NIGHT.hydro};text-shadow:0 0 .45em rgba(89,236,133,.38)">online.</span></div>
    <div style="position:absolute;left:80px;top:440px;font-family:Inter,sans-serif;font-size:24px;line-height:1.42;color:${NIGHT.ink2};max-width:600px">Nepal&rsquo;s GPU cloud: NVIDIA H200 NVL GPUs on HPE Private Cloud AI, in a datacentre in the Kathmandu Valley.</div>
    <div style="position:absolute;left:80px;bottom:40px;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:${NIGHT.hydro}">corevalley.ai</div>
  </div>`,
  1200,
  630,
);

/* Icons: the combined mark centred on Carbon. The maskable variant keeps the
   mark inside the 80% safe zone so platform masks never clip it. */
const icon = (size, inset) =>
  page(
    `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${CARBON}">
      <div style="width:${Math.round(size * (1 - inset * 2))}px">${combined.replace("<svg", `<svg width="${Math.round(size * (1 - inset * 2))}"`)}</div>
    </div>`,
    size,
    size,
  );

const JOBS = [
  ["app/opengraph-image.png", og, 1200, 630],
  ["app/apple-icon.png", icon(180, 0.12), 180, 180],
  ["public/icons/icon-192.png", icon(192, 0.12), 192, 192],
  ["public/icons/icon-512.png", icon(512, 0.12), 512, 512],
  ["public/icons/icon-512-maskable.png", icon(512, 0.2), 512, 512],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--no-sandbox",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    "--window-size=1200,630",
    // A throwaway profile outside the repo, so nothing lands in git or ESLint.
    `--user-data-dir=${join(tmpdir(), "corevalley-brand-profile")}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function ready() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome did not start. Set CHROME to the browser path.");
}

function connect(url) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.rej(new Error(JSON.stringify(msg.error)));
        else p.res(msg.result);
      }
    };
    ws.onerror = rej;
    ws.onopen = () =>
      res({
        send: (method, params = {}) =>
          new Promise((r, j) => {
            const i = ++id;
            pending.set(i, { res: r, rej: j });
            ws.send(JSON.stringify({ id: i, method, params }));
          }),
        close: () => ws.close(),
      });
  });
}

try {
  await ready();
  const target = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })
  ).json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  for (const [out, html, w, h] of JOBS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send("Page.navigate", { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` });
    await sleep(700);
    await cdp.send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => 1)", awaitPromise: true });
    await sleep(150);
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: w, height: h, scale: 1 },
    });
    mkdirSync(resolve(out, ".."), { recursive: true });
    writeFileSync(resolve(out), Buffer.from(shot.data, "base64"));
    console.log(`wrote ${out} (${w}×${h})`);
  }
  cdp.close();
} finally {
  chrome.kill();
}
