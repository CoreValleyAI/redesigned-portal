/**
 * Dot glyphs — 7 × 7 pictograms drawn in the site's dot language (05 §5).
 * One per product and per main page; they double as menu micro-visuals.
 *
 * At rest the lit dots are ink and the rest are faint. Inside a `group`
 * that is hovered or focused, the lit dots switch on to hydro in a diagonal
 * wave — the card "comes online". Pure CSS; the SVG is decorative.
 */
import { cn } from "@/lib/cn";

const G = {
  /* Padlock: capacity held for you. */
  reserved: ["..###..", ".#...#.", ".#...#.", "#######", "###.###", "###.###", "#######"],
  /* Stopwatch: by the second. */
  "on-demand": ["..###..", ".#...#.", "#..#..#", "#..##.#", "#.....#", ".#...#.", "..###.."],
  /* Speech bubble, typing: a model answering. */
  inferencing: ["#######", "#.....#", "#.#.#.#", "#.....#", "#######", ".##....", ".#....."],
  /* A block cut into slices. */
  "mig-slicing": ["###.###", "###.###", "###.###", ".......", "##.##.#", "##.##.#", "##.##.#"],
  /* A storage cylinder. */
  storage: [".#####.", "#######", "#.....#", "#######", "#.....#", "#######", ".#####."],
  /* A person: engineers. */
  services: ["..###..", "..###..", "...#...", ".#####.", "#.###.#", "..#.#..", "..#.#.."],
  /* A chip with pins: the machines. */
  hardware: [".#.#.#.", "#######", "#.....#", "#.###.#", "#.....#", "#######", ".#.#.#."],
  /* A valley between two peaks. */
  infrastructure: [".......", ".#...#.", "###.###", "#######", "#######", ".......", "#######"],
  /* Stacked layers. */
  platform: ["..###..", ".#####.", ".......", ".#####.", "#######", ".......", "#######"],
  /* A map pin. */
  "use-cases": ["..###..", ".#####.", "##...##", ".#####.", "..###..", "...#...", "......."],
  /* A meter needle. */
  pricing: [".......", ".#####.", "#.....#", "#..#..#", "#...#.#", "#.....#", "#######"],
  /* A shield. */
  trust: ["#######", "#.....#", "#..#..#", "#.###.#", ".#.#.#.", "..#.#..", "...#..."],
  /* An upward path: the ascent. */
  contact: ["...#...", "..###..", ".#.#.#.", "...#...", "...#...", "...#...", "...#..."],
  /* An open book. */
  docs: [".......", "###.###", "#.#.#.#", "###.###", "#.#.#.#", "###.###", "......."],
  /* Two people. */
  company: [".##..##", ".##..##", "..#...#", "####.##", "####.##", ".#.#.#.", ".#.#.#."],
  /* A briefcase. */
  careers: ["..###..", "..#.#..", "#######", "#.....#", "###.###", "#.....#", "#######"],
  /* A page with lines. */
  blog: ["#####..", "#...##.", "#.#..##", "#.....#", "#.###.#", "#.....#", "#######"],
  /* A snowflake. */
  snow: ["...#...", ".#.#.#.", "..###..", "#######", "..###..", ".#.#.#.", "...#..."],
  /* Moving water. */
  water: [".......", ".##..##", "#..##..", ".......", ".##..##", "#..##..", "......."],
  /* A prompt: >_ */
  token: [".......", "#......", ".#.....", "..#....", ".#.....", "#..####", "......."],
} as const;

export type GlyphName = keyof typeof G;

export const GLYPH_NAMES = Object.keys(G) as GlyphName[];

export function DotGlyph({
  name,
  className,
  /** Render the lit dots in hydro without needing a hover. */
  on = false,
}: {
  name: GlyphName;
  className?: string;
  on?: boolean;
}) {
  const rows = G[name];
  const dots: { x: number; y: number; lit: boolean; d: number }[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < 7; x++) dots.push({ x, y, lit: row[x] === "#", d: x + y });
  });
  return (
    <svg
      viewBox="0 0 70 70"
      aria-hidden="true"
      focusable="false"
      className={cn("size-7 shrink-0", className)}
      data-on={on || undefined}
    >
      {dots.map(({ x, y, lit, d }) => (
        <circle
          key={`${x}-${y}`}
          cx={x * 10 + 5}
          cy={y * 10 + 5}
          r={lit ? 3.6 : 2.2}
          className={
            lit
              ? "fill-ink transition-[fill] duration-300 ease-out group-hover:fill-hydro group-focus-visible:fill-hydro in-data-on:fill-hydro"
              : "fill-dot-off opacity-70"
          }
          style={lit ? { transitionDelay: `${d * 28}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
