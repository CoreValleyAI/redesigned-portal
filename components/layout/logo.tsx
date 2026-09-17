/**
 * The official vector logo set. Never retype the wordmark as live text — the
 * brandbook forbids it, and the two-tone split is part of the mark.
 *
 * On Carbon the GREEN variants are the default (Hydro wordmark + gradient
 * brandmark), per design_system/readme.md. White is the mono alternative,
 * kept reachable under explicit `-white` names for the few places that need
 * it. The two-tone colour lockup (Slate `core` + Hydro `valley`) is for light
 * grounds and is not used on the site.
 *
 * Naming, as used across the codebase and by the brand team:
 *   brandmark    — the glyph alone
 *   wordmark     — the type alone
 *   combinedmark — glyph + type, locked up
 *
 * Intrinsic ratios are preserved: only height is set, width follows.
 */
import { cn } from "@/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* w/h are the assets' REAL viewBox dimensions, read out of the files:
     brandmark    "70 105 860 600"  → 860 x 600, landscape
     wordmark     "0 0 1000 180"    → 1000 x 180, a long horizontal strip
     combinedmark "0 0 1000 1000"   → SQUARE: the glyph stacked over the type

   <img> honours the width/height attributes it is given, so a wrong ratio
   here stretches the mark on every page. The combined lockup in particular
   is a stacked square, not a horizontal bar. */
const MARKS = {
  brandmark: { src: `${BASE}/brand/cv-brandmark.svg`, w: 860, h: 600 },
  wordmark: { src: `${BASE}/brand/cv-wordmark-green.svg`, w: 1000, h: 180 },
  combinedmark: { src: `${BASE}/brand/cv-combinedmark-green.svg`, w: 1000, h: 1000 },

  "brandmark-white": { src: `${BASE}/brand/cv-brandmark-white.svg`, w: 860, h: 600 },
  "wordmark-white": { src: `${BASE}/brand/cv-wordmark-white.svg`, w: 1000, h: 180 },
  "combinedmark-white": {
    src: `${BASE}/brand/cv-combinedmark-white.svg`,
    w: 1000,
    h: 1000,
  },
} as const;

export interface LogoProps {
  mark?: keyof typeof MARKS;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function Logo({
  mark = "combinedmark",
  height = 28,
  priority = false,
  className,
}: LogoProps) {
  const m = MARKS[mark];
  return (
    <img
      src={m.src}
      alt="CoreValley"
      width={Math.round((m.w / m.h) * height)}
      height={height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

/**
 * The horizontal lockup used in navigation and in the console sidebar.
 *
 * It composes the brandmark and the wordmark side by side rather than using
 * cv-combinedmark: that asset is a SQUARE, stacked lockup (glyph above type),
 * and a stacked lockup inside a 64px bar leaves the wordmark about four pixels
 * tall. The brand supplies the two marks separately precisely so a horizontal
 * bar can be set horizontally.
 *
 * `size` is the wordmark's cap height in px; the glyph is set to 1.55x that,
 * which is the optical match — a glyph at the same numeric height as lowercase
 * type reads as too small — and the gap scales with it so the lockup holds its
 * proportions at any size.
 */
export function LogoLockup({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center opacity-95 transition-opacity duration-normal ease-standard hover:opacity-100",
        className,
      )}
      style={{ gap: Math.round(size * 0.52) }}
    >
      <Logo mark="brandmark" height={Math.round(size * 1.55)} priority />
      <Logo mark="wordmark" height={Math.round(size * 0.78)} priority />
    </span>
  );
}
