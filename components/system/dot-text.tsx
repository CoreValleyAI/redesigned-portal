/**
 * Dot text — numbers drawn in a 5 × 7 dot-matrix face ("character dots",
 * 06 §4): the 404, section numbers, the Valley Time clock. Lit dots in the
 * current colour, the rest faint, so each figure reads as part of a field.
 * The SVG is decorative; pass the real text as `label` for assistive tech.
 */
import { cn } from "@/lib/cn";

const FONT: Record<string, string[]> = {
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
}: {
  text: string;
  label?: string;
  className?: string;
  litClassName?: string;
  offClassName?: string;
  /** A class for one character's group (the clock's blinking colon). */
  charClassName?: (char: string, index: number) => string | undefined;
}) {
  const source = Array.from(text);
  const chars = Array.from(text).map((c) => FONT[c] ?? FONT[" "]!);
  const cellW = 6; // 5 dots + 1 gap
  const w = chars.length * cellW - 1;
  return (
    <svg
      viewBox={`0 0 ${w * 10} 70`}
      className={cn("h-auto", className)}
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
              />
            )),
          )}
        </g>
      ))}
    </svg>
  );
}
