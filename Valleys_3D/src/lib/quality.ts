/**
 * GPU tiers. The first guess comes from the device (screen, cores, memory,
 * renderer string); after that, drei's PerformanceMonitor measures real frame
 * times and steps the tier down (or back up) to hold 60 fps.
 */

export type Tier = 0 | 1 | 2; // low · medium · high

export interface Quality {
  tier: Tier;
  /** Device-pixel-ratio ceiling for the canvas. */
  dpr: number;
  /** Terrain dot spacing in world units: smaller is denser. */
  step: number;
  /** Particles in the data river. */
  river: number;
  /** Post-processing passes that cost the most. */
  dof: boolean;
  chroma: boolean;
  bloomLevels: number;
}

export const QUALITY: Record<Tier, Quality> = {
  0: { tier: 0, dpr: 1, step: 1.0, river: 5000, dof: false, chroma: false, bloomLevels: 4 },
  1: { tier: 1, dpr: 1.25, step: 0.72, river: 10000, dof: false, chroma: true, bloomLevels: 6 },
  2: { tier: 2, dpr: 1.75, step: 0.55, river: 16000, dof: true, chroma: true, bloomLevels: 8 },
};

export function guessTier(): Tier {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  let renderer = "";
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    renderer = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* no renderer string: keep the heuristic */
  }
  const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  const integrated = /intel|uhd|iris|mali|adreno|powervr|apple gpu/i.test(renderer);
  if (software || small || cores <= 4 || mem <= 4) return 0;
  if (integrated) return 1;
  return 2;
}
