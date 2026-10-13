// Accessibility audit (docs/revamp/10): axe-core in headless Chrome over
// the DevTools protocol, every listed page in both themes, with reduced
// motion so nothing is caught mid-animation. Exits 1 on any violation.
//
//   node scripts/audit-a11y.mjs --base http://127.0.0.1:4173/base [--wait 3000] [path ...]
//
// With no paths, it audits the main pages plus the first blog post and the
// first job found in out/ (CI builds with sample content). Chrome comes from
// CHROME_PATH or the usual install locations.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return fallback;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const base = opt("base", "http://127.0.0.1:4173").replace(/\/$/, "");
const wait = Number(opt("wait", "3000"));

const MAIN = [
  "/",
  "/products/",
  "/products/mig-slicing/",
  "/hardware/",
  "/infrastructure/",
  "/platform/",
  "/pricing/",
  "/use-cases/",
  "/company/",
  "/trust/",
  "/contact/",
  "/blog/",
  "/jobs/",
  "/legal/privacy/",
  "/legal/terms/",
  "/legal/data-residency/",
  "/this-page-does-not-exist/",
];
const firstIn = (dir) => {
  const d = join(process.cwd(), "out", dir);
  if (!existsSync(d)) return [];
  const sub = readdirSync(d, { withFileTypes: true }).find(
    (e) =>
      e.isDirectory() &&
      !["page", "category", "tag", "author", "general"].includes(e.name) &&
      existsSync(join(d, e.name, "index.html")),
  );
  return sub ? [`/${dir}/${sub.name}/`] : [];
};
const pages = args.length ? args : [...MAIN, ...firstIn("blog"), ...firstIn("jobs")];

const CHROMES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const chrome = CHROMES.find((p) => existsSync(p));
if (!chrome) throw new Error("Chrome not found; set CHROME_PATH");
const AXE = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--no-sandbox",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    "--window-size=1280,900",
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "a11y-"))}`,
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let failures = 0;
try {
  for (let i = 0; i < 200; i++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break;
    } catch {}
    await sleep(150);
  }
  for (const theme of ["light", "dark"]) {
    for (const page of pages) {
      const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((r) => (ws.onopen = r));
      let id = 0;
      const pending = new Map();
      ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        const p = msg.id && pending.get(msg.id);
        if (!p) return;
        pending.delete(msg.id);
        msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result);
      };
      const send = (method, params = {}) =>
        new Promise((res, rej) => {
          const i = ++id;
          pending.set(i, { res, rej });
          ws.send(JSON.stringify({ id: i, method, params }));
        });
      const ev = async (expression) =>
        (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
      await send("Page.enable");
      await send("Page.addScriptToEvaluateOnNewDocument", {
        source: `try{localStorage.setItem("cv-theme",${JSON.stringify(theme)});localStorage.setItem("cv-motion","reduce")}catch(e){}`,
      });
      await send("Page.navigate", { url: base + page });
      await sleep(wait);
      await ev(AXE);
      const violations = await ev(
        `axe.run({ exclude: [["nextjs-portal"]] }, { resultTypes: ["violations"] }).then((r) => r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ") + " :: " + (n.failureSummary || "").split("\\n").slice(1, 2).join("").trim()) })))`,
      );
      if (violations?.length) {
        failures += violations.length;
        console.log(`✗ ${theme} ${page}`);
        for (const v of violations) {
          console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
          for (const n of v.nodes.slice(0, 5)) console.log(`      - ${n}`);
        }
      } else console.log(`✓ ${theme} ${page}`);
      ws.close();
    }
  }
} finally {
  proc.kill();
}
console.log(failures ? `\n${failures} violation(s).` : "\nNo violations.");
process.exit(failures ? 1 : 0);
