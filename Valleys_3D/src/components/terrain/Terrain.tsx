/**
 * The mountain range, as a dot matrix.
 *
 * One THREE.Points grid, laid out relative to the river: columns run across
 * the valley, rows down it. The grid is a window that travels with the
 * camera, but it snaps to whole grid steps, so every dot keeps a fixed place
 * in the world and the range never swims. Heights, colour, the pointer's
 * pool of light, the click ripple and the surges running down the valley are
 * all computed in the vertex shader; the CPU uploads the grid once.
 *
 * Two looks, crossfaded by uTheme: in the dark, dots are light that the bloom
 * pass picks up on the crests; in the light, they are graphite ink on
 * porcelain, and emphasis darkens instead of glowing.
 *
 * Opaque sprites that write depth, so depth of field can focus on the ground.
 */
import * as React from "react";
import * as THREE from "three";
import { FIELD_GLSL } from "./field";
import { FOG_GLSL, WORLD } from "./world";

/** Half-width across the valley and the run of the window, in world units. */
const HALF = 120;
const BEHIND = -25;
const AHEAD = 250;

const VERT = /* glsl */ `
  uniform float uTime, uCamZ, uPR, uRise, uVel, uPointerK, uStep, uTheme;
  uniform vec2 uPointer;
  uniform vec3 uPing, uLow, uHigh, uRiver, uAccent;
  attribute float aRand;
  varying vec3 vColor;
  ${FIELD_GLSL}
  ${FOG_GLSL}
  void main() {
    float zSnap = floor(uCamZ / uStep) * uStep;
    float wz = position.z + zSnap;
    float wx = position.x + riverX(wz);
    vec4 t = terrain(wx, wz);

    // On load the flat grid rises into mountains, the valley floor first.
    float rise = clamp(uRise * 1.7 - abs(position.x) / 160.0 - aRand * 0.12, 0.0, 1.0);
    rise = rise * rise * (3.0 - 2.0 * rise);
    float h = mix(-0.9, t.x, rise);
    vec3 wp = vec3(wx, h, wz);

    // Screen-space interaction: a pool of light under the pointer and the
    // ripple from the last click, both measured in the viewport.
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(wp, 1.0);
    vec2 ndc = clip.xy / max(clip.w, 1e-3);
    float aspect = projectionMatrix[1][1] / projectionMatrix[0][0];
    vec2 dm = (ndc - uPointer) * vec2(aspect, 1.0);
    float pm = exp(-dot(dm, dm) * 18.0) * uPointerK * step(0.0, clip.w);
    float age = uTime - uPing.z;
    float pr = length((ndc - uPing.xy) * vec2(aspect, 1.0));
    float ring = (age >= 0.0 && age < 3.2) ? exp(-pow((pr - age * 0.85) * 8.0, 2.0)) * (1.0 - age / 3.2) : 0.0;
    wp.y += (pm * 2.4 + ring * 1.8) * (0.5 + t.z) * (1.0 - t.w * 0.7);

    vec4 mv = modelViewMatrix * vec4(wp, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;

    // What the dot is: height, crest, contour line, matrix line, river glow, surge.
    float hk = clamp(h / 34.0, 0.0, 1.0);
    float crest = pow(t.y, 5.0) * smoothstep(4.0, 18.0, h);
    float ct = 1.0 - abs(fract(h / 4.0) - 0.5) * 2.0;
    float contour = smoothstep(0.86, 1.0, ct) * smoothstep(1.5, 6.0, h);
    vec2 gi = abs(fract(vec2(position.x, wz) / (uStep * 8.0) + 0.5) - 0.5) * 8.0;
    float gridLine = step(min(gi.x, gi.y), 0.5);
    float floorGlow = (1.0 - t.z) * (1.0 - t.z) * (1.0 - t.w);
    float flow = 0.3 + 0.22 * sin(wz * 0.3 - uTime * 3.0);
    float band = fract((wz - uTime * 22.0) / 150.0);
    float surge = exp(-pow(band - 0.5, 2.0) * 1400.0) * (0.18 + 0.5 * hk) * (1.0 + abs(uVel) * 6.0) * rise;
    float flick = 0.84 + 0.16 * sin(uTime * (1.2 + aRand * 2.3) + aRand * 60.0);
    float emph = crest * 1.9 + contour * 0.55;
    vec3 touch = mix(uHigh, uAccent, 0.45);

    // Dark: light added on obsidian.
    vec3 dark = mix(uLow * 1.1, uHigh * 0.8, pow(hk, 0.95));
    dark += uHigh * emph + uRiver * floorGlow * flow + uHigh * surge;
    dark *= 1.0 + 0.4 * gridLine;
    dark += mix(touch, vec3(1.0), 0.3) * (pm * 0.9 + ring * 1.3);
    dark *= flick;
    // The basin floor stays quiet so the city carries the finale.
    dark *= 1.0 - t.w * 0.55;

    // Light: ink on porcelain. Emphasis darkens and saturates.
    vec3 lite = mix(uLow, uHigh, 0.42 + 0.55 * pow(hk, 0.8));
    lite = mix(lite, uHigh, clamp(emph * 0.6 + gridLine * 0.12, 0.0, 1.0));
    lite = mix(lite, uRiver, clamp(floorGlow * flow * 1.6 + surge * 0.8, 0.0, 1.0));
    lite = mix(lite, uAccent, clamp(pm * 0.7 + ring, 0.0, 1.0));
    lite = mix(lite, uLow, t.w * 0.35);

    vec3 col = mix(dark, lite, uTheme);
    vColor = mix(col, uFog, fogK(dist));

    float size = uStep * 58.0 * (0.72 + 0.56 * aRand) * (1.0 + crest * 0.9 + pm * 1.6 + ring * 1.2);
    // Ink needs a little more weight than light to read at the same size.
    size *= mix(1.0, 1.18, uTheme);
    gl_PointSize = clamp(size * uPR / max(dist, 0.1), 1.0 * uPR, 7.5 * uPR);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTheme;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // Dark: a lit core. Light: a flat ink dot, a touch darker at its heart.
    vec3 col = mix(vColor * (0.55 + 0.75 * core), vColor * (1.06 - 0.12 * core), uTheme);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Terrain({ step }: { step: number }) {
  const geometry = React.useMemo(() => {
    const nx = Math.floor((HALF * 2) / step) + 1;
    const nz = Math.floor((AHEAD - BEHIND) / step) + 1;
    const pos = new Float32Array(nx * nz * 3);
    const rnd = new Float32Array(nx * nz);
    let i = 0;
    for (let r = 0; r < nz; r++) {
      for (let c = 0; c < nx; c++, i++) {
        pos[i * 3] = -HALF + c * step;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = BEHIND + r * step;
        rnd[i] = Math.random();
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [step]);

  const material = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { ...WORLD, uStep: { value: step } },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    [step],
  );

  React.useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  // The window follows the camera and every dot is placed in the shader, so
  // CPU frustum culling has nothing to gain here.
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/** Dots in the grid at a given spacing, for the HUD. */
export const terrainDotCount = (step: number) =>
  (Math.floor((HALF * 2) / step) + 1) * (Math.floor((AHEAD - BEHIND) / step) + 1);
