"use client";

/**
 * The WebGL valley behind the home hero (S1). Mounted after first paint;
 * the CSS poster in hero-valley.tsx shows until the first frame, then the
 * poster's dot plane fades away (data-gl on the hero section). The pointer
 * anywhere over the hero lights the valley; scrolling the hero away lowers
 * the camera into it.
 */
import { GLStage } from "@/components/gl/gl-stage";
import { trackScroll } from "@/lib/motion/scroll";

export function ValleyStage() {
  return (
    <GLStage
      load={() => import("@/components/gl/scenes/valley").then((m) => m.createValleyScene)}
      pointerTarget="hero"
      progress={(set) => {
        const hero = document.getElementById("hero");
        return hero ? trackScroll(hero, "leave", set, 0.06) : () => {};
      }}
      onShown={(shown) => {
        const hero = document.getElementById("hero");
        if (!hero) return;
        hero.dataset.gl = shown ? "on" : "off";
        // Without the scene, its glass panels go back to CSS glass.
        if (!shown) for (const el of hero.querySelectorAll<HTMLElement>("[data-glass]")) delete el.dataset.glass;
      }}
    />
  );
}
