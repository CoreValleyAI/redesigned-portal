/**
 * Stage — runs one WebGL2 scene inside one canvas (docs/revamp/09 §3).
 *
 * Each GL moment on the site lives in its own canvas inside its own DOM box,
 * so it scrolls with the page on the compositor and never drifts from the
 * layout on phones (a single fixed canvas would lag native scrolling). The
 * Stage gives a scene everything it needs and nothing it has to manage:
 *
 *  · the context (WebGL2, no antialias, premultiplied alpha over the page);
 *  · size and pixel ratio, capped by quality tier, kept current;
 *  · the frame: driven by the site's one clock (lib/motion/clock), paused
 *    when off-screen or in a hidden tab, and asleep whenever the scene says
 *    it has nothing to animate;
 *  · input: a damped pointer (fine pointers), or the finger on touch
 *    screens, followed through a whole swipe as the page scrolls under it;
 *    the page's scroll velocity, for scenes that feel the scroll;
 *  · the palette, read from the CSS tokens and eased on theme change;
 *  · resilience: context loss stops the scene and shows the poster, a
 *    restore rebuilds it; frame-time watching steps quality down if the
 *    device is struggling.
 */
import { onFrame, wake } from "@/lib/motion/clock";
import { readFinger, scrollVelocity } from "@/lib/motion/input";
import { damp } from "@/lib/motion/spring";
import { readPalette, subscribePrefs, type GLPalette, type RGB } from "@/lib/theme";

export type Tier = 1 | 2 | 3;

export interface Pointer {
  /** Position in normalised device coordinates (−1…1, y up). */
  x: number;
  y: number;
  /** 0 when away, easing to 1 while the pointer (or a held touch) is over the stage. */
  presence: number;
  /** True while a finger is on the screen over the stage. */
  down: boolean;
}

export interface FrameInfo {
  time: number;
  dt: number;
  pointer: Pointer;
  /** 0…1, set by the host (scroll progress through its section). */
  progress: number;
  palette: GLPalette;
  reduced: boolean;
  /** The page's scroll velocity, px/s, damped (positive: moving down). */
  scrollVel: number;
  /** Recent taps and clicks on the stage, newest last (at most three):
      where (normalised device coordinates) and when (`time` units). */
  taps: readonly Tap[];
}

export interface Tap {
  x: number;
  y: number;
  t: number;
}

export interface SceneContext {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  tier: Tier;
  reduced: boolean;
  /** Ask for a frame: for scenes that react to events of their own (an
      observer, a timer) between the Stage's own reasons to draw. */
  invalidate: () => void;
}

export interface Scene {
  /** Called on every size or pixel-ratio change (drawing-buffer pixels). */
  resize(width: number, height: number, dpr: number): void;
  /** Draw one frame. Return true to ask for another. */
  frame(info: FrameInfo): boolean;
  dispose(): void;
}

export type SceneFactory = (ctx: SceneContext) => Promise<Scene> | Scene;

export interface StageOptions {
  /** Called once the first frame has been drawn (the poster can fade). */
  onReady?: () => void;
  /** Called when the stage gives up (no WebGL2, repeated context loss). */
  onFail?: (reason: string) => void;
  /** Element whose pointer events light the scene (defaults to the canvas). */
  pointerTarget?: HTMLElement;
}

/** A first guess at quality from what the browser will tell us. Runtime
    frame timing corrects it either way. */
export function initialTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (nav.connection?.saveData) return 1;
  if (mem <= 3 || cores <= 4) return 1;
  if (coarse) return 2; // phones are capped at Tier 2
  return 3;
}

const MAX_DPR: Record<Tier, number> = { 1: 1, 2: 1.5, 3: 2 };

