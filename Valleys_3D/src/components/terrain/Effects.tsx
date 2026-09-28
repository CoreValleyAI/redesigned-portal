/**
 * The lens. Bloom makes the crests, the river and the packets glow; depth of
 * field focuses where the camera looks and softens the near ground and the
 * far range; a touch of chromatic aberration at the edges, film grain and a
 * vignette finish it.
 *
 * Themes: in the dark, ACES folds the bloom's HDR back into range; in the
 * light, neutral tone mapping keeps porcelain white, bloom stops, the lens
 * sharpens and the grain and vignette lighten. All of it changes on the live effects, with no
 * pass rebuilt.
 *
 * Costly passes follow the quality tier: depth of field only on the top tier,
 * aberration from the middle one up, fewer bloom mip levels on low.
 */
import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type BloomEffect, type DepthOfFieldEffect, type NoiseEffect, type ToneMappingEffect, type VignetteEffect } from "postprocessing";
import type { Quality } from "../../lib/quality";
import { live } from "./Director";
import { WORLD } from "./world";

export function Effects({ quality }: { quality: Quality }) {
  const bloom = React.useRef<BloomEffect>(null);
  const dof = React.useRef<DepthOfFieldEffect>(null);
  const tone = React.useRef<ToneMappingEffect>(null);
  const vignette = React.useRef<VignetteEffect>(null);
  const grain = React.useRef<NoiseEffect>(null);
  const aberration = React.useMemo(() => new THREE.Vector2(0.0007, 0.0005), []);

  useFrame(() => {
    const th = WORLD.uTheme.value;
    if (bloom.current) {
      // Porcelain sits near any threshold: in the light, bloom would only
      // spread a white haze over the frame, so it fades out entirely.
      bloom.current.intensity = live.bloom * (1 - th);
      bloom.current.luminanceMaterial.threshold = 0.32 + th * 0.9;
    }
    if (dof.current) {
      dof.current.cocMaterial.worldFocusDistance = live.focus;
      // Blur turns light dots on black into bokeh, but averages ink dots on
      // porcelain into the paper: keep the lens nearly sharp in the light.
      dof.current.bokehScale = 2.4 * (1 - 0.85 * th);
    }
    if (tone.current) {
      const mode = th > 0.5 ? ToneMappingMode.NEUTRAL : ToneMappingMode.ACES_FILMIC;
      if (tone.current.mode !== mode) tone.current.mode = mode;
    }
    if (vignette.current) vignette.current.darkness = 0.72 - th * 0.5;
    // Fringes that read as a lens on light read as misregistration on ink.
    aberration.set(0.0007, 0.0005).multiplyScalar(1 - 0.75 * th);
    // Grain that reads as film on black reads as static on porcelain.
    if (grain.current) grain.current.blendMode.opacity.value = 0.3 - th * 0.26;
  });

  const passes = [
    quality.dof ? <DepthOfField key="dof" ref={dof} worldFocusDistance={34} worldFocusRange={70} bokehScale={2.4} resolutionScale={0.5} /> : null,
    <Bloom key="bloom" ref={bloom} mipmapBlur intensity={1} luminanceThreshold={0.32} luminanceSmoothing={0.35} levels={quality.bloomLevels} radius={0.78} />,
    quality.chroma ? <ChromaticAberration key="ca" offset={aberration} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} /> : null,
    <ToneMapping key="tm" ref={tone} mode={ToneMappingMode.ACES_FILMIC} />,
    <Noise key="grain" ref={grain} premultiply opacity={0.3} blendFunction={BlendFunction.SOFT_LIGHT} />,
    <Vignette key="vig" ref={vignette} offset={0.28} darkness={0.72} />,
  ].filter((p): p is React.JSX.Element => p !== null);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {passes}
    </EffectComposer>
  );
}
