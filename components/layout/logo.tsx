/**
 * The official vector logo set. Never retype the wordmark as live text — the
 * brandbook forbids it, and the two-tone split is part of the mark.
 *
 * On Carbon the GREEN variants are the default (Hydro wordmark + gradient
 * brandmark), per design_system/readme.md. White is the mono alternative,
 * kept reachable under explicit `-white` names.
 *
 * Naming, as used across the codebase and by the brand team:
 *   brandmark    — the glyph alone
 *   wordmark     — the type alone
 *   combinedmark — glyph + type, locked up (a stacked square)
 */
import { cn } from "@/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* w/h are the assets' REAL viewBox dimensions; `ink` is the bounding box of
   the actual glyphs inside that viewBox, measured with getBBox():

     brandmark    viewBox 70 105 860 600  → glyphs at x 106–882, y 150–703
     wordmark     viewBox 0 0 1000 180    → glyphs at x  96–904, y  32–149
     combinedmark viewBox 0 0 1000 1000   → stacked lockup, glyph over type

   The wordmark's glyphs fill only 65% of its box while the cloud fills 92%
   of its own, so setting the two <img>s to comparable heights renders the
   type at less than half the size it reads as. The lockup below sizes from
   the glyph boxes, not the viewBoxes. */
const MARKS = {
  brandmark: {
    src: `${BASE}/brand/cv-brandmark.svg`,
    w: 860,
    h: 600,
    ink: { x: 36, y: 45, w: 776, h: 553 },
  },
  wordmark: {
    src: `${BASE}/brand/cv-wordmark-green.svg`,
    w: 1000,
    h: 180,
    ink: { x: 96, y: 32, w: 808, h: 117 },
  },
  combinedmark: {
    src: `${BASE}/brand/cv-combinedmark-green.svg`,
    w: 1000,
    h: 1000,
    ink: { x: 0, y: 0, w: 1000, h: 1000 },
  },

  "brandmark-white": {
    src: `${BASE}/brand/cv-brandmark-white.svg`,
    w: 860,
    h: 600,
    ink: { x: 36, y: 45, w: 776, h: 553 },
  },
  "wordmark-white": {
    src: `${BASE}/brand/cv-wordmark-white.svg`,
    w: 1000,
    h: 180,
    ink: { x: 96, y: 32, w: 808, h: 117 },
  },
  "wordmark-carbon": {
    src: `${BASE}/brand/cv-wordmark-carbon.svg`,
    w: 1000,
    h: 180,
    ink: { x: 96, y: 32, w: 808, h: 117 },
  },
  "combinedmark-white": {
    src: `${BASE}/brand/cv-combinedmark-white.svg`,
    w: 1000,
    h: 1000,
    ink: { x: 0, y: 0, w: 1000, h: 1000 },
  },
} as const;

export interface LogoProps {
  mark?: keyof typeof MARKS;
  /** Rendered height of the asset box in px. */
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
 * The horizontal lockup used in navigation, the footer and the console
 * sidebar: brandmark beside wordmark, sized by their GLYPH boxes so the two
 * read as one mark.
 *
 * `size` is the wordmark's glyph height (ascender to descender) in px. The
 * cloud is set to 1.5× that — the optical match for a glyph beside lowercase
 * type — and the gap is measured from the glyphs' edges, not the boxes', so
 * the wordmark's built-in left padding does not double it.
 */
export function LogoLockup({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const word = MARKS.wordmark;
  const mark = MARKS.brandmark;

  const wordH = (size * word.h) / word.ink.h; // box height for `size` glyphs
  const wordW = (word.w / word.h) * wordH;
  const wordPadL = (word.ink.x / word.w) * wordW;

  const markGlyph = size * 1.5;
  const markH = (markGlyph * mark.h) / mark.ink.h;
  const markW = (mark.w / mark.h) * markH;
  const markPadR = ((mark.w - mark.ink.x - mark.ink.w) / mark.w) * markW;

  const gap = Math.round(size * 0.55);

  return (
    <span
      className={cn(
        "inline-flex items-center opacity-95 transition-opacity duration-normal ease-standard hover:opacity-100",
        className,
      )}
    >
      <img
        src={mark.src}
        alt="CoreValley"
        width={Math.round(markW)}
        height={Math.round(markH)}
        decoding="async"
        fetchPriority="high"
        style={{ marginRight: gap - markPadR - wordPadL }}
      />
      {/* Hydro type on Carbon; the ink-dark mono variant on paper. Both are
          in the markup so the swap is CSS and needs no theme in React. */}
      <img
        src={word.src}
        alt=""
        aria-hidden="true"
        width={Math.round(wordW)}
        height={Math.round(wordH)}
        decoding="async"
        fetchPriority="high"
        className="light:hidden"
      />
      <img
        src={MARKS["wordmark-carbon"].src}
        alt=""
        aria-hidden="true"
        width={Math.round(wordW)}
        height={Math.round(wordH)}
        decoding="async"
        className="hidden light:block"
      />
    </span>
  );
}
