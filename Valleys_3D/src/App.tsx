/**
 * Valleys: CoreValley's homepage as a flight through a dot-matrix mountain
 * range that ends over the Kathmandu Valley. The page scrolls (smoothed by
 * Lenis); a fixed WebGL canvas behind it turns that scroll into a camera
 * flight, and each section's panels hold still while the camera travels its
 * stretch. Light and dark share one scene; the theme only crossfades it.
 */
import * as React from "react";
import { MotionConfig } from "framer-motion";
import { bindFlight } from "./lib/flight";
import { guessTier, QUALITY, type Tier } from "./lib/quality";
import { Experience } from "./components/terrain/Experience";
import { terrainDotCount } from "./components/terrain/Terrain";
import { Hero } from "./components/sections/Hero";
import { Compute, River, Scale } from "./components/sections/Specs";
import { Finale, Platform, Sovereign } from "./components/sections/Story";
import { Hud, Veil } from "./components/ui/Hud";

/** ?tier=0|1|2 pins a tier (and stops the monitor moving it), for testing. */
function pinnedTier() {
  return new URLSearchParams(window.location.search).get("tier");
}

function initialTier(): Tier {
  const pinned = pinnedTier();
  if (pinned === "0" || pinned === "1" || pinned === "2") return Number(pinned) as Tier;
  return guessTier();
}

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function App() {
  const [maxTier] = React.useState(initialTier);
  const [tier, setTier] = React.useState<Tier>(maxTier);
  const [ready, setReady] = React.useState(false);
  const [gl] = React.useState(hasWebGL);

  React.useEffect(() => bindFlight(), []);
  // Without WebGL the page still reads: the veil lifts over a plain backdrop.
  React.useEffect(() => {
    if (!gl) setReady(true);
  }, [gl]);

  const q = QUALITY[tier];
  const dots = terrainDotCount(q.step) + q.river;

  return (
    <MotionConfig reducedMotion="user">
      {gl ? (
        <Experience tier={tier} maxTier={maxTier} onTier={pinnedTier() ? () => {} : setTier} onReady={() => setReady(true)} />
      ) : (
        <div
          className="fixed inset-0 -z-10"
          style={{ background: "radial-gradient(120% 80% at 50% 100%, rgb(var(--accent-rgb) / 0.14), var(--bg) 60%)" }}
        />
      )}
      <Hud quality={q} dots={dots} />
      <main className="relative z-10">
        <Hero />
        <Compute />
        <River />
        <Scale />
        <Platform />
        <Sovereign />
        <Finale />
      </main>
      <Veil ready={ready} dots={dots} />
    </MotionConfig>
  );
}
