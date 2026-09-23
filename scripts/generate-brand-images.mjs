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

const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9337;

const brandmark = readFileSync(resolve("public/brand/cv-brandmark.svg"), "utf8");
const wordmarkWhite = readFileSync(resolve("public/brand/cv-wordmark-white.svg"), "utf8");
const combined = readFileSync(resolve("public/brand/cv-combinedmark-green.svg"), "utf8");

const CARBON = "#05080D";
const HYDRO = "#4ADE80";

const page = (body, w, h) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${CARBON};}
  body{font-family:Manrope,"Segoe UI",system-ui,-apple-system,sans-serif;color:#E8ECEF;-webkit-font-smoothing:antialiased;}
  svg{display:block}
</style></head><body>${body}</body></html>`;

/* Open Graph card: the mark, the name, one line of positioning, the domain. */
const og = page(
  `<div style="position:relative;width:1200px;height:630px;background:
      radial-gradient(60% 80% at 85% 20%, rgba(74,222,128,.14), transparent 60%),
      radial-gradient(circle at 1px 1px, rgba(232,236,239,.08) 1px, transparent 1.5px) 0 0/28px 28px,
      ${CARBON};">
    <div style="position:absolute;left:84px;top:92px;display:flex;align-items:center;gap:26px">
      <div style="width:104px">${brandmark.replace("<svg", '<svg width="104"')}</div>
      <div style="width:330px">${wordmarkWhite.replace("<svg", '<svg width="330"')}</div>
    </div>
    <div style="position:absolute;left:84px;top:270px;font-size:66px;font-weight:700;letter-spacing:-0.03em;line-height:1.05;max-width:900px">
      Nepal&rsquo;s sovereign<br>AI cloud.
    </div>
    <div style="position:absolute;left:84px;top:432px;font-size:27px;font-weight:300;color:#9AA2AD;max-width:820px;line-height:1.4">
      NVIDIA H100 and H200 compute in Kathmandu. Billed in NPR. Data that never leaves the country.
    </div>
    <div style="position:absolute;left:84px;bottom:56px;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:${HYDRO}">corevalley.ai</div>
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
