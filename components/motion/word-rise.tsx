/**
 * Word rise — each word lifts out of its own clipped line box, staggered
 * 70 ms apart (06 §4). Pure CSS (app/styles/motion.css, ".rise"), so it
 * costs nothing to render, runs before hydration, and the text stays plain,
 * selectable and read normally by assistive tech. The words start partly
 * visible, so a headline that is the page's LCP element is painted on the
 * first frame.
 */
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export function WordRise({
  text,
  start = 0,
  delay = 0,
  className,
  wordClassName,
}: {
  text: string;
  /** Index of the first word, so several WordRises in one heading stagger in order. */
  start?: number;
  /** Extra delay before the first word, in ms. */
  delay?: number;
  className?: string;
  wordClassName?: string;
}) {
  const words = text.split(" ");
  return (
    <span
      className={cn("rise", className)}
      style={delay ? ({ "--rise-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="rise__w">
            <span className={cn("rise__t", wordClassName)} style={{ "--i": start + i } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {/* The space sits between the clipped boxes: inside an
              inline-block it would collapse. */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
