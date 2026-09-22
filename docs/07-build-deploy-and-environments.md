# 07 — Build, Deploy & Environments

**Owner:** Kaustuv · **Support:** Abhigyan

**Status:** ✅ **Implemented** — two build targets, both verified passing. CI
deploys the static target to GitHub Pages. ❌ There is no CI for the server
target, and no hosted server deployment.

> **On the `Revamped-FE` branch (front-end only, no Keycloak) there is one
> target, not two.** `next.config.ts` is always `output: "export"` with
> `trailingSlash: true`; there is no `NEXT_STATIC_EXPORT` switch, no auth
> route handler and no middleware. `.github/workflows/deploy.yml` runs on
> push to `main` and on manual dispatch: it reads the Pages base path with
> `actions/configure-pages` (so `/redesigned-portal` for the project site, `""`
> for a custom domain on this repository), typechecks, lints, builds, checks
> the docs export (`npm run docs:check`) and uploads `out/`.
> `.github/workflows/verify.yml` runs the same steps without deploying on
> every other branch and on pull requests. The repository's Pages source must
> be set to *GitHub Actions*. Section 5 describes these workflows; the other
> tables describe the Keycloak branch.

---

## 1. Two build targets

A single codebase produces two materially different artefacts.

| | **Server build** (default) | **Static build** (`NEXT_STATIC_EXPORT=true`) |
|---|---|---|
| Command | `npm run build` | `NEXT_STATIC_EXPORT=true npm run build` |
| Output | `.next/` | `out/` |
| `next.config.output` | unset | `"export"` |
| `/api/auth/*` | ✅ present, dynamic | ❌ excluded |
| `middleware.ts` | ✅ enforced (88.3 kB) | ⚠️ compiled but **not executed** |
| Authentication | Keycloak or mock — real sessions | Baked-in demo session |
| Route protection | Enforced | None |
| Consumed by | `npm run dev`, any hosted deployment | `.github/workflows/deploy.yml` → GitHub Pages |

### 1.1 Why the split exists

The marketing site deploys to GitHub Pages, which serves static files only.
`output: "export"` refuses to build a dynamic route handler:

```
Error: export const dynamic = "force-static"/export const revalidate not configured
on route "/api/auth/[...nextauth]" with "output: export".
Build error occurred
[Error: Failed to collect page data for /api/auth/[...nextauth]]
```

This was reproduced on this repository before the fix landed. Three options were
considered:

| Option | Rejected because |
|---|---|
| Add `export const dynamic = "force-static"` | The NextAuth handler is inherently dynamic; a static handler is meaningless |
| Maintain a second branch or a build-time file swap | Two sources of truth for the same handler |
| **Exclude the file from the static build via `pageExtensions`** | ✅ chosen — one source of truth, zero conditionals in the handler |

### 1.2 The `route.node.ts` mechanism

```ts
// next.config.ts
const staticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const } : {}),

  pageExtensions: staticExport
    ? ["tsx", "ts", "jsx", "js"]
    : ["node.ts", "tsx", "ts", "jsx", "js"],

  env: {
    NEXT_PUBLIC_STATIC_DEMO: staticExport ? "true" : "",
  },
  // …
};
```

The handler is named **`app/api/auth/[...nextauth]/route.node.ts`**.

Next.js treats a file as a route only when its extension appears in
`pageExtensions`. `node.ts` is listed for server builds only, so:

- **Server build** — `node.ts` is a recognised extension, the file resolves as
  `route`, and the handler is registered.
- **Static build** — `node.ts` is not listed. The file is not a route. It also
  does not match plain `ts`, because the resulting route name would be
  `route.node`, not `route`.

No stub handler, no conditional `export const dynamic`, no duplicated source.

### 1.3 Static-demo session

With no server there is no `/api/auth/session` to fetch. `<SessionProvider>` would
hang in `loading` forever against a 404. So a session is seeded at build time:

```ts
// lib/auth.ts
export const MOCK_SESSION: Session = {
  user: { ...MOCK_USER, image: null },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
};
```

