// A tiny static server for the export in out/, under the site's base path,
// the way GitHub Pages serves it: /base/path/ → out/path/index.html, and
// 404.html for anything missing. For audits in CI and local checks only.
//   node scripts/serve-out.mjs [port]
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const port = Number(process.argv[2] ?? 4173);
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const root = join(process.cwd(), "out");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

http
  .createServer((req, res) => {
    let path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    let status = 200;
    if (!existsSync(file)) {
      file = join(root, "404.html");
      status = 404;
    }
    res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => console.log(`serving out/ at http://127.0.0.1:${port}${base}/`));
