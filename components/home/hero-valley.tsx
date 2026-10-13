/**
 * The hero's backdrop. This is the poster layer: a night (or dawn) sky, a
 * horizon glow where the valley is switching on, and a plane of dots in
 * perspective — the dot language before any WebGL arrives. The WebGL valley
 * (S1, components/gl/valley-stage.tsx) mounts on top and cross-fades in.
 *
 * Everything here is decorative and hidden from assistive tech.
 */
import { ValleyStage } from "@/components/gl/valley-stage";

export function HeroValley() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Sky: deepest at the top, warming to the horizon. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_78%,color-mix(in_oklch,var(--hydro)_9%,var(--bg))_0%,var(--bg)_62%)] dark:bg-[radial-gradient(120%_70%_at_50%_78%,color-mix(in_oklch,var(--hydro)_13%,var(--bg))_0%,var(--bg)_60%)]" />

      {/* The dot plane, receding to the horizon. */}
      <div className="absolute inset-x-[-40%] bottom-[-8%] h-[62%] [perspective:520px] [perspective-origin:50%_0%]">
        <div
          className="hero-plane absolute inset-0 origin-top [transform:rotateX(64deg)]"
          style={{
            backgroundImage: "radial-gradient(circle, var(--dot-off) 0 1.3px, transparent 1.9px)",
            backgroundSize: "18px 18px",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 28%, #000 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 28%, #000 100%)",
          }}
        />
      </div>

      {/* The horizon line, faintly lit. */}
      <div className="absolute inset-x-0 top-[38%] h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--hydro)_45%,transparent)_50%,transparent)] opacity-60" />

      <ValleyStage />

      {/* Keep text legible over whatever is drawn behind it. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,var(--bg)_0%,transparent_100%)] opacity-70" />
    </div>
  );
}
