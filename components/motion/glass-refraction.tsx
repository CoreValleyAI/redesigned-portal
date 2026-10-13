"use client";

/**
 * Turns on liquid-glass refraction (lib/glass/refract.ts) for every element
 * marked [data-refract] on the page, in browsers that can paint it, and
 * keeps up as the page changes (navigation, carousels, panels). It waits
 * for the page to settle and bends each element only as it nears the
 * screen, in idle time. Elements whose glass the WebGL scene draws ([data-glass="gl"]) are left alone.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { canRefract, refract } from "@/lib/glass/refract";

export function GlassRefraction() {
  const pathname = usePathname();
  useEffect(() => {
    if (!canRefract()) return;
    const live = new Map<HTMLElement, () => void>();
    const seen = new WeakSet<HTMLElement>();
    const w = window as Window & { requestIdleCallback?: Window["requestIdleCallback"] };
    const idle = (fn: () => void) =>
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(fn, { timeout: 1500 })
        : window.setTimeout(fn, 200);

    // Glass is bent only once it comes near the screen, in idle time, one
    // element per idle slice: nothing of this runs during page load.
    const queue: HTMLElement[] = [];
    let pumping = false;
    const pump = () => {
      const el = queue.shift();
      if (!el) {
        pumping = false;
        return;
      }
      if (el.isConnected && el.dataset.glass !== "gl" && !live.has(el)) {
        live.set(el, refract(el, { bezel: Number(el.dataset.refractBezel) || undefined }));
      }
      idle(pump);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          queue.push(e.target as HTMLElement);
        }
        if (queue.length && !pumping) {
          pumping = true;
          idle(pump);
        }
      },
      { rootMargin: "50% 0px" },
    );
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>("[data-refract]")) {
        if (seen.has(el) || el.dataset.glass === "gl") continue;
        seen.add(el);
        io.observe(el);
      }
      for (const [el, stop] of live) {
        if (!el.isConnected || el.dataset.glass === "gl") {
          stop();
          live.delete(el);
        }
      }
    };
    // Start after the page has settled.
    const first = window.setTimeout(scan, 1200);
    // New glass (a panel opening, a filtered list) is picked up within half
    // a second; live pictures re-rendering cost a timer, not a scan each.
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = window.setTimeout(() => {
        queued = 0;
        scan();
      }, 500);
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-glass"] });
    return () => {
      window.clearTimeout(first);
      mo.disconnect();
      io.disconnect();
      window.clearTimeout(queued);
      for (const stop of live.values()) stop();
    };
  }, [pathname]);
  return null;
}
