/**
 * Industry glyphs for /solutions — 7 × 7 pictograms in the same dot
 * language as components/system/dot-glyph.tsx, and styled by the same
 * `.dg` rules (app/styles/motion.css): ink at rest, switching on to hydro
 * when the surrounding `group` is hovered or focused.
 */
import { cn } from "@/lib/cn";

const G = {
  /* A bank: pediment, columns, base. */
  bank: ["...#...", ".#####.", "#######", ".#.#.#.", ".#.#.#.", ".#.#.#.", "#######"],
  /* An umbrella: cover. */
  umbrella: ["..###..", ".#####.", "#######", "...#...", "...#...", ".#.#...", "..#...."],
  /* A shopping bag. */
  bag: ["..###..", ".#...#.", "#######", "#.....#", "#.....#", "#.....#", "#######"],
  /* A factory: chimney and sawtooth roof. */
  factory: ["#......", "#......", "#..#..#", "#.##.##", "#######", "#.#.#.#", "#######"],
  /* A mortarboard with its tassel. */
  cap: ["...#...", ".#####.", "#######", ".#####.", "..###.#", "..###.#", "......#"],
  /* A rocket. */
  rocket: ["...#...", "..###..", "..#.#..", "..###..", ".#####.", "#.###.#", "..#.#.."],
} as const;

export type IndustryGlyphName = keyof typeof G;

const PATHS = new Map<IndustryGlyphName, { off: string; lit: string }>();
function pathsOf(name: IndustryGlyphName) {
  let p = PATHS.get(name);
  if (!p) {
    let off = "";
    let lit = "";
    G[name].forEach((row, y) => {
      for (let x = 0; x < 7; x++) {
        const seg = `M${x * 10 + 5} ${y * 10 + 5}h0`;
        if (row[x] === "#") lit += seg;
        else off += seg;
      }
    });
    p = { off, lit };
    PATHS.set(name, p);
  }
  return p;
}

export function IndustryGlyph({
  name,
  className,
  on = false,
}: {
  name: IndustryGlyphName;
  className?: string;
  /** Render the lit dots in hydro without needing a hover. */
  on?: boolean;
}) {
  const { off, lit } = pathsOf(name);
  return (
    <svg
      viewBox="0 0 70 70"
      aria-hidden="true"
      focusable="false"
      className={cn("dg size-7 shrink-0", className)}
      data-on={on || undefined}
    >
      <path className="o" d={off} />
      <path className="l" d={lit} />
      <path className="h" d={lit} />
    </svg>
  );
}