```tsx
// components/layout/auth-provider.tsx
<SessionProvider
  session={staticDemo ? demoSession : undefined}
  refetchOnWindowFocus={!staticDemo}
  refetchInterval={0}
>
```

Passing `session` seeds the provider **and suppresses the initial fetch** — exactly
what an endpoint-less deployment needs. In the static build the auth modal
navigates instead of signing in:

```tsx
if (staticDemo) {
  router.push(callbackPath);
  return;
}
```

and the modal footer reads `static preview · sample data`, so nobody mistakes the
demo for an authenticated console.

### 1.4 ⚠ Middleware is compiled but inert in the static build

The static build output still reports `ƒ Middleware 88.3 kB`. **A static export
does not execute middleware.** Route protection is absent from the GitHub Pages
deployment by construction — every `/portal` page is publicly readable there, which
is acceptable only because the data is a deterministic fixture, not a tenant's.

**This must never change without re-evaluating the deployment.** If the static
build were ever pointed at real data, it would publish it.

---

## 2. Verification record

Both targets built cleanly from a clean `.next`.

### Server build

```
✓ Compiled successfully
Route (app)                                 Size  First Load JS
┌ ○ /                                    20.6 kB         135 kB
├ ƒ /api/auth/[...nextauth]                  0 B            0 B
├ ○ /portal                               1.5 kB         116 kB
├ ● /portal/pods/[id]                    1.39 kB         175 kB
…
+ First Load JS shared by all             103 kB
ƒ Middleware                             88.3 kB
```

`/api/auth/[...nextauth]` is `ƒ (Dynamic)`; middleware present; 38 static pages
generated (24 routes, expanded by `generateStaticParams`).

### Static build

```
✓ Compiled successfully
…same route table, minus /api/auth/[...nextauth]
```

```bash
$ ls out/api
ls: cannot access 'out/api': No such file or directory
```

### Lint

```bash
$ npm run lint
> eslint .
# clean
```

---

## 3. ⚠ Open defect — portal routes are prerendered as static

Both build outputs mark every `/portal` route `○ (Static)`. The repository README
states the invariant explicitly:

> The build output is itself a check: every `(marketing)` route must be
> `○ (Static)` and every `/portal` route must be `ƒ (Dynamic)`. **A portal route
> appearing as static means one account's data is being baked into the HTML.**

The invariant is currently violated. No route in `app/` exports `dynamic` or
`revalidate`:

```bash
$ grep -rn "export const dynamic\|export const revalidate" app/
# (no matches)
```

`app/(portal)/portal/pods/[id]/page.tsx` additionally hard-codes six pod IDs in
`generateStaticParams()`.

**Impact today:** none. The mock is deterministic, so a build-time render and a
request-time render produce identical output.

**Impact the moment `NEXT_PUBLIC_API_MODE=http` is used:** every console page
serves build-time data to every tenant.

**Required fix, before any backend work ships:**

```ts
// app/(portal)/portal/layout.tsx
export const dynamic = "force-dynamic";
```

…and delete `generateStaticParams()` from the pod detail route. Tracked in
[10](10-implementation-status.md).

---

## 4. Environment matrix

| Variable | Server build | Static build | Purpose |
|---|---|---|---|
| `KEYCLOAK_ISSUER` | Selects Keycloak mode | Ignored (no server) | Must include the realm path |
| `KEYCLOAK_CLIENT_ID` | Default `corevalley-portal` | — | |
| `KEYCLOAK_CLIENT_SECRET` | Required in Keycloak mode | — | Confidential client |
| `AUTH_SECRET` | Required in Keycloak mode | — | Signs/encrypts the session JWT |
| `NEXTAUTH_URL` | Optional | — | Override when the inferred origin is wrong |
| `NEXT_PUBLIC_API_MODE` | `mock` (default) or `http` | Same | Inlined at build; selects the data client |
| `NEXT_PUBLIC_API_BASE_URL` | Read by `http.ts` (unused today) | Same | Future control-plane base URL |
| `NEXT_STATIC_EXPORT` | Unset | `true` | Selects the build target |
| `NEXT_PUBLIC_BASE_PATH` | `""` | `/<repo>` in CI | Subpath deployments |
| `NEXT_PUBLIC_STATIC_DEMO` | Set by `next.config.ts` | Set by `next.config.ts` | **Derived — never set by hand** |

