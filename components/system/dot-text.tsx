/**
 * Dot text — figures and capitals drawn in a 5 × 7 dot-matrix face
 * ("character dots", 06 §4): section numbers, the Valley Time clock, the
 * reference code on a request's plan card. Lit dots in the current colour,
 * the rest faint, so each figure reads as part of a field. The SVG is
 * decorative; pass the real text as `label` for assistive tech.
 */
import { cn } from "@/lib/cn";

/** The face itself, also drawn onto a canvas by the plan card's export. */
export const DOT_FONT: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ":": [".....", "..#..", "..#..", ".....", "..#..", "..#..", "....."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

export function DotText({
  text,
  label,
  className,
  litClassName = "fill-current",
  offClassName = "fill-dot-off",
  charClassName,
  assemble = false,
}: {
  text: string;
  label?: string;
  className?: string;
  litClassName?: string;
  offClassName?: string;
  /** A class for one character's group (the clock's blinking colon). */
  charClassName?: (char: string, index: number) => string | undefined;
  /** Lit dots arrive one after another (app/styles/motion.css, .dt-assemble). */
  assemble?: boolean;
}) {
  const source = Array.from(text.toUpperCase());
  const chars = source.map((c) => DOT_FONT[c] ?? DOT_FONT[" "]!);
  const cellW = 6; // 5 dots + 1 gap
  const w = chars.length * cellW - 1;
  let lit = 0;
  return (
    <svg
      viewBox={`0 0 ${w * 10} 70`}
      className={cn("h-auto", assemble && "dt-assemble", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {chars.map((rows, ci) => (
        <g key={ci} className={charClassName?.(source[ci]!, ci)}>
          {rows.map((row, y) =>
            Array.from(row).map((d, x) => (
              <circle
                key={`${x}-${y}`}
                cx={(ci * cellW + x) * 10 + 5}
                cy={y * 10 + 5}
                r={d === "#" ? 3.8 : 2.2}
                className={d === "#" ? cn("dt-lit", litClassName) : offClassName}
                opacity={d === "#" ? 1 : 0.6}
                style={d === "#" && assemble ? ({ "--k": lit++ } as React.CSSProperties) : undefined}
              />
            )),
          )}
        </g>
      ))}
    </svg>
  );
}
