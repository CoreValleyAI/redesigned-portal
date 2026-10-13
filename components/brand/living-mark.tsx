"use client";

/**
 * The Living Mark: the brand mark as a field of dots that flies together
 * when it comes into view and parts around the pointer (components/gl/
 * scenes/mark.ts). Until the scene's first frame, and for good without
 * WebGL2 or scripting, a still dot rendering of the mark stands in (CSS,
 * .mark-poster in app/styles/motion.css).
 *
 * The canvas reaches BLEED px past the box on every side, so the dots have
 * room to fly in from, and ignores the pointer itself: pointer events over
 * `pointerTarget` (an element id) drive it, so a hand moving across the
 * footer meets the mark before it reaches it.
 */
import { useRef, useState } from "react";
import { GLStage } from "@/components/gl/gl-stage";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/links";
import { trackScroll } from "@/lib/motion/scroll";

const BLEED = 90;

export function LivingMark({ className, pointerTarget }: { className?: string; pointerTarget?: string }) {
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  return (
    <div ref={box} aria-hidden="true" className={cn("relative aspect-[860/600] select-none", className)}>
      <div
        className={cn("mark-poster absolute inset-0 transition-opacity duration-700 ease-out", live && "opacity-0")}
        style={{ "--mask": `url("${asset("/brand/brandmark-mask.svg")}")` } as React.CSSProperties}
      />
      <div className="pointer-events-none absolute" style={{ inset: -BLEED }}>
        <GLStage
          load={() => import("@/components/gl/scenes/mark").then((m) => m.createMarkScene({ bleed: BLEED }))}
          pointerTarget={pointerTarget}
          // Scrolling past the mark wakes the stage: the dots feel the
          // change of speed and slosh.
          progress={(set) => (box.current ? trackScroll(box.current, "through", set, 0.1) : () => {})}
          onShown={setLive}
        />
      </div>
    </div>
  );
}
