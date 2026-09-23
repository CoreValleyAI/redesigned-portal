/**
 * Theme (dark / light) — the one place that knows how the theme is stored,
 * applied and read back.
 *
 * The theme is a `data-theme` attribute on <html>; app/theme.css keys every
 * token override on it, so switching is a single attribute write and no
 * component needs to know which theme is on. The attribute is stamped before
 * first paint by THEME_BOOTSTRAP (inlined by app/layout.tsx), so there is no
 * flash of the wrong theme; the root element carries suppressHydrationWarning
 * for the same reason.
 *
 * Resolution order: the visitor's saved choice, else light. Light is the
 * default by decision; the OS preference is not consulted, so first-time
 * visitors on a dark OS still see the light site until they press the toggle.
 */
import * as React from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "cv-theme";

/** The browser-chrome colour per theme: --bg-base from each token set. */
export const THEME_COLOR: Record<Theme, string> = {
  dark: "#05080D",
  light: "#F3F5F7",
};

/* Inlined as the first child of <body>. Dependency-free ES5 so it runs
   anywhere, and wrapped in try/catch because localStorage throws in some
   private modes. */
export const THEME_BOOTSTRAP =
  `(function(){var d=document.documentElement,t="light";` +
  `try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");` +
  `if(s==="light"||s==="dark")t=s}catch(e){}` +
  `d.setAttribute("data-theme",t);` +
  `var m=document.querySelector('meta[name="theme-color"]');` +
  `if(m)m.setAttribute("content",t==="light"?"${THEME_COLOR.light}":"${THEME_COLOR.dark}")})();`;

const isTheme = (v: unknown): v is Theme => v === "dark" || v === "light";

/** The theme currently on <html>. "light" on the server and before bootstrap. */
export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.getAttribute("data-theme");
  return isTheme(t) ? t : "light";
}

export function applyTheme(theme: Theme, persist = true): void {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLOR[theme]);
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* private mode, quota — the choice just does not persist */
    }
  }
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/**
 * Fires whenever <html data-theme> changes, from any source — the toggle,
 * another tab, devtools. Canvases use it to repaint; useTheme() is built on
 * it. Returns the unsubscribe.
 */
export function subscribeTheme(listener: (theme: Theme) => void): () => void {
  if (typeof MutationObserver === "undefined") return () => {};
  const observer = new MutationObserver(() => listener(readTheme()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/** The live theme, for client components. Hydrates as "light", like the server. */
export function useTheme(): Theme {
  return React.useSyncExternalStore(subscribeTheme, readTheme, () => "light");
}

/* ── Canvas palette ────────────────────────────────────────────────────────
   The painted graphics (canvas 2D and WebGL) cannot read CSS custom
   properties per pixel, so they take their colours from here. The values
   mirror app/theme.css: on Carbon the marks are light and ADD light to the
   ground; on paper they are dark and SUBTRACT from it — so light mode also
   flips the blend model, not just the colours. */

export type Vec3 = readonly [number, number, number];

export interface CanvasPalette {
  /** True when marks must darken the ground rather than light it. */
  subtractive: boolean;
  /** "r, g, b" triplets for canvas 2D `rgba(${x}, a)` strings. */
  hydro: string;
  hot: string;
  ink: string;
  info: string;
  danger: string;
  /** Solid chip / device body. */
  surface: string;
  /** 0–1 vectors for WebGL uniforms. The ground is the page background. In
      light mode hydroVec / hotVec are the amount subtracted from the ground
      to land on the target green, so the same shaders serve both themes. */
  ground: Vec3;
  hydroVec: Vec3;
  hotVec: Vec3;
  /** The accent as an actual colour, for a transparent canvas that composites
      normally (source-over) rather than against an opaque ground. */
  hydroPlain: Vec3;
  /** Contrast lift for the terrain dots: light on Carbon reads at 1; the same
      light subtracted from paper reads pale, so it is multiplied (and clamped
      in the shader) until the range stands out. */
  gain: number;
  /** Extra weight on the terrain's river of light: 1 on Carbon; on paper the
      river is the one feature that should read as strongly as it does in the
      dark, so it gets more than the general gain. */
  riverGain: number;
  /** How strongly the pointer lights the terrain dots (the swell itself is
      always on). Low on paper, where extra ink under the cursor reads as a
      shadow. */
  mouseLight: number;
  /** Peak tint for the terrain's two-tone ridges, as a WebGL vector (same
      convention as hydroVec: subtracted from the ground on paper). */
  tealVec: Vec3;
  /** The terrain river's own colour (water), same vector convention. */
  riverVec: Vec3;
  /** Terrain dot boldness: base disc radius in a grid cell (0.5 = touching). */
  dot: number;
  /** Solid tint across the terrain faces, giving the ranges mass. */
  fill: number;
}

const v = (r: number, g: number, b: number): Vec3 => [r / 255, g / 255, b / 255];
const sub = (ground: Vec3, target: Vec3): Vec3 => [
  ground[0] - target[0],
  ground[1] - target[1],
  ground[2] - target[2],
];

const PAPER = v(243, 245, 247); //  --bg-base, light

export const CANVAS_PALETTES: Record<Theme, CanvasPalette> = {
  dark: {
    subtractive: false,
    hydro: "74, 222, 128", //  --hydro
    hot: "167, 243, 203", //   --hydro-200
    ink: "232, 236, 239", //   --ink
    info: "56, 189, 248", //   --info
    danger: "248, 113, 113", // --danger
    surface: "17, 22, 31", //  --carbon-600
    ground: v(5, 8, 13), //    --carbon-900
    hydroVec: v(74, 222, 128),
    hotVec: v(167, 243, 203),
    riverVec: v(103, 232, 249), // cyan-300
    dot: 0.15,
    fill: 0.08,
    hydroPlain: v(74, 222, 128),
    gain: 1,
    riverGain: 1.3,
    mouseLight: 1,
    tealVec: v(45, 212, 191), // teal-400
  },
  light: {
    subtractive: true,
    hydro: "21, 128, 61", //   --hydro (light)
    hot: "20, 83, 45", //      --hydro-200 (light)
    ink: "11, 15, 23", //      --ink-100 (light)
    info: "3, 105, 161", //    --info (light)
    danger: "220, 38, 38", //  --danger (light)
    surface: "255, 255, 255", // --carbon-600 (light)
    ground: PAPER,
    // Terrain on paper: emerald faces, teal peaks, deep-emerald crests and a
    // cyan river — richer than the UI green, which is tuned for text.
    hydroVec: sub(PAPER, v(5, 150, 105)), // emerald-600
    hotVec: sub(PAPER, v(6, 78, 59)), //     emerald-900
    riverVec: sub(PAPER, v(8, 145, 178)), // cyan-600
    dot: 0.2,
    fill: 0.1,
    hydroPlain: v(21, 128, 61),
    gain: 3.4,
    riverGain: 3,
    mouseLight: 0.5,
    tealVec: sub(PAPER, v(15, 118, 110)), // teal-700
  },
};

/** The palette for the theme currently on <html>. Cheap: call it per frame. */
export function canvasPalette(): CanvasPalette {
  return CANVAS_PALETTES[readTheme()];
}
