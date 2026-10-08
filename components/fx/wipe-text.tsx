/**
 * Stagger wipe: each word rises out of its own clipped line, one after the
 * other, when the enclosing <Reveal> is shown. Pure CSS (see `.wipe` in
 * app/glass.css) driven by the `--i` index, so it costs nothing to render and
 * the text is plain, selectable and read normally by assistive tech.
 *
 * Server component: no state, no effects. Wrap it inside a <Reveal>.
 */
import { cn } from "@/lib/cn";

export function WipeText({
  text,
  className,
  /** Index offset, so several WipeTexts in one heading stagger in sequence. */
  start = 0,
}: {
  text: string;
  className?: string;
  start?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("wipe", className)}>
      {words.map((w, i) => (
        <span key={i} className="wipe__w" style={{ "--i": start + i } as React.CSSProperties}>
          <span className="wipe__t">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
