/**
 * Light and dark. One source of truth for both layers of the page:
 *
 *  · The DOM reads `<html data-theme>`, stamped before first paint by the
 *    inline script in index.html, and every colour in index.css is a CSS
 *    variable keyed on it, so the interface flips in one style recalc.
 *  · The WebGL scene reads `themeTarget()` every frame and crossfades its
 *    shared uniforms toward it. Nothing is rebuilt and the GL context is
 *    never touched, so the switch is a glide, not a reload.
 */
import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
export const THEME_KEY = "valleys-theme";

const listeners = new Set<() => void>();

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* private mode: the choice lasts for this visit */
  }
  listeners.forEach((l) => l());
}

export const toggleTheme = () => setTheme(readTheme() === "dark" ? "light" : "dark");

/** 0 for dark, 1 for light: what the scene crossfades toward. */
export const themeTarget = () => (readTheme() === "light" ? 1 : 0);

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}
