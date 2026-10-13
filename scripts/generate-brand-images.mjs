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
import { valleyContourArt } from "./lib/valley-contours.mjs";

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9337;

const brandmark = readFileSync(resolve("public/brand/cv-brandmark.svg"), "utf8");
const wordmarkWhite = readFileSync(resolve("public/brand/cv-wordmark-white.svg"), "utf8");
const combined = readFileSync(resolve("public/brand/cv-combinedmark-green.svg"), "utf8");

const CARBON = "#05080D";

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

/** The real valley as an SVG, from the shared contour print. */
function valleySvg() {
  const art = valleyContourArt({ cols: 150, thinTo: 1.6, minChars: 0 });
  let paths = "";
  art.levels.forEach((l, k) => {
    const accent = k === art.accent;
    paths += `<path d="${l.d}" fill="none" stroke="${accent ? NIGHT.hydro : NIGHT.ink3}" stroke-width="${accent ? 2.2 : 1}" opacity="${accent ? 1 : (0.22 + k * 0.03).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
  });
  for (const m of art.markers) {
    paths += `<circle cx="${m.x}" cy="${m.y}" r="9" fill="${NIGHT.hydro}" opacity=".18"/><circle cx="${m.x}" cy="${m.y}" r="3.6" fill="${NIGHT.hydro}"/><text x="${m.x + 12}" y="${m.y + 4}" font-family="JetBrains Mono" font-size="11" letter-spacing="1.4" fill="${NIGHT.ink2}">${m.label.toUpperCase()}</text>`;
  }
  return `<svg viewBox="0 0 ${art.width} ${art.height}" width="760" height="${Math.round((760 * art.height) / art.width)}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
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
