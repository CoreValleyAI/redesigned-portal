/**
 * Compute on the peaks: GPU nodes sitting on real summits along the valley,
 * each with a pulsing core, a scanning halo and an uplink beam, joined by
 * arcs that carry packets from node to node: the InfiniBand fabric, drawn
 * as light over the range (as ink, in the light theme).
 *
 * Node positions are found on the CPU with the same height function the
 * shader uses (field.ts), so every node sits on a crest. One static
 * THREE.Points buffer; all motion is in the shader.
 */
import * as React from "react";
import * as THREE from "three";
import { BASIN_R, BASIN_Z, heightAt, riverX, valleyW, Z_START } from "./field";
import { FOG_GLSL, glowMaterial, POINT_FRAG } from "./world";

const SPACING = 42;

const VERT = /* glsl */ `
  uniform float uTime, uPR, uRise, uTheme;
  uniform vec3 uRiver, uHigh, uAccent;
  attribute float aKind, aT, aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  ${FOG_GLSL}
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    float a = 0.0, s = 1.0;
    vec3 col = uRiver;
    if (aKind < 0.5) {
      // Uplink beam: fades with height, packets climbing it.
      float up = pow(0.5 + 0.5 * sin(aT * 24.0 - uTime * 5.0 + aPhase), 10.0);
      a = pow(1.0 - aT, 1.6) * (0.25 + 0.9 * up);
      col = mix(uRiver, mix(uAccent, vec3(1.0), 0.4 * (1.0 - uTheme)), up * 0.7);
      s = 0.8 + up;
    } else if (aKind < 1.5) {
      // Halo: a light sweeping round the ring.
      float sweep = pow(0.5 + 0.5 * cos(aT - uTime * 2.2 + aPhase), 14.0);
      a = 0.3 + 0.9 * sweep;
      col = mix(mix(uHigh, uRiver, 0.4), uRiver, uTheme);
      s = 0.9 + sweep;
    } else if (aKind < 2.5) {
      // Core: breathing.
      float b = 0.6 + 0.4 * sin(uTime * 2.0 + aPhase);
      a = 0.9 * b;
      col = mix(mix(uHigh, vec3(1.0), 0.5) * (1.4 + b), uAccent, uTheme);
      s = 1.6;
    } else {
      // Arc: faint link, a bright packet running along it.
      float head = fract(aT - uTime * 0.28 + aPhase);
      float packet = smoothstep(0.86, 0.995, head) * step(head, 0.995);
      a = 0.12 + 1.1 * packet;
      col = mix(uRiver, mix(uAccent, vec3(1.0), 0.35 * (1.0 - uTheme)), packet) * mix(1.0 + packet * 1.5, 1.0, uTheme);
      s = 0.7 + packet * 1.6;
    }
    float f = fogK(dist);
    vColor = mix(col, uFog, f);
    vAlpha = min(1.0, a * mix(1.0, 1.4, uTheme)) * (1.0 - f) * uRise;
    gl_PointSize = clamp(s * 80.0 * uPR / max(dist, 0.1), 1.6 * uPR, 16.0 * uPR);
  }
`;

interface Node { x: number; y: number; z: number }

/** A summit near z on the given side of the river. */
function findPeak(z: number, side: number): Node {
  const w = valleyW(z), cx = riverX(z);
  let best: Node = { x: cx + side * w * 2.5, y: -1e9, z };
  for (let i = 0; i < 14; i++) {
    for (const dz of [-6, 0, 6]) {
      const x = cx + side * (w * 2.2 + i * 3.4);
      const y = heightAt(x, z + dz);
      if (y > best.y) best = { x, y, z: z + dz };
    }
  }
  return best;
}

export function ComputeNodes() {
  const geometry = React.useMemo(() => {
    const nodes: Node[] = [];
    // Along the valley, stopping short of the basin: the finale has its own skyline.
    for (let z = Z_START + 34, k = 0; z < BASIN_Z - BASIN_R - 40; z += SPACING, k++) nodes.push(findPeak(z, k % 2 ? 1 : -1));

    const P: number[] = [], K: number[] = [], T: number[] = [], PH: number[] = [];
    const push = (x: number, y: number, z: number, kind: number, t: number, ph: number) => {
      P.push(x, y, z); K.push(kind); T.push(t); PH.push(ph);
    };
    nodes.forEach((n, i) => {
      const ph = i * 1.93;
      const beamH = 16 + (i % 3) * 7;
      for (let j = 0; j < 110; j++) push(n.x, n.y + 0.6 + (j / 110) * beamH, n.z, 0, j / 110, ph);
      for (let j = 0; j < 56; j++) {
        const a = (j / 56) * Math.PI * 2;
        push(n.x + Math.cos(a) * 2.4, n.y + 0.7, n.z + Math.sin(a) * 2.4, 1, a, ph);
      }
      for (let j = 0; j < 24; j++) {
        const r = Math.random() * 0.7, a = Math.random() * Math.PI * 2;
        push(n.x + Math.cos(a) * r, n.y + 0.4 + Math.random() * 0.9, n.z + Math.sin(a) * r, 2, 0, ph + j);
      }
    });
    // Links: to the next node across the valley, and to the one after, so
    // each side of the range also carries its own chain.
    const arc = (a: Node, b: Node, ph: number) => {
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      const mid = new THREE.Vector3((a.x + b.x) / 2, Math.max(a.y, b.y) + d * 0.32, (a.z + b.z) / 2);
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x, a.y + 1, a.z), mid, new THREE.Vector3(b.x, b.y + 1, b.z));
      const n = Math.round(d * 4);
      for (let j = 0; j <= n; j++) {
        const p = curve.getPoint(j / n);
        push(p.x, p.y, p.z, 3, j / n, ph);
      }
    };
    for (let i = 0; i < nodes.length - 1; i++) {
      arc(nodes[i]!, nodes[i + 1]!, i * 0.37);
      if (i < nodes.length - 2) arc(nodes[i]!, nodes[i + 2]!, i * 0.61 + 0.5);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("aKind", new THREE.Float32BufferAttribute(K, 1));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(T, 1));
    g.setAttribute("aPhase", new THREE.Float32BufferAttribute(PH, 1));
    g.computeBoundingSphere();
    return g;
  }, []);

  const material = React.useMemo(() => glowMaterial({ vertexShader: VERT, fragmentShader: POINT_FRAG }), []);

  React.useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return <points geometry={geometry} material={material} renderOrder={3} />;
}
