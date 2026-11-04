/**
 * "Light under the glass" (home, below the hero): one soft light behind a
 * section's panes of glass, drawn so the panes can be made of it — the same
 * glass as the hero's buttons over the valley (lib/gl/glass.ts): it bends
 * the light at the rim, splits its colours a little, and catches a glint
 * on the side that faces it.
 *
 * The light follows the pointer across the panes (a finger, while one is
 * down) and rests at the top left of them, the side the rim is lit from.
 * It lives under the panes: soft on black, gathered to the box the panes
 * make and fading within a short reach of it, so the headings and links
 * beside them stay on near-black and even the quietest grey keeps its
 * contrast. The canvas is otherwise transparent: the page shows through,
 * and a theme switch never flashes a block.
 *
 * Silk draft (branch preview-silk, served at /preview-silk/): beneath the
 * light, slow folds of hydro-to-teal sheen drift across the section, almost
 * imperceptibly, and the glass bends them at its rims. Because the silk
 * drifts, a visible section keeps drawing (the Stage stops drawing it when
 * it is off screen); under reduced motion it holds one moment and sleeps.
 */
import { compileProgramAsync, uniforms } from "@/lib/gl/core";
import { createGlassPassAsync, FULLSCREEN_VS, type GlassStyle } from "@/lib/gl/glass";
import { createPanels, type PanelKind } from "@/lib/gl/glass-panels";
import type { SceneFactory } from "@/lib/gl/stage";
import { damp } from "@/lib/motion/spring";
import { encodeSrgb, type RGB } from "@/lib/theme";

const LIGHT_FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform vec2 u_pos;
uniform float u_radius;
uniform vec3 u_color;
uniform vec3 u_color2;     // the silk's second colour (teal)
uniform float u_time;
uniform float u_silkScale; // px per unit of the silk's pattern
uniform float u_alpha;
uniform vec4 u_box;        // the panes' box: x, y, w, h (px)
uniform float u_boxR;
uniform float u_hasBox;
uniform float u_soft;      // how far beyond the box the light reaches
uniform float u_floor;     // what is left of it beyond that
uniform float u_edge;
out vec4 o;

// Interleaved gradient noise: a dither below one step, so a soft light on
// black never bands.
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

// Silk: two slow layers of folded sheen, warped a little so no fold runs
// straight. Returns 0-1, and how far the colour has turned to teal.
float silk(vec2 px, out float turn) {
  vec2 p = px / u_silkScale;
  float t = u_time;
  p += 0.35 * vec2(sin(p.y * 1.1 + t * 0.07), cos(p.x * 0.8 - t * 0.05));
  float f1 = p.y * 1.6 + 0.55 * sin(p.x * 1.3 + t * 0.11) + 0.35 * sin(p.x * 2.7 - t * 0.08);
  float f2 = p.y * 1.1 - 0.45 * sin(p.x * 0.9 - t * 0.06 + 1.7) + 0.3 * sin(p.x * 2.1 + t * 0.09);
  float r1 = pow(0.5 + 0.5 * sin(f1 * 3.1), 5.0);
  float r2 = pow(0.5 + 0.5 * sin(f2 * 2.3 + 1.3), 7.0);
  float base = 0.18 * (0.5 + 0.5 * sin(f1 * 1.05 - 0.6));
  turn = 0.5 + 0.5 * sin(p.x * 0.6 + p.y * 0.45 + t * 0.04);
  return clamp(0.8 * r1 + 0.6 * r2 + base, 0.0, 1.0);
}

