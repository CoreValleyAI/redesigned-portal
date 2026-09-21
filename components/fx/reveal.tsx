"use client";

/**
 * Scroll-entry motion.
 *
 * The resting and revealed states are plain CSS on `[data-reveal]` /
 * `[data-reveal][data-shown]` (see app/glass.css). All this component does is
 * flip one attribute the first time an element crosses into view, which keeps
 * the animation on the compositor and out of React entirely.
 *
 * Three deliberate properties:
 *
 *  · ONE-SHOT. The observer unobserves on first intersection. Content that
 *    re-animates every time you scroll past it makes a page feel unstable.
 *  · SHARED OBSERVER. One IntersectionObserver for the whole document rather
 *    than one per element — a long marketing page can hold 60+ of these.
 *  · FAIL-OPEN. If IntersectionObserver is missing, the element is marked
 *    shown on mount. The hidden state is additionally gated behind `.cv-js`
 *    in CSS, so a page whose JS never runs at all renders normally instead of
 *    rendering blank.
 */

import * as React from "react";

type RevealKind = "up" | "left" | "right" | "scale" | "tilt" | "horizon";

/* ── A single observer, shared by every Reveal on the page ────────────────
   Created lazily so it is never constructed during SSR, and never torn down:
   it holds no element references after unobserving, and a page has exactly
   one. `rootMargin` fires the reveal slightly BEFORE the element reaches the
   viewport edge, so content is already settling by the time it is readable
   rather than visibly popping in at the boundary. */
let observer: IntersectionObserver | null = null;

function shared(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  observer ??= new IntersectionObserver(
    (entries, io) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.shown = "";
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  return observer;
}

/* Arms the CSS hidden state. Done here, by the first Reveal to mount, so the
   gate opens only once the code that will later flip `data-shown` is
   actually running. Idempotent: classList.add is a no-op on repeats. */
function arm() {
  document.documentElement.classList.add("cv-js");
}

export interface RevealProps extends React.ComponentPropsWithRef<"div"> {
  /** Direction the element travels in from. */
  kind?: RevealKind;
  /** Stagger, in ms, applied as the transition-delay. */
  delay?: number;
  /** Render as a different element — `li` inside a list, `section`, etc. */
  as?: "div" | "section" | "li" | "article" | "header" | "p" | "span";
}

export function Reveal({
  kind = "up",
  delay = 0,
  as = "div",
  style,
  children,
  ...rest
}: RevealProps) {
  /* Widened to ElementType so the ref and the spread props are checked once
     against HTMLElement rather than against the intersection of all seven
     allowed tags — which is uninhabited, since HTMLDivElement and
     HTMLLIElement disagree on `align`. The prop type above is still the
     narrow union, so call sites keep their autocomplete. */
  const Tag = as as React.ElementType;
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = shared();
    if (!io) {
      // No observer: show it rather than leaving it at opacity 0 forever.
      el.dataset.shown = "";
      return;
    }
    arm();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={kind}
      style={{ ...style, "--d": `${delay}ms` } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers its direct children by wrapping each in a <Reveal>.
 *
 * The wrapper IS the grid cell — it cannot be `display: contents`, because an
 * element with no box has nothing to transform, and the whole reveal would
 * silently do nothing. Grid items stretch by default, so a child carrying
 * `h-full` still fills the row.
 *
 * Use this for grids and lists where the children are homogeneous. For mixed
 * content — a heading, then a paragraph, then a button row — place <Reveal>
 * by hand so the delays follow the reading order rather than the DOM order.
 */
export function RevealGroup({
  children,
  step = 70,
  start = 0,
  kind = "up",
  className,
  ...rest
}: {
  children: React.ReactNode;
  /** ms between consecutive children. */
  step?: number;
  /** ms before the first child. */
  start?: number;
  kind?: RevealKind;
  className?: string;
} & Omit<React.ComponentPropsWithRef<"div">, "children">) {
  const items = React.Children.toArray(children);
  return (
    <div className={className} {...rest}>
      {items.map((child, i) => (
        <Reveal
          // Children of a grid are positional and never reordered here, so the
          // index is a stable identity.
          key={i}
          kind={kind}
          // Cap the ramp: past ~8 items a linear stagger turns into a visible
          // wipe and the last card arrives a second and a half late.
          delay={start + Math.min(i, 7) * step}
          className="min-w-0"
        >
          {child}
        </Reveal>
      ))}
    </div>
  );
}
