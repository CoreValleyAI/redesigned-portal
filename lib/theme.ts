/**
 * Visitor preferences: theme, motion and engineer mode.
 *
 * Each is an attribute on <html> that CSS keys on, so a change is a single
 * attribute write and no component has to know the current value:
 *
 *   data-theme     "light" | "dark"   Glacier or Night Valley (app/styles/tokens.css)
 *   data-motion    "full" | "reduce"  the OS setting, or the site's own toggle
 *   data-engineer  "on" | "off"       denser pages with raw specs (S15)
 *   data-js                           scripting is running (arms the reveal CSS)
 *
 * PREFERENCE_BOOTSTRAP stamps all four before first paint (inlined in the
 * <head> by app/layout.tsx), so there is never a flash of the wrong theme or
 * of content that is about to animate. A saved choice wins; otherwise the
 * site is dark by default. Choices are stored in localStorage on this device only (the
 * privacy page says so).
 */
import * as React from "react";

export type Theme = "light" | "dark";
export type MotionPref = "full" | "reduce";

export const STORAGE = {
  theme: "cv-theme",
  motion: "cv-motion",
  engineer: "cv-engineer",
} as const;

/** The browser chrome colour per theme: --bg of each palette. */
export const THEME_COLOR: Record<Theme, string> = {
  light: "#F8FAFD",
  dark: "#0A0F14",
};

/* Dependency-free ES5, wrapped in try/catch because storage throws in some
   private modes. Keep it short: it blocks the first paint. */
export const PREFERENCE_BOOTSTRAP = `(function(){var d=document.documentElement,t=null,m=null,e=null;try{t=localStorage.getItem("${STORAGE.theme}");m=localStorage.getItem("${STORAGE.motion}");e=localStorage.getItem("${STORAGE.engineer}")}catch(x){}function q(s){return!!(window.matchMedia&&matchMedia(s).matches)}if(t!=="light"&&t!=="dark")t="dark";if(m!=="full"&&m!=="reduce")m=q("(prefers-reduced-motion: reduce)")?"reduce":"full";d.setAttribute("data-theme",t);d.setAttribute("data-motion",m);d.setAttribute("data-engineer",e==="on"?"on":"off");d.setAttribute("data-js","")})();`;

/** Kept for the docs layout, which shares the bootstrap. */
export const THEME_BOOTSTRAP = PREFERENCE_BOOTSTRAP;

/* ── Reading and writing ────────────────────────────────────────────────── */

const html = () => document.documentElement;

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* Private mode: the choice lasts for this page view only. */
  }
}

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return html().dataset.theme === "dark" ? "dark" : "light";
}

export function readMotion(): MotionPref {
  if (typeof document === "undefined") return "full";
  return html().dataset.motion === "reduce" ? "reduce" : "full";
}

export function readEngineer(): boolean {
  if (typeof document === "undefined") return false;
  return html().dataset.engineer === "on";
}

function syncThemeColor(theme: Theme) {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_COLOR[theme];
    meta.removeAttribute("media");
  }
}

/**
 * Switch the theme. With an origin (the toggle's centre) and motion allowed,
 * the new theme spreads from that point as a circle (a view transition);
 * otherwise it changes on the next frame.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const apply = () => {
    html().dataset.theme = theme;
    syncThemeColor(theme);
  };
  store(STORAGE.theme, theme);

  const canAnimate = origin && readMotion() === "full" && typeof document.startViewTransition === "function";
  if (!canAnimate) {
    apply();
    return;
  }

  const root = html();
  const r = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  root.style.setProperty("--vt-x", `${origin.x}px`);
  root.style.setProperty("--vt-y", `${origin.y}px`);
  root.style.setProperty("--vt-r", `${Math.ceil(r)}px`);
  root.dataset.vt = "theme";
  const vt = document.startViewTransition(apply);
  vt.finished.finally(() => {
    delete root.dataset.vt;
  });
}

/** Forget the saved theme and go back to the default (dark). */
export function followSystemTheme() {
  store(STORAGE.theme, null);
  html().dataset.theme = "dark";
  syncThemeColor("dark");
}

export function setMotion(pref: MotionPref) {
  store(STORAGE.motion, pref);
  html().dataset.motion = pref;
}

export function setEngineer(on: boolean) {
  store(STORAGE.engineer, on ? "on" : null);
  html().dataset.engineer = on ? "on" : "off";
}

