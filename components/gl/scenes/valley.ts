/**
 * Valley Online (S1) — the Kathmandu Valley as a field of dots, switching on.
 *
 * Data: public/gl/valley.png (scripts/build-terrain.mjs) — height, rivers and
 * the time at which power "arrives" at each place, upstream along the
 * Bagmati from the valley's southern outlet and outward from the rivers.
 *
 * The picture is a night view from the southern rim. The hills are relief in
 * quiet dots, lit from the north-west; the Himalaya stand pale on the
 * horizon. Then power arrives: it runs up the rivers as a moving light and
 * spreads across the valley floor, which comes on like the lights of a city —
 * the valley coming online. The rivers beyond keep carrying light outward.
 *
 * Every dot is one vertex; the whole scene is one draw call. Height, relief
 * shading, colour, the light-up fronts, the river shimmer and the pointer
 * light are computed in the vertex shader. The pointer is a soft light in
 * screen space that lifts and brightens the ground; on touch it follows the
 * finger, through a swipe. Scroll (the host's progress) lowers the camera
 * into the valley, and the speed of scrolling runs a shimmer across it,
 * like wind over a field.
 *
 * Glass: DOM panels over the valley marked [data-glass-panel] (the hero's
 * stat strip) are drawn by the scene as liquid glass (lib/gl/glass.ts): the
 * valley itself, blurred and bent at the rim. Each panel is told
 * (data-glass="gl") so its CSS glass steps aside.
 *
 * Two looks. Night Valley (dark): light summed additively, glowing. Glacier
 * (light): a halftone relief print. Tone is carried by the size of the dot,
 * as in print: shadowed slopes take big ink dots, sunlit ones small, the
 * snow is mostly paper, and the ink thins toward the horizon. The valley
 * floor and the rivers are printed in hydro; the pointer swells the dots
 * and deepens them to hydro rather than glowing.
 */
import { clamp01, compileProgram, lerp, loadDataTexture, lookAt, multiply, perspective, uniforms } from "@/lib/gl/core";
import { createGlassPass, measurePanels, type GlassRect } from "@/lib/gl/glass";
import type { FrameInfo, Scene, SceneContext, SceneFactory } from "@/lib/gl/stage";
import { asset } from "@/lib/links";
import { encodeSrgb } from "@/lib/theme";

const VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_uv;
layout(location = 1) in float a_seed;
uniform sampler2D u_tex;
uniform mat4 u_viewProj;
uniform vec2 u_size;
uniform float u_exag;
uniform vec3 u_decode;      // hMin (km), hMax (km), gamma
uniform float u_texel;
uniform float u_time;
uniform float u_power;      // the valley floor's light-up front (arrival units)
uniform float u_reach;      // the rivers' light-up front
uniform vec3 u_pointer;     // ndc x, ndc y, presence
uniform float u_aspect;
uniform float u_px;
uniform float u_maxPx;
uniform vec3 u_cOff;
uniform vec3 u_cLit;
uniform vec3 u_cSnow;
uniform vec3 u_cRiver;
uniform float u_dark;
uniform vec2 u_city[3];      // Kathmandu, Lalitpur, Bhaktapur (uv)
uniform vec3 u_tap[3];       // taps: ndc x, ndc y, age in s (< 0: none)
uniform vec2 u_wind;         // shimmer from scroll speed: amount 0–1, phase
out vec3 v_color;
out float v_alpha;

float heightKm(vec2 uv) {
  float hn = pow(texture(u_tex, uv).r, 1.0 / u_decode.z);
  return mix(u_decode.x, u_decode.y, hn);
}