### Environment profiles

| Profile | `KEYCLOAK_ISSUER` | `NEXT_PUBLIC_API_MODE` | `NEXT_STATIC_EXPORT` | Auth behaviour |
|---|---|---|---|---|
| Local, no Docker | unset | unset (mock) | unset | Mock provider — one click signs in as `admin` |
| Local, beta testing | `http://localhost:8080/realms/corevalley` | unset (mock) | unset | Real OIDC |
| Backend integration | set | `http` | unset | Real OIDC + real API (throws today) |
| GitHub Pages | — | unset (mock) | `true` | Baked demo session, no protection |

### `.env` handling

`.env.example` is committed. `.env.local` is gitignored via `.env*.local`:

```bash
$ git check-ignore -v .env.local
.gitignore:20:.env*.local     .env.local
```

⚠ **`.env.example` contains a real, working client secret**
(`corevalley-portal-dev-secret`) because it matches the committed realm export.
This is intentional for local development and is a production hazard — see
[09](09-security-and-compliance.md).

---

## 5. CI/CD

Two workflows, both Node-only: the documentation is rendered from
`corevalley-docs/docs/*.md` by Next.js at build time, so MkDocs and Python
are not installed in CI.

### 5.1 `deploy.yml` — GitHub Pages

Runs on push to `main` (ignoring paths the site does not ship from: the
internal `docs/`, `reference/`, `design_system/`, `files/`, the agent
folders, `README.md` and root notes) and on manual dispatch from any branch.

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main], paths-ignore: ["docs/**", "reference/**", "design_system/**", "files/**", "..."] }
  workflow_dispatch:

permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 24, cache: npm }
      - id: pages                        # base path from the Pages settings
        uses: actions/configure-pages@v5
        continue-on-error: true
        with: { enablement: true }
      - id: basepath                     # falls back to /<repo> ONLY if the
        run: ...                         # step above failed ("" is valid)
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
        env: { NEXT_PUBLIC_BASE_PATH: "${{ steps.basepath.outputs.value }}" }
      - run: npm run docs:check          # every nav page exported, links prefixed
        env: { NEXT_PUBLIC_BASE_PATH: "${{ steps.basepath.outputs.value }}" }
      - uses: actions/upload-pages-artifact@v4
        with: { path: ./out }

  deploy:
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Base path.** `actions/configure-pages` derives it from the Pages URL:
`/redesigned-portal` for this project site (the organisation site owns the
`corevalley.ai` domain, so the project is served at
`corevalley.ai/redesigned-portal/`), and `""` if a custom domain is ever
attached to this repository. The fallback to the repository name applies only
when that step *fails*. An expression such as `base_path || '/<repo>'` would
treat the valid empty value as missing and break every link on a
custom-domain site, which is why the workflow tests the step outcome instead.

### 5.2 `verify.yml` — branches and pull requests

Runs on push to every branch except `main` and on pull requests targeting
`main`: `npm ci`, typecheck, lint, `npm run build` with
`NEXT_PUBLIC_BASE_PATH=/redesigned-portal`, `npm run docs:check`, then uploads
`out/` as a workflow artifact (`static-export-<sha>`, kept 7 days) for
preview. Nothing is deployed.

### 5.3 `npm run docs:check` (`scripts/check-docs-export.mjs`)

Reads the `nav` in `corevalley-docs/mkdocs.yml`, asserts each entry exported
to `out/docs/<slug>/index.html`, and asserts the docs landing page links
under `NEXT_PUBLIC_BASE_PATH`. Exits 1 on a missing page, a missing export or
a base-path mismatch. Locally:

