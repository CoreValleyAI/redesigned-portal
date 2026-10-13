import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      // .next and side-by-side builds (NEXT_DIST_DIR=.next-ci).
      ".next*/**",
      "node_modules/**",
      "out/**",
      // The design system is a read-only upstream reference.
      // It ships plain .jsx with its own conventions we are not free to fix.
      "design_system/**",
      "reference/**",
      // Standalone design drafts, not part of the site.
      "drafts/**",
      // Valleys_3D is its own Vite app with its own toolchain.
      "Valleys_3D/**",
      "Kathmandu_Core/**",
      // Optional standalone MkDocs build output: vendored, minified JS.
      "corevalley-docs/site/**",
      "next-env.d.ts",
    ],
  },

  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Enforce the token boundary: app code consumes components and the
      // CSS custom properties, never the design system's internals.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/design_system/**"],
              message:
                "Do not import from design_system/. Use components/system/* or the CSS tokens.",
            },
          ],
        },
      ],
      // Logos and generated art are intentionally plain <img>: next/image
      // does nothing useful for SVG and the export is unoptimised anyway.
      "@next/next/no-img-element": "off",
    },
  },

  {
    // Components from the preview site that predate the React Compiler
    // rules. Each is rebuilt or rewritten in its revamp phase (see
    // docs/revamp/11); new code gets the rules at full strength.
    files: [
      "components/blog/**",
      "components/content/**",
      "components/docs/**",
      "components/jobs/**",
      "components/layout/**",
      "components/marketing/**",
      "components/portal/**",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },

  {
    // Composition layer only. components/ui/** is exempt: it legitimately
    // encodes design-system values as Tailwind arbitrary values.
    files: ["app/**/*.tsx", "components/marketing/**", "components/portal/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\b/]",
          message:
            "Raw hex colour - use a design-system token (bg-hydro, text-fg-muted, ...).",
        },
      ],
    },
  },
];

export default eslintConfig;
