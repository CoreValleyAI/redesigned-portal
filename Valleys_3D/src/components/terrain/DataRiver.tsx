/**
 * The river of data: light running down the valley floor.
 *
 * Particles travel in parallel lanes, like the links of the InfiniBand and
 * NVLink fabrics, each lane carrying packets: bright pulses that race
 * downstream faster than the current. Every particle moves in world space
 * and wraps inside a window around the camera, so flying forward passes
 * through the stream instead of dragging it along. Where the valley opens into the Kathmandu basin the
 * stream hands over to the Bagmati (see finale/KathmanduValley.tsx).
 */
import * as React from "react";
import * as THREE from "three";
import { FIELD_GLSL } from "./field";
import { FOG_GLSL, glowMaterial, POINT_FRAG } from "./world";

const LANES = 7;
const WINDOW = 300;
const BEHIND = 30;

const VERT = /* glsl */ `
  uniform float uTime, uCamZ, uPR, uRise, uVel, uTheme;
  uniform vec3 uRiver, uHigh, uAccent;
  attribute float aSeed, aLane, aSpeed, aRand;
  varying vec3 vColor;
  varying float vAlpha;
  ${FIELD_GLSL}
  ${FOG_GLSL}
  void main() {
    float lo = uCamZ - ${BEHIND.toFixed(1)};
    float zw = aSeed * ${WINDOW.toFixed(1)} + uTime * aSpeed;
    float z = zw - ${WINDOW.toFixed(1)} * floor((zw - lo) / ${WINDOW.toFixed(1)});
    float w = valleyW(z);
    // Lanes spread across the channel and braid slowly.
    float lane = (aLane / ${(LANES - 1).toFixed(1)}) * 2.0 - 1.0;
    float braid = 0.18 * sin(z * 0.05 + aLane * 1.7 + uTime * 0.3);
    float x = riverX(z) + (lane + braid + (aRand - 0.5) * 0.12) * w * 0.3;
    float y = -0.55 + 0.25 * sin(z * 0.2 + uTime * 1.5 + aLane) + aRand * 0.35;

    // Packets: short bright pulses per lane, faster than the current.
    float phase = z * 0.09 - uTime * (2.6 + aLane * 0.13) + aLane * 2.1;
    float packet = pow(0.5 + 0.5 * sin(phase), 18.0);
    float pulse = 0.5 + 0.5 * sin(z * 0.02 - uTime * 0.8);

    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    // Dark: light, packets flaring white-pink. Light: ink, packets in accent.
    vec3 dark = mix(uRiver, mix(uAccent, vec3(1.0), 0.45), packet * 0.8);
    dark *= 0.7 + 0.5 * pulse + 1.8 * packet + abs(uVel) * 3.0;
    vec3 lite = mix(uRiver, uAccent, packet);
    vec3 col = mix(dark, lite, uTheme);
    float f = fogK(dist);
    vColor = mix(col, uFog, f);
    // Hand over to the Bagmati inside the basin.
    float basin = smoothstep(BASIN_R * 0.95, BASIN_R + 22.0, length(vec2(x, z) - BASIN_C));
    float a = mix(0.35 + 0.65 * packet, 0.55 + 0.45 * packet, uTheme);
    vAlpha = a * (1.0 - f) * uRise * smoothstep(0.5, 4.0, dist) * basin;
    float size = (0.28 + 0.35 * aRand + 0.6 * packet) * 42.0;
    gl_PointSize = clamp(size * uPR / max(dist, 0.1), 1.0 * uPR, 14.0 * uPR);
  }
`;

export function DataRiver({ count }: { count: number }) {
  const geometry = React.useMemo(() => {
    const seed = new Float32Array(count), lane = new Float32Array(count);
    const speed = new Float32Array(count), rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seed[i] = Math.random();
      lane[i] = Math.floor(Math.random() * LANES);
      speed[i] = 6 + Math.random() * 5;
      rnd[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    // Positions come from the shader; the attribute only sets the count.
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aLane", new THREE.BufferAttribute(lane, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [count]);

  const material = React.useMemo(() => glowMaterial({ vertexShader: VERT, fragmentShader: POINT_FRAG }), []);

  React.useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}
