"use client";

/**
 * Off the map (S18): the 404 page's field of snow, which the pointer
 * gathers back into the brand mark as it passes (components/gl/scenes/
 * mark.ts, snow mode). On a phone a sideways swipe gathers it (vertical
 * swipes still scroll), and left alone the snow slowly gathers itself.
 * Without WebGL2 or scripting, and with reduced motion, the finished mark
 * stands in, still.
 */
import { useState } from "react";
import { GLStage } from "@/components/gl/gl-stage";
import { cn } from "@/lib/cn";
import { asset } from "@/lib/links";

/** Space between the field's edge and the mark, CSS px. */
const INSET = 44;

export function SnowMark({ className }: { className?: string }) {
  const [live, setLive] = useState(false);
  const [gathered, setGathered] = useState(false);
  return (
    <figure className={cn("flex flex-col items-center gap-4", className)}>
      <div
        id="snow-field"
        aria-hidden="true"
        className="snow-field relative h-[clamp(16rem,36vw,24rem)] w-full touch-pan-y select-none"
      >
        <div
          className={cn("mark-poster absolute transition-opacity duration-700 ease-out", live && "opacity-0")}
          style={{ inset: INSET, "--mask": `url("${asset("/brand/brandmark-mask.svg")}")` } as React.CSSProperties}
        />
        <GLStage
          load={() =>
            import("@/components/gl/scenes/mark").then((m) =>
              m.createMarkScene({ mode: "snow", bleed: INSET, cell: 5, onGathered: () => setGathered(true) }),
            )
          }
          pointerTarget="snow-field"
          onShown={setLive}
        />
      </div>
      <figcaption
        aria-live="polite"
        className={cn("type-caption font-mono text-ink-3 still:hidden", !live && "invisible")}
      >
        {gathered ? (
          "Back on the map."
        ) : (
          <>
            <span className="hidden pointer-fine:inline">Move through the snow to gather it.</span>
            <span className="pointer-fine:hidden">Swipe through the snow to gather it.</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
