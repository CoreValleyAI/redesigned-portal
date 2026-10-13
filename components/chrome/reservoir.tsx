"use client";

/**
 * The Reservoir (S3): the CoreValley wordmark drawn as a dot matrix at the
 * foot of every page, with hydro water rising through it as the page
 * reaches its end — full exactly when the page ends.
 *
 * Two layers. The poster is CSS: one element, two masks (the wordmark and
 * the water line) and a scroll-driven animation; browsers without
 * scroll-driven animations show it full. Over it, once the GL runtime has
 * drawn, the live Reservoir (components/gl/scenes/mark.ts, water mode):
 * the dots fly in letter by letter when it comes into view, part around the
 * pointer or a finger, and the water's surface takes the pointer, taps and
 * the slosh of a change in scroll speed.
 */
import { useRef, useState } from "react";
import { WORDMARK } from "@/components/brand/paths";
import { GLStage } from "@/components/gl/gl-stage";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/links";
import { trackScroll } from "@/lib/motion/scroll";

const BLEED = 48;

export function Reservoir() {
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const mask = `url("${asset("/brand/wordmark-mask.svg")}")`;
  return (
    <div aria-hidden="true" className="container-page select-none pt-12 pb-6 md:pt-20">
      <div ref={box} className="reservoir" style={{ "--mask": mask } as React.CSSProperties}>
        <div className={cn("absolute inset-0 transition-opacity duration-700 ease-out", live && "opacity-0")}>
          <div className="reservoir__dots" />
          <div className="reservoir__water" />
        </div>
        <div className="pointer-events-none absolute" style={{ inset: -BLEED }}>
          <GLStage
            load={() =>
              import("@/components/gl/scenes/mark").then((m) =>
                m.createMarkScene({
                  shape: WORDMARK,
                  columns: { count: 150, min: 3.2, max: 9 },
                  threshold: 0.32,
                  gamma: 1,
                  bleed: BLEED,
                  radius: 110,
                  push: 14,
                  water: true,
                }),
              )
            }
            pointerTarget="site-footer"
            progress={(set) => (box.current ? trackScroll(box.current, "end", set, 0) : () => {})}
            onShown={setLive}
          />
        </div>
      </div>
    </div>
  );
}
