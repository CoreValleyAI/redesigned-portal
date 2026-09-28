/**
 * The grand finale: the Kathmandu Valley in points.
 *
 * A scene of its own, kept apart from the infrastructure terrain: its own
 * geometry (build.ts) and shader, sharing only the world uniforms. It sleeps
 * (invisible, no draw call) until the camera nears the end of the flight;
 * then its points sparkle in and rise into place as uFinale goes 0 → 1.
 *
 * What moves: light pulses down the Bagmati and Bishnumati, traffic runs the
 * streets and the Ring Road, windows come on and off, rings of light climb
 * the Dharahara and a spine of light rises from it into the sky.
 */
import * as React from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { buildValley } from "./build";
import { FOG_GLSL, glowMaterial, POINT_FRAG, WORLD } from "../terrain/world";

const VERT = /* glsl */ `
  uniform float uTime, uPR, uTheme, uFinale;
  uniform vec3 uLow, uHigh, uRiver, uAccent, uWarm, uHorizon;
  attribute float aKind, aT, aRand;
  varying vec3 vColor;
  varying float vAlpha;
  ${FOG_GLSL}

  vec3 flagColour(float t) {
    if (t < 0.125) return vec3(0.12, 0.35, 1.0);
    if (t < 0.375) return vec3(1.0);
    if (t < 0.625) return vec3(1.0, 0.16, 0.2);
    if (t < 0.875) return vec3(0.1, 0.8, 0.35);
    return vec3(1.0, 0.84, 0.1);
  }

  void main() {
    // Sparkle in, and rise into place (the skyline only fades).
    float k = clamp(uFinale * 1.7 - aRand * 0.7, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = position;
    if (aKind < 7.5) p.y -= (1.0 - k) * 2.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;

    vec3 dark = uHigh, lite = uHigh;
    float a = 1.0, s = 1.0, la = 1.0;

    if (aKind < 0.5) {
      // Building edges: cool, brighter toward the roofline.
      dark = mix(uLow * 1.8, uHigh * 0.6, aT);
      lite = mix(uLow, uHigh, 0.6 + aT * 0.3);
      a = 0.55; la = 1.5; s = 0.85;
    } else if (aKind < 1.5) {
      // Windows: warm, each switching on and off on its own slow clock.
      float on = step(0.3, fract(sin(floor(uTime * 0.15 + aRand * 17.0) * 12.9898 + aRand * 78.233) * 43758.5453));
      dark = uWarm * (0.9 + 0.6 * aRand);
      lite = uWarm;
      a = on * 0.95; la = on * 0.9; s = 0.9;
    } else if (aKind < 2.5) {
      // Temples: gold edges; the finials glow.
      float gold = step(0.95, aT);
      dark = mix(uWarm, uHigh, 0.3) * (0.35 + aT * 1.1) + uWarm * gold * 1.2;
      lite = mix(uHigh, uWarm, 0.45 + 0.5 * aT);
      a = 0.5 + 0.5 * aT; s = 1.0 + 0.4 * gold;
    } else if (aKind < 3.5) {
      // Stupas: white domes.
      dark = uHigh * (0.8 + 0.6 * aT);
      lite = mix(uLow, uHigh, 0.6 + 0.3 * aT);
      a = 0.8; s = 0.95;
    } else if (aKind < 4.5) {
      // Prayer flags: blue, white, red, green, yellow.
      vec3 fc = flagColour(aT);
      float flutter = 0.75 + 0.25 * sin(uTime * 3.0 + aRand * 40.0);
      dark = fc * flutter;
      lite = fc * 0.75;
      a = 0.9; s = 0.75;
    } else if (aKind < 5.5) {
      // Rivers: pulses of light flowing downstream.
      float packet = pow(0.5 + 0.5 * sin(aT * 0.55 - uTime * 3.2), 10.0);
      dark = mix(uRiver, mix(uAccent, vec3(1.0), 0.5), packet) * (0.8 + 1.6 * packet);
      lite = mix(uRiver, uAccent, packet);
      a = 0.55 + 0.45 * packet; s = 1.0 + packet * 0.6;
    } else if (aKind < 6.5) {
      if (aT < 0.0) {
        // The halo on the square: a slow breath.
        float b = 0.5 + 0.5 * sin(uTime * 1.6);
        dark = uAccent * (0.6 + b);
        lite = uAccent;
        a = 0.4 + 0.5 * b; s = 1.0;
      } else {
        // The Dharahara: rings of light climbing the tower.
        float climb = pow(0.5 + 0.5 * sin(aT * 34.0 - uTime * 4.0), 8.0);
        dark = mix(mix(uAccent, vec3(1.0), 0.45), vec3(1.0), climb) * (1.2 + 1.4 * climb);
        lite = mix(uHigh, uAccent, 0.55 + 0.45 * climb);
        a = 0.8 + 0.2 * climb; s = 1.35 + climb * 0.5;
      }
    } else if (aKind < 7.5) {
      // The spine of light above the tower.
      float up = pow(0.5 + 0.5 * sin(aT * 40.0 - uTime * 6.0), 12.0);
      dark = mix(uAccent, vec3(1.0), 0.3 + 0.6 * up) * (1.0 + 1.5 * up);
      lite = uAccent;
      a = pow(1.0 - aT, 1.4) * (0.45 + 0.55 * up); la = 0.8; s = 1.3 + up;
    } else if (aKind < 10.5) {
      // The rim and the Himalaya: crests bright, snow on the far peaks,
      // each layer further into the haze.
      float L = aKind - 8.0;
      float crestK = 1.0 - aT;
      dark = mix(uLow * 0.9, uHigh, pow(crestK, 3.0));
      dark += uHigh * pow(crestK, 10.0) * step(1.5, L) * 0.9;
      dark = mix(dark, uHorizon, 0.12 + L * 0.2);
      lite = mix(uLow, uHigh, pow(crestK, 2.0) * (0.95 - L * 0.22));
      lite = mix(lite, uHorizon, L * 0.22);
      a = mix(0.18, 1.0, crestK * crestK); s = 1.1 + L * 0.35;
    } else {
      // Streets and the Ring Road: traffic.
      float packet = pow(0.5 + 0.5 * sin(aT * 1.1 - uTime * (2.0 + aRand * 2.0)), 14.0);
      vec3 car = aRand > 0.5 ? uWarm : uAccent;
      dark = mix(uLow * 1.2, car * 1.4, packet);
      lite = mix(uLow, car, packet);
      a = 0.3 + 0.7 * packet; s = 0.8 + packet * 0.6;
    }

    // Aerial perspective: the far valley and the peaks sink into the haze.
    float f = smoothstep(uFogNear + 80.0, 560.0, dist);
    vec3 col = mix(dark, lite, uTheme);
    vColor = mix(col, mix(uFog, uHorizon, 0.5), f);
    vAlpha = min(1.0, a * mix(1.0, la, uTheme)) * (1.0 - f * 0.85) * k * smoothstep(1.0, 6.0, dist);
    gl_PointSize = clamp(s * 58.0 * uPR / max(dist, 0.1), 1.0 * uPR, 11.0 * uPR);
  }
`;

export function KathmanduValley({ detail }: { detail: number }) {
  const ref = React.useRef<THREE.Points>(null);
  const geometry = React.useMemo(() => buildValley(detail), [detail]);
  const material = React.useMemo(() => glowMaterial({ vertexShader: VERT, fragmentShader: POINT_FRAG }), []);
  React.useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  // Asleep until the camera nears the valley: no draw call before then.
  useFrame(() => {
    if (ref.current) ref.current.visible = WORLD.uFinale.value > 0.002;
  });

  return <points ref={ref} geometry={geometry} material={material} renderOrder={4} visible={false} />;
}
