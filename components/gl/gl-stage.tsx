"use client";

/**
 * <GLStage> — a canvas that hosts one WebGL scene (lib/gl/stage.ts), filling
 * its positioned parent. It waits until the page has painted and the browser
 * is idle, loads the scene's code, and fades the canvas in over whatever
 * poster sits beneath it once the first frame is drawn. Without WebGL2, or
 * with reduced motion and `still` set, nothing is mounted and the poster
 * simply stays.
 *
 * The canvas is decorative (aria-hidden): the meaning lives in the DOM.
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { SceneFactory, Stage } from "@/lib/gl/stage";

export function GLStage({
  load,
  className,
  progress,
  pointerTarget,
  onStage,
  onShown,
}: {
  /** Dynamic import of the scene, so its code loads only when needed. */
  load: () => Promise<SceneFactory>;
  className?: string;
  /** Subscribe the stage to a progress source (scroll); returns an unsubscribe. */
  progress?: (set: (p: number) => void) => () => void;
  /** Pointer events over this element (by id) light the scene. */
  pointerTarget?: string;
  onStage?: (stage: Stage | null) => void;
  /** The first frame is on screen (or the stage gave up: false). */
  onShown?: (shown: boolean) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stage: Stage | null = null;
    let offProgress: (() => void) | null = null;
    let cancelled = false;

    const start = async () => {
      const [{ Stage }, factory] = await Promise.all([import("@/lib/gl/stage"), load()]);
      if (cancelled) return;
      const target = pointerTarget ? (document.getElementById(pointerTarget) ?? undefined) : undefined;
      stage = new Stage(canvas, factory, {
        pointerTarget: target,
        onReady: () => {
          setShown(true);
          onShown?.(true);
        },
        onFail: () => {
          setShown(false);
          onShown?.(false);
        },
      });
      onStage?.(stage);
      if (progress) offProgress = progress((p) => stage?.setProgress(p));
      await stage.mount();
    };

    // After first paint, when the main thread is free (LCP is never delayed).
    // Safari has no requestIdleCallback; a short timeout stands in.
    const w = window as Window & {
      requestIdleCallback?: Window["requestIdleCallback"];
      cancelIdleCallback?: Window["cancelIdleCallback"];
    };
    const viaIdle = typeof w.requestIdleCallback === "function";
    const handle = viaIdle
      ? w.requestIdleCallback!(() => void start(), { timeout: 1200 })
      : window.setTimeout(() => void start(), 300);

    return () => {
      cancelled = true;
      if (viaIdle) w.cancelIdleCallback?.(handle);
      else window.clearTimeout(handle);
      offProgress?.();
      stage?.dispose();
      onStage?.(null);
    };
    // The scene is chosen once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full transition-opacity duration-[1200ms] ease-out",
        shown ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