export class Stage {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private scene: Scene | null = null;
  private factory: SceneFactory;
  private opts: StageOptions;
  private tier: Tier;
  private reduced: boolean;
  private visible = false;
  private needs = true;
  private ready = false;
  private disposed = false;
  private offFrame: (() => void) | null = null;
  private cleanups: (() => void)[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;
  private start = performance.now();
  private progress = 0;
  private pointer: Pointer = { x: 0, y: 0, presence: 0, down: false };
  private pointerTarget = { x: 0, y: 0, inside: false };
  private taps: Tap[] = [];
  private palette: GLPalette;
  private paletteTarget: GLPalette;
  private slowFrames = 0;
  private losses = 0;
  private fine = true;
  /** The finger, not a mouse, is placing the light. */
  private touchLit = false;
  private touchTarget: HTMLElement | null = null;

  constructor(canvas: HTMLCanvasElement, factory: SceneFactory, opts: StageOptions = {}) {
    this.canvas = canvas;
    this.factory = factory;
    this.opts = opts;
    this.tier = initialTier();
    this.reduced = document.documentElement.dataset.motion === "reduce";
    this.palette = readPalette();
    this.paletteTarget = this.palette;
  }

  async mount() {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: this.tier === 3 ? "high-performance" : "default",
    });
    if (!gl) {
      this.opts.onFail?.("no-webgl2");
      return;
    }
    this.gl = gl;
    this.observe();
    await this.build();
  }

  private async build() {
    const gl = this.gl;
    if (!gl || this.disposed) return;
    try {
      this.scene = await this.factory({
        gl,
        canvas: this.canvas,
        tier: this.tier,
        reduced: this.reduced,
        invalidate: () => {
          this.needs = true;
          if (this.visible) wake();
        },
      });
    } catch (err) {
      console.error("[stage]", err);
      this.opts.onFail?.("scene-failed");
      return;
    }
    if (this.disposed) {
      this.scene.dispose();
      return;
    }
    this.measure(true);
    this.needs = true;
    this.offFrame = onFrame((now, dt) => this.tick(now, dt));
  }

  /** The host's scroll progress through its section. */
  setProgress(p: number) {
    if (Math.abs(p - this.progress) < 1e-4) return;
    this.progress = p;
    this.needs = true;
    if (this.visible) wake();
  }

  private observe() {
    const io = new IntersectionObserver(
      ([e]) => {
        this.visible = Boolean(e?.isIntersecting);
        if (this.visible) {
          this.needs = true;
          wake();
        }
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(this.canvas);
    this.cleanups.push(() => io.disconnect());

    const ro = new ResizeObserver(() => {
      this.measure(false);
      wake();
    });
    ro.observe(this.canvas);
    this.cleanups.push(() => ro.disconnect());

    // Pointer: fine pointers light the scene as they move. On touch screens
    // the finger does while it is down (followFinger, polled per frame, so
    // listening never holds up scrolling).
    const target = this.opts.pointerTarget ?? this.canvas;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    this.fine = fine;
    const setFrom = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointerTarget.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.pointerTarget.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onMove = (e: PointerEvent) => {
      // Touch and pen are followed through the finger poll in tick().
      if (e.pointerType !== "mouse" || !fine) return;
      setFrom(e);
      this.pointerTarget.inside = true;
      this.needs = true;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      // A tap or click on the stage itself (not on a control over it) is
      // something a scene can answer, like a ripple.
      const control = e.target instanceof Element && e.target.closest("a, button, input, select, textarea, label");
      if (!control && !this.reduced) {
        const r = this.canvas.getBoundingClientRect();
        this.taps = [
          ...this.taps.slice(-2),
          {
            x: ((e.clientX - r.left) / r.width) * 2 - 1,
            y: -(((e.clientY - r.top) / r.height) * 2 - 1),
            t: (performance.now() - this.start) / 1000,
          },
        ];
        this.needs = true;
        wake();
      }
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      this.pointerTarget.inside = false;
      this.needs = true;
      wake();
    };
    target.addEventListener("pointermove", onMove, { passive: true });
    target.addEventListener("pointerdown", onDown, { passive: true });
    target.addEventListener("pointerleave", onLeave, { passive: true });
    this.cleanups.push(() => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerdown", onDown);
      target.removeEventListener("pointerleave", onLeave);
    });
    this.touchTarget = target;

    // Theme and motion changes.
    this.cleanups.push(
      subscribePrefs(() => {
        this.paletteTarget = readPalette();
        this.reduced = document.documentElement.dataset.motion === "reduce";
        this.needs = true;
        wake();
      }),
    );

    // Context loss: stop, show the poster; a restore rebuilds the scene.
    const lost = (e: Event) => {
      e.preventDefault();
      this.losses++;
      this.scene = null;
      this.ready = false;
      this.offFrame?.();
      this.offFrame = null;
      this.opts.onFail?.("context-lost");
    };
    const restored = () => {
      if (this.losses > 2) return; // give up after repeated losses
      void this.build();
    };
    this.canvas.addEventListener("webglcontextlost", lost);
    this.canvas.addEventListener("webglcontextrestored", restored);
    this.cleanups.push(() => {
      this.canvas.removeEventListener("webglcontextlost", lost);
      this.canvas.removeEventListener("webglcontextrestored", restored);
    });
  }

  private measure(force: boolean) {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR[this.tier]);
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (!force && w === this.width && h === this.height && dpr === this.dpr) return;
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.canvas.width = w;
    this.canvas.height = h;
    this.scene?.resize(w, h, dpr);
    this.needs = true;
  }

  private tick(now: number, dt: number): boolean {
    if (!this.scene || !this.gl || this.disposed) return false;
    if (!this.visible || document.hidden) return false;

    if (!this.fine) this.followFinger(now);

    // Ease the pointer and the palette. Light that follows a hand or a
    // finger is direct manipulation, so it stays with reduced motion too.
    const p = this.pointer;
    const t = this.pointerTarget;
    const half = this.reduced ? 0 : this.touchLit ? 0.035 : 0.06;
    p.x = damp(p.x, t.x, half, dt);
    p.y = damp(p.y, t.y, half, dt);
    const presenceTarget = t.inside ? 1 : 0;
    p.presence = damp(p.presence, presenceTarget, 0.12, dt);
    const pointerMoving =
      Math.abs(p.x - t.x) > 1e-3 || Math.abs(p.y - t.y) > 1e-3 || Math.abs(p.presence - presenceTarget) > 1e-3;
    const paletteMoving = this.easePalette(dt);

    if (!this.needs && !pointerMoving && !paletteMoving) return false;

    const started = performance.now();
    const more = this.scene.frame({
      time: (now - this.start) / 1000,
      dt,
      pointer: p,
      progress: this.progress,
      palette: this.palette,
      reduced: this.reduced,
      scrollVel: this.reduced ? 0 : scrollVelocity(),
      taps: this.taps,
    });
    this.needs = more;
    if (!this.ready) {
      this.ready = true;
      this.opts.onReady?.();
    }
    this.watch(performance.now() - started, dt);
    return more || pointerMoving || paletteMoving;
  }

  /** Touch screens: light where the finger is while it is down over the
      stage's target (and for a moment after it lifts, so a tap shows),
      following it as the page scrolls beneath. */
  private followFinger(now: number) {
    const f = readFinger();
    const held = f.down || (f.t > 0 && now - f.t < 420);
    const t = this.pointerTarget;
    if (!held) {
      if (this.touchLit) {
        this.touchLit = false;
        this.pointer.down = false;
        t.inside = false;
        this.needs = true;
      }
      return;
    }
    const area = (this.touchTarget ?? this.canvas).getBoundingClientRect();
    const over = f.x >= area.left && f.x <= area.right && f.y >= area.top && f.y <= area.bottom;
    if (!over && !this.touchLit) return;
    const r = this.canvas.getBoundingClientRect();
    const x = ((f.x - r.left) / Math.max(1, r.width)) * 2 - 1;
    const y = -(((f.y - r.top) / Math.max(1, r.height)) * 2 - 1);
    if (x !== t.x || y !== t.y || t.inside !== over) this.needs = true;
    t.x = x;
    t.y = y;
    t.inside = over;
    this.pointer.down = f.down && over;
    this.touchLit = over;
  }

  /** Step quality down if frames are consistently slow. */
  private watch(cpuMs: number, dt: number) {
    if (dt > 1 / 40 || cpuMs > 12) this.slowFrames++;
    else this.slowFrames = Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 90 && this.tier > 1) {
      this.slowFrames = 0;
      this.tier = (this.tier - 1) as Tier;
      this.measure(true);
    }
  }

  private easePalette(dt: number): boolean {
    let moving = false;
    const ease = (a: RGB, b: RGB): RGB => {
      const out: [number, number, number] = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        out[i] = damp(a[i]!, b[i]!, this.reduced ? 0 : 0.12, dt);
        if (Math.abs(out[i]! - b[i]!) > 1e-3) moving = true;
      }
      return out;
    };
    const a = this.palette;
    const b = this.paletteTarget;
    if (a === b) return false;
    this.palette = {
      theme: b.theme,
      bg: ease(a.bg, b.bg),
      ink: ease(a.ink, b.ink),
      ink3: ease(a.ink3, b.ink3),
      hydro: ease(a.hydro, b.hydro),
      dotOff: ease(a.dotOff, b.dotOff),
      glow2: ease(a.glow2, b.glow2),
      glow3: ease(a.glow3, b.glow3),
    };
    if (!moving) this.palette = b;
    return moving;
  }

  dispose() {
    this.disposed = true;
    this.offFrame?.();
    for (const c of this.cleanups) c();
    this.scene?.dispose();
    this.scene = null;
    // Free the context now rather than waiting for GC.
    this.gl?.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl = null;
  }
}
