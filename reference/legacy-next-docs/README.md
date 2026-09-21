# Legacy Next.js docs route (archived 2026-09-21)

This folder holds the original in-app documentation that used to live at
`app/(marketing)/docs/` and was served at `/docs`, `/docs/quickstart`,
`/docs/cli` and `/docs/api`. It was replaced by the MkDocs site in
`corevalley-docs/`, which now builds into `public/docs/` and is served at the
same `/docs/` path.

Nothing here is compiled, linted or type-checked (`reference/` is excluded in
`tsconfig.json`, `eslint.config.mjs` and `next.config.ts`). It is kept so the
content and the design-system shell can be restored or mined later.

## Contents

| File | What it was |
|---|---|
| `app-docs/layout.tsx` | Sticky sidebar shell with the docs nav groups |
| `app-docs/page.tsx` | `/docs` landing: three path cards, terminal demo, concepts |
| `app-docs/[...slug]/page.tsx` | Quickstart, CLI reference and API reference content (in a TS map, no MDX) |

## Restoring it

1. Move `app-docs/` back to `app/(marketing)/docs/`.
2. Drop `docs:build` from the `build` script in `package.json` and delete
   `public/docs/` so the static export has no conflicting `/docs` output.
3. Point the header, footer, homepage and 404 links back at `/docs/...`
   `Link`s instead of the `docsUrl()` helper in `lib/docs.ts`.