float roundBox(vec2 p, vec4 b, float r) {
  vec2 c = b.xy + b.zw * 0.5;
  vec2 q = abs(p - c) - (b.zw * 0.5 - r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 d = px - u_pos;
  float d2 = dot(d, d);
  float r2 = u_radius * u_radius;
  // The silk, and over it a faint light where the hand is (so the glass
  // still answers it); together never brighter than u_alpha.
  float turn;
  float sheen = silk(px, turn);
  float hand = (exp(-d2 / r2) + 0.35 * exp(-d2 / (9.0 * r2))) / 1.35;
  float a = clamp(0.9 * sheen + 0.4 * hand, 0.0, 1.0) * u_alpha;
  vec3 colour = mix(u_color, u_color2, turn);
  // Gathered under the panes: full inside their box, fading just beyond it.
  if (u_hasBox > 0.5) {
    float bd = max(roundBox(px, u_box, u_boxR), 0.0);
    a *= mix(u_floor, 1.0, 1.0 - smoothstep(0.0, u_soft, bd));
  }
  // Nothing at the canvas's top and bottom: sections never seam.
  a *= smoothstep(0.0, u_edge, px.y) * smoothstep(0.0, u_edge, u_res.y - px.y);
  a = clamp(a + (ign(gl_FragCoord.xy) - 0.5) / 255.0, 0.0, 1.0);
  o = vec4(colour * a, a);
}`;

const LUMA = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const decode = (x: number) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));

/** The most of the light allowed where text may sit, as a share of
    `alpha`: its colour at that strength stays below `maxLum` on black. */
function keepFloor(color: RGB, alpha: number, maxLum: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    const lin: RGB = [decode(color[0] * alpha * m), decode(color[1] * alpha * m), decode(color[2] * alpha * m)];
    if (LUMA(lin) > maxLum) hi = m;
    else lo = m;
  }
  return lo;
}

export const createSectionLightScene: SceneFactory = async (ctx) => {
  const { gl, canvas } = ctx;
  const host = (canvas.closest("[data-glass-host]") ?? canvas.closest("section")) as HTMLElement | null;
  if (!host) throw new Error("section-light: no host");
  // Inside a scroller (the carousel), only what is in view is drawn, and the
  // light rests in view rather than on the far cards.
  const scroller = canvas.closest<HTMLElement>("[data-glass-host]");
  const view = scroller ? () => scroller.getBoundingClientRect() : null;

  const [glass, program] = await Promise.all([
    createGlassPassAsync(gl),
    compileProgramAsync(gl, FULLSCREEN_VS, LIGHT_FS),
  ]);
  const u = uniforms(gl, program);
  const vao = gl.createVertexArray()!;
  const panels = createPanels({ canvas, host, invalidate: ctx.invalidate, cull: view ?? undefined });

  let width = 1;
  let height = 1;
  let dpr = 1;
  let pos: { x: number; y: number } | null = null;
  let shown = false;

  return {
    resize(w, h, d) {
      width = w;
      height = h;
      dpr = d;
      gl.viewport(0, 0, w, h);
      glass.resize(w, h);
      panels.markDirty();
    },

    frame(f) {
      const pal = f.palette;
      const dark = pal.theme === "dark";
      const bg = encodeSrgb(pal.bg);
      const hydro = encodeSrgb(pal.hydro);
      const teal = encodeSrgb(pal.glow2);
      // Clear glass is judged against the quietest text it carries (ink-3),
      // so every word on a pane keeps 4.5:1 however bright the light.
      const clearText = LUMA(pal.ink3);
      const style = (kind: PanelKind): GlassStyle =>
        kind === "hydro"
          ? { tint: [hydro[0], hydro[1], hydro[2], dark ? 0.86 : 0.94], textLum: LUMA(pal.onHydro) }
          : { textLum: clearText };
      const { list, busy } = panels.update(f.dt, style);

      // Where the light wants to be: at rest, the top left of the panes (or
      // of the visible part of a scroller); under the hand, the hand,
      // within reach of the panes.
      const R = 240 * dpr;
      const b = panels.bounds();
      let home = { x: width * 0.33, y: height * 0.42 };
      if (view) {
        const c = canvas.getBoundingClientRect();
        const k = c.width ? canvas.width / c.width : dpr;
        const v = view();
        home = { x: (v.left - c.left + v.width * 0.3) * k, y: height * 0.45 };
      } else if (b) {
        home = { x: b.x + b.w / 3, y: b.y + b.h / 3 };
      }
      const hand = { x: ((f.pointer.x + 1) / 2) * width, y: ((1 - f.pointer.y) / 2) * height };
      if (b) {
        const m = R * 0.25;
        hand.x = Math.min(Math.max(hand.x, b.x - m), b.x + b.w + m);
        hand.y = Math.min(Math.max(hand.y, b.y - m), b.y + b.h + m);
      }
      const t = f.pointer.presence;
      const target = { x: home.x + (hand.x - home.x) * t, y: home.y + (hand.y - home.y) * t };
      // At rest inside a scroller, the light holds still in view while the
      // cards slide over it: it follows the scroll exactly, not eased.
      if (!pos || f.reduced || (view && t < 0.01)) pos = { ...target };
      else {
        pos.x = damp(pos.x, target.x, 0.08, f.dt);
        pos.y = damp(pos.y, target.y, 0.08, f.dt);
      }
      const moving = Math.abs(pos.x - target.x) > 0.25 * dpr || Math.abs(pos.y - target.y) > 0.25 * dpr;

      // How bright: soft on black, barely there on daylight (where dark text
      // needs the page light around it).
      const alpha = dark ? 0.36 : 0.07;
      // Beyond the panes' reach, never brighter than the quietest text allows.
      const floor = dark ? Math.min(0.3, keepFloor(hydro, alpha, 0.022), keepFloor(teal, alpha, 0.022)) : 1;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(u("u_res"), width, height);
      gl.uniform2f(u("u_pos"), pos.x, pos.y);
      gl.uniform1f(u("u_radius"), R);
      gl.uniform3f(u("u_color"), hydro[0], hydro[1], hydro[2]);
      gl.uniform3f(u("u_color2"), teal[0], teal[1], teal[2]);
      // Almost still: under reduced motion it holds one moment.
      gl.uniform1f(u("u_time"), f.reduced ? 24 : f.time);
      gl.uniform1f(u("u_silkScale"), 520 * dpr);
      gl.uniform1f(u("u_alpha"), alpha);
      gl.uniform4f(u("u_box"), b?.x ?? 0, b?.y ?? 0, b?.w ?? 0, b?.h ?? 0);
      gl.uniform1f(u("u_boxR"), Math.min(28 * dpr, (b?.w ?? 0) / 2, (b?.h ?? 0) / 2));
      gl.uniform1f(u("u_hasBox"), b ? 1 : 0);
      gl.uniform1f(u("u_soft"), 0.45 * R);
      gl.uniform1f(u("u_floor"), floor);
      gl.uniform1f(u("u_edge"), 96 * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);

      if (list.length) {
        glass.draw(list, {
          dark,
          bg,
          hydro,
          // The page behind the canvas is flat: its own colour.
          sky: { cx: 0.5, cy: 0.5, rx: 1, ry: 1, mix: 0, stop: 1 },
          gain: dark ? 1.15 : 1,
          light: { x: pos.x, y: pos.y, weight: 1, reach: R * 3 },
          // On daylight, a lighter lift than the valley's buttons: these
          // panes are large, and a caption may sit just below one.
          shadow: dark ? 0.32 : 0.08,
          dither: true,
          // A pane's text can sit 16 px from its rim (a window's title bar).
          scrimEdge: 0.7,
          // Dithered glass: aimed past 4.5 so no single pixel rounds under it.
          minContrast: 4.6,
        });
        if (!shown) {
          shown = true;
          panels.handoff(true);
        }
      }
      // The silk drifts, so a visible section keeps drawing (not under reduced motion).
      return busy || moving || !f.reduced;
    },

    dispose() {
      panels.dispose();
      glass.dispose();
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
};