```bash
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/redesigned-portal npm run build
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/redesigned-portal npm run docs:check
```

### ❌ Remaining CI gaps

| Missing | Consequence |
|---|---|
| No tests | There is no test suite to run |
| No preview deployments | Branch builds are downloadable artifacts, not URLs |
| No `NEXT_PUBLIC_API_MODE=http` build | Interface drift between `mock.ts` and `http.ts` is caught only locally |

---

## 6. Local development

```bash
npm install
npm run keycloak:up          # Keycloak + Postgres, realm auto-imported
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

### Script inventory

| Script | Command |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit` |
| `docs:check` | `node scripts/check-docs-export.mjs` |
| `generate:basemap` | `node scripts/generate-basemap.mjs` |
| `keycloak:up` | `docker compose up -d` |
| `keycloak:down` | `docker compose down` |
| `keycloak:reset` | `docker compose down -v && docker compose up -d` |
| `keycloak:logs` | `docker compose logs -f keycloak` |

### ⚠ The split-brain `.next` hazard

> **Never run `npm run build` while a dev or production server is running.** Both
> write to `.next`, producing a split-brain build that fails at runtime with
> `Cannot find module './NNN.js'`.

A second, subtler form of this bug is specific to the dual-target split: **a
static-export `.next` reused by the dev server**. The static build never emitted
the auth route, so the dev server 404s on `/api/auth/*` and every `useSession()`
call fails:

```
Error: ENOENT: no such file or directory, open
'…\.next\server\app\api\auth\[...nextauth]\route.js'
```

Recovery in both cases: `rm -rf .next` and restart.

### Port collisions

`next dev` falls forward when 3000 is taken (`Port 3000 is in use…, using
available port 3002 instead`). Two consequences:

1. `NEXTAUTH_URL` and the Keycloak redirect URIs will no longer match, so sign-in
   fails on the fallback port.
2. Stopping the npm wrapper does not always stop the child `next` process. Verify
   with `Get-NetTCPConnection -State Listen -LocalPort 3000` (Windows) or
   `lsof -i :3000` (Unix) before assuming the port is free.

---

## 7. Runtime configuration in `next.config.ts`

Beyond the build-target switch:

```ts
reactStrictMode: true,
poweredByHeader: false,
images: { unoptimized: true },
basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

// Keep the design-system skill folder and the archived static site out of
// the serverless bundle and the build's file trace.
outputFileTracingExcludes: {
  "*": ["./design_system/**", "./reference/**"],
},

async headers() {
  return [{
    // Brand asset filenames are version-suffixed, so immutable is safe.
    source: "/brand/:path*",
    headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
  }];
},
```

⚠ `headers()` is **ignored** in the static export — Next.js warns about this
during the Pages build. Cache headers for `/brand/*` on GitHub Pages must be set
by the host, and are not.

---

## 8. Deployment targets

| Target | Status | Notes |
|---|---|---|
| GitHub Pages | ✅ Live | Static export, demo session, no route protection |
| Node server (`npm start`) | ⚠️ Works locally, not deployed | Requires `AUTH_SECRET`, `KEYCLOAK_*`, a reachable Keycloak, and a reverse proxy |
| Container image | ❌ None | No `Dockerfile` for the Next.js app. `docker-compose.yml` covers Keycloak only. |
| Kubernetes manifests | ❌ None | |

### Before the first server deployment

1. Add `force-dynamic` to the portal layout (§3).
2. Generate a per-environment `AUTH_SECRET`.
3. Rotate the client secret; remove it from `.env.example`.
4. Replace `start-dev` with `start`, set `KC_HOSTNAME` and
   `KC_HOSTNAME_STRICT=true`, set realm `sslRequired` to `external`.
5. Replace the `http://localhost:3000/*` redirect wildcard with the two explicit
   callback URLs.
6. Confirm `KEYCLOAK_ISSUER` is set. **Unset, the app signs everyone in as an
   admin** — see [09](09-security-and-compliance.md).
7. Add a health endpoint for the load balancer; `/` is currently the only probe.
