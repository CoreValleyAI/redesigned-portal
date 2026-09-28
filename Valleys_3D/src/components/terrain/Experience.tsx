/**
 * The WebGL layer: a fixed full-screen canvas behind the page.
 *
 * Two scenes in one render loop: the infrastructure flight (terrain, data
 * river, compute nodes) and the Kathmandu Valley finale, which sleeps until
 * the camera nears it. Draw order: sky dome, the terrain's dot matrix
 * (opaque, writes depth), then the glow layers, then the effects.
 * PerformanceMonitor watches real frame times and moves the quality tier
 * down when frames drop, back up when there is headroom.
 */
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { QUALITY, type Tier } from "../../lib/quality";
import { ComputeNodes } from "./ComputeNodes";
import { DataRiver } from "./DataRiver";
import { Director } from "./Director";
import { Effects } from "./Effects";
import { KathmanduValley } from "../finale/KathmanduValley";
import { Sky } from "./Sky";
import { Terrain } from "./Terrain";

/** Calls back once a few frames have rendered: shaders compiled, range rising. */
function FirstFrames({ onReady }: { onReady: () => void }) {
  const n = React.useRef(0);
  useFrame(() => {
    if (++n.current === 4) onReady();
  });
  return null;
}

export function Experience({
  tier,
  maxTier,
  onTier,
  onReady,
}: {
  tier: Tier;
  maxTier: Tier;
  onTier: (t: Tier) => void;
  onReady: () => void;
}) {
  const q = QUALITY[tier];
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, q.dpr]}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 52, near: 0.1, far: 700, position: [0, 30, 0] }}
      >
        <color attach="background" args={["#010305"]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => onTier(Math.max(0, tier - 1) as Tier)}
          onIncline={() => onTier(Math.min(maxTier, tier + 1) as Tier)}
          onFallback={() => onTier(0)}
        />
        <Director />
        <Sky />
        <Terrain step={q.step} />
        <DataRiver count={q.river} />
        <ComputeNodes />
        <KathmanduValley detail={[0.5, 0.75, 1][tier]!} />
        <Effects quality={q} />
        <FirstFrames onReady={onReady} />
      </Canvas>
    </div>
  );
}
