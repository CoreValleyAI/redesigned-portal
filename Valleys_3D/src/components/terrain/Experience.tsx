/**
 * The WebGL layer: a fixed full-screen canvas behind the page.
 *
 * Two scenes in one render loop: the infrastructure flight (terrain, data
 * river, compute nodes) and the Kathmandu Valley finale, which sleeps until
 * the camera nears it. Draw order: sky dome, the terrain's dot matrix
 * (opaque, writes depth), then the glow layers, then the effects.
 * PerformanceMonitor watches real frame times and lowers the pixel ratio
 * when frames drop, raising it again (up to the tier's ceiling) when there is
 * headroom. The tier itself never changes mid-flight.
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
  adaptive,
  onReady,
}: {
  tier: Tier;
  adaptive: boolean;
  onReady: () => void;
}) {
  const q = QUALITY[tier];
  const [dpr, setDpr] = React.useState(q.dpr);
  const adapt = (d: number) => {
    if (adaptive) setDpr(Math.min(q.dpr, Math.max(1, d)));
  };
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, dpr]}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 52, near: 0.1, far: 700, position: [0, 30, 0] }}
      >
        <color attach="background" args={["#010305"]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => adapt(dpr - 0.25)}
          onIncline={() => adapt(dpr + 0.25)}
          onFallback={() => adapt(1)}
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
