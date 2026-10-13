/**
 * Dot glyphs — 7 × 7 pictograms drawn in the site's dot language (05 §5).
 * One per product and per main page; they double as menu micro-visuals.
 *
 * At rest the lit dots are ink and the rest are faint. Inside a `group`
 * that is hovered or focused, the lit dots switch on to hydro in a sweep from
 * the corner — the card "comes online". The styling lives in app/styles/motion.css
 * (.dg) so each of the dozens of glyphs on a page costs a few bytes per dot.
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

/* Each glyph is three paths: the faint dots, the lit dots in ink, and the
   lit dots again in hydro, clipped away until the card is hovered, focused
   or switched on (app/styles/motion.css, .dg). A dot is a zero-length
   segment with a round cap, so a whole glyph is a few hundred bytes. */
const PATHS = new Map<GlyphName, { off: string; lit: string }>();
function pathsOf(name: GlyphName) {
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
