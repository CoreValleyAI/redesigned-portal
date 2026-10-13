"use client";

/**
 * Turns on liquid-glass refraction (lib/glass/refract.ts) for every element
 * marked [data-refract] on the page, in browsers that can paint it, and
 * keeps up as the page changes (navigation, carousels, panels). Elements
 * whose glass the WebGL scene draws ([data-glass="gl"]) are left alone.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { canRefract, refract } from "@/lib/glass/refract";

export function GlassRefraction() {
  const pathname = usePathname();
  useEffect(() => {
    if (!canRefract()) return;
    const live = new Map<HTMLElement, () => void>();
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>("[data-refract]")) {
        if (live.has(el) || el.dataset.glass === "gl") continue;
        const bezel = Number(el.dataset.refractBezel) || undefined;
        live.set(el, refract(el, { bezel }));
      }
      for (const [el, stop] of live) {
        if (!el.isConnected || el.dataset.glass === "gl") {
          stop();
          live.delete(el);
        }
      }
    };
    scan();
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-glass"] });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(queued);
      for (const stop of live.values()) stop();
    };
  }, [pathname]);
  return null;
}
