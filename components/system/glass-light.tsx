/**
 * The light behind the glass: soft, slowly drifting fields of hydro, teal
 * and a little violet, placed behind a section whose cards are liquid glass
 * so the glass has something to blur and bend. They drift with the scroll
 * (parallax) and on their own very slowly; with reduced motion they stay.
 * The host must be `relative isolate`. Decorative.
 */
import { cn } from "@/lib/cn";

export function GlassLight({ className, variant = "a" }: { className?: string; variant?: "a" | "b" | "c" }) {
  return (
    <div aria-hidden="true" className={cn("glass-light pointer-events-none absolute inset-0 -z-10", className)}>
      <span className={`glass-light__orb glass-light__orb--1 is-${variant}`} data-parallax="-0.12" />
      <span className={`glass-light__orb glass-light__orb--2 is-${variant}`} data-parallax="0.1" />
      <span className={`glass-light__orb glass-light__orb--3 is-${variant}`} data-parallax="-0.06" />
    </div>
  );
}
