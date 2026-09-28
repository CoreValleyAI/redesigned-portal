/**
 * A section of the flight. Each one is a stretch of scroll (so the camera has
 * distance to travel) with its content pinned in the viewport while it
 * passes. `data-station` lets lib/flight.ts measure where the camera should
 * arrive at the section's pose and grade.
 */
import * as React from "react";

export function Station({
  id,
  children,
  side = "left",
  length = "190vh",
}: {
  id: string;
  children: React.ReactNode;
  side?: "left" | "right";
  length?: string;
}) {
  const align = side === "right" ? "md:justify-end md:pr-[9vw]" : "md:justify-start";
  // A soft wash of the page colour behind the panel's side of the screen, so
  // type stays crisp over the brightest crests without boxing the view in.
  const at = side === "right" ? "78% 55%" : "22% 55%";
  return (
    <section id={id} data-station className="relative" style={{ height: length }}>
      <div className={`sticky top-0 flex min-h-svh items-center px-5 pt-20 pb-8 md:px-[6vw] ${align}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: `radial-gradient(55% 75% at ${at}, rgb(var(--scrim-rgb) / 0.66), transparent 72%)` }}
        />
        <div className="w-full max-w-[600px]">{children}</div>
      </div>
    </section>
  );
}