/** True if the visitor saved a theme (rather than following the OS). */
export function hasSavedTheme(): boolean {
  try {
    const v = localStorage.getItem(STORAGE.theme);
    return v === "light" || v === "dark";
  } catch {
    return false;
  }
}

/* ── Subscribing (React and non-React) ─────────────────────────────────── */

type Listener = () => void;
const listeners = new Set<Listener>();
let observer: MutationObserver | null = null;

/** Called whenever theme, motion or engineer mode changes on <html>. */
export function subscribePrefs(listener: Listener): () => void {
  listeners.add(listener);
  if (!observer && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver(() => listeners.forEach((l) => l()));
    observer.observe(html(), {
      attributes: true,
      attributeFilter: ["data-theme", "data-motion", "data-engineer"],
    });
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}

export function useTheme(): Theme {
  return React.useSyncExternalStore(subscribePrefs, readTheme, () => "light");
}

export function useMotionPref(): MotionPref {
  return React.useSyncExternalStore(subscribePrefs, readMotion, () => "full");
}

export function useEngineer(): boolean {
  return React.useSyncExternalStore(subscribePrefs, readEngineer, () => false);
}

/* ── Palette for WebGL ──────────────────────────────────────────────────── */

export type RGB = readonly [number, number, number];

/** The colours the WebGL scenes draw with, as linear-light RGB floats. */
export interface GLPalette {
  theme: Theme;
  bg: RGB;
  ink: RGB;
  ink3: RGB;
  hydro: RGB;
  dotOff: RGB;
  glow2: RGB;
  glow3: RGB;
}

/**
 * Read the current palette from the CSS tokens, so the 3D world and the
 * page are always the same colours. Tokens are written as `oklch(L C H)`
 * in app/styles/tokens.css; this converts them to linear sRGB.
 */
export function readPalette(): GLPalette {
  const cs = getComputedStyle(html());
  const get = (name: string, fallback: RGB): RGB => parseColor(cs.getPropertyValue(name)) ?? fallback;
  return {
    theme: readTheme(),
    bg: get("--bg", [0.01, 0.012, 0.02]),
    ink: get("--ink", [0.9, 0.9, 0.9]),
    ink3: get("--ink-3", [0.3, 0.3, 0.3]),
    hydro: get("--hydro", [0.1, 0.8, 0.25]),
    dotOff: get("--dot-off", [0.05, 0.06, 0.08]),
    glow2: get("--glow-2", [0.2, 0.7, 0.8]),
    glow3: get("--glow-3", [0.3, 0.2, 0.8]),
  };
}

/**
 * Parse a CSS colour into linear sRGB. The tokens are written as oklch(),
 * but the CSS build may hand them back in another syntax (Lightning CSS
 * rewrites oklch() as lab()), so anything other than oklch() is resolved by
 * the browser itself, through a 1 px canvas.
 */
export function parseColor(value: string): RGB | null {
  const v = value.trim();
  if (!v) return null;
  return parseOklch(v) ?? canvasColor(v);
}

let probe: CanvasRenderingContext2D | null | undefined;
function canvasColor(value: string): RGB | null {
  if (typeof document === "undefined") return null;
  if (probe === undefined) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  if (!probe) return null;
  const sentinel = "#010203";
  probe.fillStyle = sentinel;
  probe.fillStyle = value; // an unknown colour leaves the sentinel in place
  if (probe.fillStyle === sentinel) return null;
  probe.clearRect(0, 0, 1, 1);
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return [lin(r), lin(g), lin(b)];
}

/** Parse `oklch(L C H [/ A])` into linear sRGB (clamped to the gamut). */
export function parseOklch(value: string): RGB | null {
  const m = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i.exec(value);
  if (!m) return null;
  let L = Number(m[1]);
  if (value.includes("%") && L > 1) L /= 100;
  return oklchToLinearSrgb(L, Number(m[2]), Number(m[3]));
}

/**
 * Gamma-encode a linear colour. The canvas stores sRGB, so a scene that
 * must match a token exactly on screen (a logo, a UI colour) writes the
 * encoded value; scenes lit in linear light write the palette as is.
 */
export function encodeSrgb(c: RGB): RGB {
  const e = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  return [e(c[0]), e(c[1]), e(c[2])];
}

export function oklchToLinearSrgb(L: number, C: number, H: number): RGB {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
