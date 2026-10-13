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
  litClassName = "text-current",
  offClassName = "text-dot-off",
  charClassName,
  assemble = false,
}: {
  text: string;
  label?: string;
  className?: string;
  /** Colour of the lit dots, as a text colour class (the dots use currentColor). */
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
  let k = 0;
  return (
    <svg
      viewBox={`0 0 ${w * 10} 70`}
      className={cn("h-auto", assemble && "dt-assemble", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      fill="none"
      strokeLinecap="round"
    >
      {chars.map((rows, ci) => {
        /* A dot is a zero-length segment with a round cap, so a character is
           two paths (its faint and its lit dots), not 35 circles. Dots that
           must animate one by one (assemble) stay circles. */
        let off = "";
        let lit = "";
        const circles: React.ReactNode[] = [];
        rows.forEach((row, y) =>
          Array.from(row).forEach((d, x) => {
            const cx = (ci * cellW + x) * 10 + 5;
            const cy = y * 10 + 5;
            if (d !== "#") off += `M${cx} ${cy}h0`;
            else if (!assemble) lit += `M${cx} ${cy}h0`;
            else
              circles.push(
                <circle
                  key={`${x}-${y}`}
                  cx={cx}
                  cy={cy}
                  r={3.8}
                  fill="currentColor"
                  className={cn("dt-lit", litClassName)}
                  style={{ "--k": k++ } as React.CSSProperties}
                />,
              );
          }),
        );
        return (
          <g key={ci} className={charClassName?.(source[ci]!, ci)}>
            <path d={off} stroke="currentColor" strokeWidth={4.4} opacity={0.6} className={offClassName} />
            {assemble ? (
              circles
            ) : (
              <path d={lit} stroke="currentColor" strokeWidth={7.6} className={cn("dt-lit", litClassName)} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
