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

## Status (2026-09-22)

`/docs` is a Next.js route again (`app/(marketing)/docs/`), now rendered from
the Markdown in `corevalley-docs/docs/` instead of a TypeScript content map,
and the MkDocs build no longer ships. The design-system shell below (sidebar,
article header, tables, `Terminal` blocks, closing card) was the model for the
new one, so this archive is for mining content only — there is nothing left
to restore.