void main() {
  vec4 t = texture(u_tex, a_uv);
  float hn = pow(t.r, 1.0 / u_decode.z);
  float km = mix(u_decode.x, u_decode.y, hn);
  float river = t.g;
  float arrive = t.b * t.b;

  // Relief: a light from the north-west, from the height gradient.
  float hx = heightKm(a_uv + vec2(u_texel, 0.0)) - heightKm(a_uv - vec2(u_texel, 0.0));
  float hz = heightKm(a_uv + vec2(0.0, u_texel)) - heightKm(a_uv - vec2(0.0, u_texel));
  vec3 n = normalize(vec3(-hx * 6.0, 1.0, -hz * 6.0));
  float shade = clamp(dot(n, normalize(vec3(-0.6, 0.75, -0.55))), 0.0, 1.0);

  vec3 pos = vec3((a_uv.x - 0.5) * u_size.x, km * 0.1 * u_exag, (a_uv.y - 0.5) * u_size.y);

  // The valley floor: low land close (in arrival) to the Bagmati's outlet.
  float basin = smoothstep(1.58, 1.44, km) * smoothstep(1.16, 1.24, km) * smoothstep(0.255, 0.235, arrive);
  // The three cities glow brightest.
  float city = 0.0;
  for (int i = 0; i < 3; i++) {
    vec2 d = (a_uv - u_city[i]) * vec2(1.0, 1.04);
    city = max(city, exp(-dot(d, d) / (i == 0 ? 0.00022 : 0.00011)));
  }
  float lit = smoothstep(arrive - 0.012, arrive, u_power) * basin;
  float front = exp(-pow((u_power - arrive) * 70.0, 2.0)) * basin * step(u_power, 0.3);
  float riverOn = smoothstep(arrive - 0.01, arrive, u_reach) * smoothstep(0.12, 0.45, river);
  float riverFront = exp(-pow((u_reach - arrive) * 60.0, 2.0)) * smoothstep(0.12, 0.45, river);

  // City-light twinkle and water flowing downhill (toward the outlet).
  float twinkle = 0.72 + 0.28 * sin(u_time * (0.6 + a_seed * 1.7) + a_seed * 40.0);
  float flow = 0.5 + 0.5 * sin(arrive * 260.0 - u_time * 3.0);

  // The pointer: a soft light in screen space.
  vec4 clip = u_viewProj * vec4(pos, 1.0);
  vec2 ndc = clip.xy / clip.w;
  vec2 dv = (ndc - u_pointer.xy) * vec2(u_aspect, 1.0);
  float glow = u_pointer.z * exp(-dot(dv, dv) / 0.03);

  // Taps: a ring of light and lift running out from where the finger landed.
  float ripple = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = u_tap[i].z;
    if (age < 0.0 || age > 2.4) continue;
    float d = length((ndc - u_tap[i].xy) * vec2(u_aspect, 1.0));
    float ring = exp(-pow((d - age * 0.85) / 0.06, 2.0)) * (1.0 - age / 2.4);
    ripple = max(ripple, ring);
  }
  // Wind: bands of lift travelling across the field while the page scrolls.
  float band = 0.5 + 0.5 * sin(a_uv.y * 34.0 + a_uv.x * 11.0 + a_seed * 1.4 - u_wind.y);
  float wind = u_wind.x * band * band;
  pos.y += glow * 0.06 + ripple * 0.05 + wind * 0.045;
  clip = u_viewProj * vec4(pos, 1.0);

  float depth = max(clip.w, 0.05);
  float snow = smoothstep(4.4, 5.6, km);
  float energy = clamp(front + riverFront, 0.0, 1.0);
  float size;
  if (u_dark > 0.5) {
    size = 0.8 + 0.5 * shade + (0.35 + 0.6 * city) * lit * twinkle + 0.7 * riverOn + 1.2 * glow + 1.4 * (front + riverFront) + 0.6 * snow + 1.3 * ripple + 0.9 * wind;
  } else {
    // Halftone: the darker the tone, the bigger the dot.
    float tone = 0.12 + 0.88 * (1.0 - shade);
    size = mix(0.38 + 1.25 * tone, 0.3 + 0.55 * tone, snow);
    size = max(size, lit * (0.95 + 0.45 * twinkle * (0.6 + 0.7 * city)));
    size = max(size, riverOn * (0.9 + 0.3 * flow));
    size += 1.1 * glow + 1.2 * ripple + 0.8 * wind + 1.2 * energy;
  }
  size *= u_px / depth;
  gl_PointSize = clamp(size, 1.0, u_maxPx);

  // Fade the field's edges and the near distance.
  float edge = smoothstep(0.0, 0.12, a_uv.x) * smoothstep(1.0, 0.88, a_uv.x)
             * smoothstep(0.0, 0.04, a_uv.y) * smoothstep(1.0, 0.9, a_uv.y);
  float near = smoothstep(0.6, 1.6, depth);

  vec3 col;
  float a;
  if (u_dark > 0.5) {
    vec3 relief = u_cOff * (0.45 + 1.0 * shade);
    col = mix(relief, u_cSnow * (0.55 + 0.6 * shade), snow);
    col = mix(col, u_cLit * twinkle * (0.75 + 0.6 * city), lit);
    col += vec3(0.25) * city * lit * twinkle;
    col = mix(col, u_cRiver * (0.6 + 0.5 * flow), riverOn * (1.0 - lit * 0.5));
    col += (u_cLit + 0.35) * (front + riverFront);
    col += mix(u_cLit, vec3(1.0), 0.4) * glow * 0.9;
    col += mix(u_cLit, vec3(1.0), 0.3) * ripple * 0.85;
    col += u_cLit * wind * 0.55;
    float far = mix(0.45 + 0.45 * snow, 1.0, smoothstep(13.0, 5.0, depth));
    a = (0.42 + 0.45 * shade) + lit * 0.6 + riverOn * 0.5 + snow * 0.5 + glow * 0.6 + front + riverFront + ripple * 0.7 + wind * 0.4;
    a = clamp(a, 0.0, 1.0) * far;
  } else {
    // Glacier: one ink, its weight in the dot size; snow a cool grey.
    col = mix(u_cOff, u_cSnow, snow);
    a = mix(0.56, 0.46, snow);
    col = mix(col, u_cLit, lit);
    a = max(a, lit * 0.92);
    float wet = riverOn * (1.0 - lit * 0.5);
    col = mix(col, u_cRiver, wet);
    a = max(a, wet * 0.85);
    float touch = clamp(glow + ripple + wind * 0.7 + energy, 0.0, 1.0);
    col = mix(col, u_cLit, touch * 0.9);
    a = max(a, touch * 0.9);
    // Aerial perspective: the far ranges fade to paper; and the ink stays
    // light behind the headline, so the words sit on a clean page.
    float far = mix(0.12 + 0.3 * snow, 1.0, smoothstep(12.5, 5.0, depth));
    vec2 q = (clip.xy / clip.w - vec2(0.0, 0.18)) * vec2(1.05, 1.9);
    float hush = mix(0.3, 1.0, smoothstep(0.35, 0.95, length(q)));
    a = clamp(a, 0.0, 1.0) * far * mix(hush, 1.0, lit);
  }
  v_color = col;
  v_alpha = a * edge * near;
  gl_Position = clip;
}`;

const FS = /* glsl */ `#version 300 es
precision mediump float;
uniform highp float u_dark;
in vec3 v_color;
in float v_alpha;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  // Night: a soft point of light. Glacier: a printed dot with a crisp rim.
  float shape = mix(1.0 - smoothstep(0.55, 0.9, d), smoothstep(1.0, 0.5, d), u_dark);
  float a = shape * v_alpha;
  if (a < 0.004) discard;
  o = vec4(v_color * a, a);
}`;

const GRID: Record<1 | 2 | 3, [number, number]> = {
  1: [150, 156],
  2: [230, 240],
  3: [320, 334],
};

interface Meta {
  size: number;
  km: [number, number];
  height: { min: number; max: number; gamma: number };
  places: Record<"Kathmandu" | "Lalitpur" | "Bhaktapur", [number, number]>;
}

type V3 = [number, number, number];

/** Camera keys at scroll progress 0 and 1. World units are 10 km. */
const CAM: { from: { eye: V3; target: V3; fov: number }; to: { eye: V3; target: V3; fov: number } } = {
  from: { eye: [-0.45, 2.6, 7.2], target: [-0.35, 1.04, 2.41], fov: 30 },
  to: { eye: [-0.62, 1.15, 4.4], target: [-0.6, 0.42, 1.4], fov: 40 },
};

/** ?cam=ex,ey,ez,tx,ty,tz,fov overrides the opening shot (for art direction). */
function camOverride(): typeof CAM.from | null {
  const q = new URLSearchParams(window.location.search).get("cam");
  if (!q) return null;
  const v = q.split(",").map(Number);
  if (v.length < 7 || v.some((x) => Number.isNaN(x))) return null;
  return { eye: [v[0]!, v[1]!, v[2]!], target: [v[3]!, v[4]!, v[5]!], fov: v[6]! };
}

export const createValleyScene: SceneFactory = async (ctx: SceneContext): Promise<Scene> => {
  const { gl, tier } = ctx;
  const [meta, tex] = await Promise.all([
    fetch(asset("/gl/valley.json")).then((r) => r.json() as Promise<Meta>),
    loadDataTexture(gl, asset("/gl/valley.png")),
  ]);
  const override = camOverride();
  const from = override ?? CAM.from;

  const program = compileProgram(gl, VS, FS);
  const u = uniforms(gl, program);

  // The grid of dots, with a seed each.
  // Two fields of dots: the night's, fine; and Glacier's halftone, on a
  // coarser screen (about 0.56 of the pitch), whose dots draw larger.
  const hash = (a: number, b: number) => {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const field = (cols: number, rows: number, jitter: number) => {
    const count = cols * rows;
    const data = new Float32Array(count * 3);
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // A touch of jitter breaks the moiré of a perfect grid in perspective.
        data[k++] = (c + 0.5 + (hash(c, r) - 0.5) * jitter) / cols;
        data[k++] = (r + 0.5 + (hash(r, c) - 0.5) * jitter) / rows;
        data[k++] = hash(c * 3.1, r * 1.7);
      }
    }
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 12, 8);
    gl.bindVertexArray(null);
    return { vao, buf, count };
  };
  const [cols, rows] = GRID[tier];
  const night = field(cols, rows, 0.5);
  // A printed screen is regular: less jitter.
  const paper = field(Math.round(cols * 0.56), Math.round(rows * 0.56), 0.18);

  let width = 1;
  let height = 1;
  let dpr = 1;
  let startedAt = -1;
  let camX = 0;
  let frames = 0;
  let lastProgress = -1;
  let wind = 0;
  let windPhase = 0;

  // Liquid glass for the panels over the valley, if there are any.
  const host = ctx.canvas.closest("section");
  const glassEls = host ? Array.from(host.querySelectorAll<HTMLElement>("[data-glass-panel]")) : [];
  let glass: ReturnType<typeof createGlassPass> | null = null;
  let panels: GlassRect[] = [];
  let glassShown = false;
  const measureGlass = () => {
    panels = glass ? measurePanels(ctx.canvas, glassEls) : [];
    ctx.invalidate();
  };
  let glassRO: ResizeObserver | null = null;
  if (glassEls.length) {
    try {
      glass = createGlassPass(gl);
      glassRO = new ResizeObserver(measureGlass);
      for (const el of glassEls) glassRO.observe(el);
      void document.fonts?.ready.then(measureGlass);
    } catch (err) {
      console.warn("[valley] glass unavailable", err);
      glass = null;
    }
  }
  const POWER_END = 0.3;
  const REACH_END = 1.0;

  return {
    resize(w, h, d) {
      width = w;
      height = h;
      dpr = d;
      gl.viewport(0, 0, w, h);
      glass?.resize(w, h);
      measureGlass();
    },

    frame(f: FrameInfo) {
      const aspect = width / height;
      const reduced = f.reduced;
      if (startedAt < 0) startedAt = f.time;
      const t = f.time - startedAt;

      // Power reaches the valley floor in ~4 s; the rivers carry it on for
      // another ~8 s. Instantly, when motion is reduced.
      const power = reduced ? POWER_END : POWER_END * easeOut(clamp01((t - 0.4) / 4.2));
      const reach = reduced ? REACH_END : 0.1 + (REACH_END - 0.1) * easeOut(clamp01((t - 0.2) / 11));
      const rippling = !reduced && f.taps.some((tap) => f.time - tap.t < 2.4);

      // Wind from the scroll: its strength eases in and out; the bands
      // travel with the distance scrolled.
      const speed = Math.min(1, Math.abs(f.scrollVel) / 2600);
      wind += (speed - wind) * (1 - Math.exp(-f.dt * (speed > wind ? 10 : 2.2)));
      if (wind < 0.002) wind = 0;
      windPhase += f.scrollVel * f.dt * 0.0045;
      const animating = !reduced && (power < POWER_END || reach < REACH_END || rippling || wind > 0);

      // Once lit, with nobody touching it and no scrolling, half the frame
      // rate is plenty for flowing water (and kinder to batteries); with
      // reduced motion, a third: the lights still twinkle, slowly.
      frames++;
      const idle = !animating && f.pointer.presence < 0.01 && Math.abs(f.progress - lastProgress) < 1e-4;
      lastProgress = f.progress;
      if (idle && frames % (reduced ? 3 : 2) !== 0) return true;

      // Camera: scroll lowers it into the valley; the pointer leans it a little.
      const p = reduced ? 0 : f.progress;
      const e = p * p * (3 - 2 * p);
      camX = lerp(camX, f.pointer.presence * f.pointer.x, 0.06);
      const portrait = aspect < 0.85;
      const eye: V3 = [
        lerp(from.eye[0], CAM.to.eye[0], e) + camX * 0.16,
        lerp(from.eye[1], CAM.to.eye[1], e) + (portrait ? 0.35 : 0),
        lerp(from.eye[2], CAM.to.eye[2], e) + (portrait ? 1.1 : 0),
      ];
      const target: V3 = [
        lerp(from.target[0], CAM.to.target[0], e),
        lerp(from.target[1], CAM.to.target[1], e),
        lerp(from.target[2], CAM.to.target[2], e),
      ];
      const fovDeg = lerp(from.fov, CAM.to.fov, e) * (portrait ? 1.45 : 1);
      const viewProj = multiply(perspective((fovDeg * Math.PI) / 180, aspect, 0.05, 40), lookAt(eye, target));

      // Palette. Night Valley is light summed additively, so it works in
      // linear values: overlapping dots add up to the bright token colours.
      // On Glacier the dots are ink laid over paper and must match the
      // page's own ink and hydro, so they are written gamma-encoded.
      const pal = f.palette;
      const dark = pal.theme === "dark";
      let off: number[], snow: number[], lit: number[], river: number[];
      if (dark) {
        off = pal.dotOff.map((v) => v * 1.5);
        snow = [0.82, 0.88, 0.95];
        lit = [...pal.hydro];
        river = pal.glow2.map((v, i) => v * 0.55 + pal.hydro[i]! * 0.45);
      } else {
        // Glacier: slate ink for the relief, a cool grey for the far snow,
        // the page hydro for the lit floor and a teal-green for the rivers.
        const hydro = encodeSrgb(pal.hydro);
        const ink = encodeSrgb(pal.ink);
        const ink3 = encodeSrgb(pal.ink3);
        const glow2 = encodeSrgb(pal.glow2);
        off = ink.map((v, i) => v * 0.7 + ink3[i]! * 0.3);
        snow = glow2.map((v, i) => v * 0.35 + ink3[i]! * 0.65);
        lit = [...hydro];
        river = glow2.map((v, i) => v * 0.4 + hydro[i]! * 0.6);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      if (dark) gl.blendFunc(gl.ONE, gl.ONE);
      else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex.texture);
      gl.uniform1i(u("u_tex"), 0);
      gl.uniformMatrix4fv(u("u_viewProj"), false, viewProj);
      gl.uniform2f(u("u_size"), meta.km[0] / 10, meta.km[1] / 10);
      gl.uniform1f(u("u_exag"), 2.4);
      gl.uniform3f(u("u_decode"), meta.height.min / 1000, meta.height.max / 1000, meta.height.gamma);
      gl.uniform1f(u("u_texel"), 1.5 / meta.size);
      // Reduced motion: the same lights, twinkling at a third of the pace.
      gl.uniform1f(u("u_time"), reduced ? f.time / 3 : f.time);
      gl.uniform1f(u("u_power"), power);
      gl.uniform1f(u("u_reach"), reach);
      gl.uniform3f(u("u_pointer"), f.pointer.x, f.pointer.y, f.pointer.presence);
      gl.uniform1f(u("u_aspect"), aspect);
      const dots = dark ? night : paper;
      const density = Math.sqrt((GRID[3][0] * GRID[3][1]) / dots.count);
      const scale = Math.max(0.8, Math.min(1.3, width / dpr / 1440));
      gl.uniform1f(u("u_px"), 11 * dpr * density * scale);
      gl.uniform1f(u("u_maxPx"), (dark ? 6.5 : 4.6) * dpr);
      gl.uniform3fv(u("u_cOff"), off);
      gl.uniform3fv(u("u_cLit"), lit);
      gl.uniform3fv(u("u_cSnow"), snow);
      gl.uniform3fv(u("u_cRiver"), river);
      gl.uniform1f(u("u_dark"), dark ? 1 : 0);
      gl.uniform2fv(u("u_city[0]"), [...meta.places.Kathmandu, ...meta.places.Lalitpur, ...meta.places.Bhaktapur]);
      const taps = new Float32Array(9).fill(-1);
      f.taps.slice(-3).forEach((tap, i) => {
        taps[i * 3] = tap.x;
        taps[i * 3 + 1] = tap.y;
        taps[i * 3 + 2] = f.time - tap.t;
      });
      gl.uniform3fv(u("u_tap[0]"), taps);
      gl.uniform2f(u("u_wind"), wind, windPhase);

      gl.bindVertexArray(dots.vao);
      gl.drawArrays(gl.POINTS, 0, dots.count);
      gl.bindVertexArray(null);

      // The glass panels, made of the valley just drawn.
      if (glass && panels.length) {
        glass.draw(panels, {
          dark,
          bg: encodeSrgb(pal.bg),
          hydro: encodeSrgb(pal.hydro),
          sky: dark
            ? { cx: 0.5, cy: 0.78, rx: 1.2, ry: 0.7, mix: 0.13, stop: 0.6 }
            : { cx: 0.5, cy: 0.78, rx: 1.2, ry: 0.7, mix: 0.09, stop: 0.62 },
        });
        if (!glassShown) {
          glassShown = true;
          for (const el of glassEls) el.dataset.glass = "gl";
        }
      }

      // The water keeps flowing and the lights twinkle in either mode; the
      // camera's descent, the arrival of power, the wind and the ripples
      // are the motion that reduced motion leaves out.
      return true;
    },

    dispose() {
      glassRO?.disconnect();
      glass?.dispose();
      for (const el of glassEls) delete el.dataset.glass;
      for (const d of [night, paper]) {
        gl.deleteBuffer(d.buf);
        gl.deleteVertexArray(d.vao);
      }
      gl.deleteTexture(tex.texture);
      gl.deleteProgram(program);
    },
  };
};

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2.4);
}
