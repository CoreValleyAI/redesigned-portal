/**
 * Reveal wrappers for components that prefer an element to an attribute.
 * Both only add data-reveal (see app/styles/motion.css and
 * reveal-observer.tsx); nothing is hidden unless it starts below the fold.
 */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type Tag = "div" | "section" | "li" | "article" | "header" | "p" | "span";

export function Reveal({
  children,
  delay = 0,
  as: As = "div",
  className,
  id,
}: {
  children: ReactNode;
  /** Extra delay, in ms. */
  delay?: number;
  as?: Tag;
  className?: string;
  id?: string;
}) {
  return (
    <As id={id} data-reveal className={className} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </As>
  );
}

/** Staggers its direct children (70 ms apart by default). */
export function RevealGroup({
  children,
  step = 70,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  step?: number;
  className?: string;
  as?: Tag | "ul" | "ol";
}) {
  let i = 0;
  return (
    <As className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const el = child as ReactElement<{ style?: React.CSSProperties; "data-reveal"?: string }>;
        const n = i++;
        return cloneElement(el, {
          "data-reveal": "",
          style: { ...el.props.style, "--reveal-delay": `${n * step}ms` } as React.CSSProperties,
        });
      })}
    </As>
  );
}
