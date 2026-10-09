import type { NextConfig } from "next";

/* Two sites from one codebase. NEXT_PUBLIC_BUILD_TARGET=docs builds the
   documentation site for docs.corevalley.ai: only the `*.docs.tsx` /
   `*.docs.ts` files in app/ are routes (layout.docs.tsx, page.docs.tsx…), so
   the docs sit at the root and none of the marketing pages are exported. The
   default build ignores those files, since `page.docs.tsx` is not `page.tsx`. */
const docsBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === "docs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  pageExtensions: docsBuild ? ["docs.tsx", "docs.ts"] : ["tsx", "ts"],

  // Static export for GitHub Pages (output to /out).
  output: "export",
  images: {
    unoptimized: true,
  },

  // GitHub Pages serves a project site from /<repo>; the deploy workflow
  // reads the exact base path from the Pages configuration (so a custom
  // domain or a user site gets "") and passes it in. Components that build
  // asset URLs by hand read the same variable.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Every route exports as <route>/index.html, which any static host —
  // Pages included — serves for /<route>/ without needing an extensionless
  // .html fallback.
  trailingSlash: true,

  // A separate build directory when asked for, so a production build can
  // run beside a live `next dev` without corrupting its cache. Note that
  // with a custom distDir the static export lands INSIDE it (not in /out);
  // the deploy workflow leaves it unset and uploads /out.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Keep the design-system skill folder and the archived static site out of
  // the serverless bundle and the build's file trace.
  outputFileTracingExcludes: {
    "*": ["./design_system/**", "./reference/**"],
  },

};

export default nextConfig;
