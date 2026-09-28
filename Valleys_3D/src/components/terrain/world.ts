/**
 * Uniforms every material in the scene shares. One object, referenced (not
 * copied) by each ShaderMaterial, so the director updates the whole world by
 * writing here once per frame.
 */
import * as THREE from "three";

export const WORLD = {
  uTime: { value: 0 },
  /** Camera z, for the terrain window that travels with it. */
  uCamZ: { value: 0 },
  uPR: { value: 1 },
  /** Terrain rises out of the flat grid on load: 0 → 1. */
  uRise: { value: 0 },
  /** Flight speed (progress per second), for the surge effects. */
  uVel: { value: 0 },
  /** 0 dark → 1 light, crossfaded by the director. */
  uTheme: { value: 0 },
  /** 0 → 1 as the camera reaches the Kathmandu Valley. */
  uFinale: { value: 0 },
  uPointer: { value: new THREE.Vector2(0, 0) },
  uPointerK: { value: 0 },
  /** Last click: NDC x, y and scene time. */
  uPing: { value: new THREE.Vector3(0, 0, -100) },
  uLow: { value: new THREE.Color() },
  uHigh: { value: new THREE.Color() },
  uRiver: { value: new THREE.Color() },
  uAccent: { value: new THREE.Color() },
  uWarm: { value: new THREE.Color() },
  uFog: { value: new THREE.Color() },
  uSky: { value: new THREE.Color() },
  uHorizon: { value: new THREE.Color() },
  uFogNear: { value: 60 },
  uFogFar: { value: 230 },
};

export type WorldUniforms = typeof WORLD;

/**
 * Glow materials: additive light on the dark sky, ordinary alpha on the
 * porcelain one (adding light to white only washes it out). The director
 * flips them when the theme crossfade passes its midpoint, where both looks
 * are at their faintest.
 */
export const GLOW_MATERIALS = new Set<THREE.ShaderMaterial>();

export function glowMaterial(params: THREE.ShaderMaterialParameters) {
  const m = new THREE.ShaderMaterial({
    uniforms: WORLD,
    transparent: true,
    depthWrite: false,
    blending: WORLD.uTheme.value > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending,
    ...params,
  });
  GLOW_MATERIALS.add(m);
  const dispose = m.dispose.bind(m);
  m.dispose = () => {
    GLOW_MATERIALS.delete(m);
    dispose();
  };
  return m;
}

/** Fog, shared by every shader: mix to the fog colour by view distance. */
export const FOG_GLSL = /* glsl */ `
  uniform vec3 uFog;
  uniform float uFogNear, uFogFar;
  float fogK(float dist) { return smoothstep(uFogNear, uFogFar, dist); }
`;

/** Round, soft-edged point sprite for the glow layers. */
export const POINT_FRAG = /* glsl */ `
  uniform float uTheme;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // Dark: a bright core that blooms. Light: an even, ink-like dot.
    vec3 col = mix(vColor * (0.55 + 0.9 * core), vColor, uTheme);
    float a = mix(vAlpha * core, min(1.0, vAlpha * 1.25) * smoothstep(0.5, 0.32, d), uTheme);
    gl_FragColor = vec4(col, a);
  }
`;
