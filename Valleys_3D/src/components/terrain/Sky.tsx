/**
 * The sky: a dome that travels with the camera. A graded gradient from the
 * horizon band to the zenith and a haze that meets the terrain's fog. In the
 * dark, a sparse field of twinkling stars; in the light, a soft sun glow
 * low over the far range. Drawn first, behind everything.
 */
import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { FIELD_GLSL } from "./field";
import { WORLD } from "./world";

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uSky, uHorizon, uFog, uAccent;
  uniform float uTime, uTheme, uFinale;
  varying vec3 vDir;
  ${FIELD_GLSL}
  void main() {
    vec3 d = normalize(vDir);
    float e = d.y;
    vec3 col = mix(uHorizon, uSky, smoothstep(0.0, 0.42, e));
    col = mix(uFog, col, smoothstep(-0.06, 0.02, e));
    // The horizon band: a glow in the dark, a pale haze in the light.
    col += uHorizon * exp(-abs(e - 0.01) * 26.0) * mix(0.9, 0.08, uTheme);
    // Over the Kathmandu Valley the dark sky takes a faint accent aurora.
    col += uAccent * exp(-abs(e - 0.08) * 9.0) * 0.08 * uFinale * (1.0 - uTheme);

    // Stars: one candidate per cell of a lat-long grid, most of them dark.
    vec2 sph = vec2(atan(d.z, d.x), asin(clamp(e, -1.0, 1.0))) * 120.0;
    vec2 cell = floor(sph);
    float h = hash12(cell);
    vec2 f = fract(sph) - 0.5 - (vec2(hash12(cell + 3.1), hash12(cell + 7.7)) - 0.5) * 0.6;
    float star = step(0.985, h) * smoothstep(0.16, 0.0, length(f));
    float tw = 0.55 + 0.45 * sin(uTime * (1.0 + h * 3.0) + h * 80.0);
    col += vec3(0.75, 0.95, 1.0) * star * tw * smoothstep(0.03, 0.25, e) * 0.9 * (1.0 - uTheme);

    // Light: a diffuse sun low ahead, warming the haze.
    float sun = max(dot(d, normalize(vec3(0.25, 0.18, 1.0))), 0.0);
    col += vec3(1.0, 0.96, 0.9) * pow(sun, 24.0) * 0.12 * uTheme;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Sky() {
  const ref = React.useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  const material = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: WORLD,
        vertexShader: VERT,
        fragmentShader: FRAG,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  React.useEffect(() => () => material.dispose(), [material]);
  useFrame(() => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[480, 48, 24]} />
    </mesh>
  );
}
