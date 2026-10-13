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
 * Glass: DOM elements over the valley marked [data-glass-panel] — the
 * hero's two calls to action and its fact strip — are drawn by the scene as
 * liquid glass (lib/gl/glass.ts): the valley itself, blurred and bent at
 * the rim; data-glass-panel="hydro" is a pane tinted hydro (the primary
 * button). Each element is told (data-glass="gl") so its CSS glass steps
 * aside. The panes follow their elements as they move (the magnetic pull,
 * a press), fade in with them, and brighten under the hand.
 *
 * Two looks, one composition. Night Valley (dark): light summed additively,
 * glowing. Daylight (light): dark dots on a light page read as grain, so
 * the valley is drawn as a surface instead (valley-relief.ts) — a softly lit
 * relief with hairline contours, haze, bright snow and a mint floor — and
 * the dot field draws only its lights on top: the lit floor glowing green
 * (with a soft halo pass, u_halo), the rivers, and the hand's light.
 */
import { clamp01, compileProgram, lerp, loadDataTexture, lookAt, multiply, perspective, uniforms } from "@/lib/gl/core";
import { createGlassPass, measurePanels, type GlassRect, type GlassStyle } from "@/lib/gl/glass";
import type { FrameInfo, Scene, SceneContext, SceneFactory } from "@/lib/gl/stage";
import { createReliefPass } from "./valley-relief";
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
uniform vec3 u_cGlow;        // daylight: the floor's glow, a brighter green
uniform vec3 u_eye;          // the camera, world units
uniform float u_grid;        // dots across the field
uniform float u_dark;
uniform vec2 u_city[3];      // Kathmandu, Lalitpur, Bhaktapur (uv)
uniform vec3 u_tap[3];       // taps: ndc x, ndc y, age in s (< 0: none)
uniform vec2 u_wind;         // shimmer from scroll speed: amount 0–1, phase
uniform float u_halo;        // daylight's soft pass under the lit floor
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

  // Relief: a light from the north-west, from the height gradient; and
  // the crests, where the land is convex (a negative Laplacian).
  float hxp = heightKm(a_uv + vec2(u_texel, 0.0));
  float hxm = heightKm(a_uv - vec2(u_texel, 0.0));
  float hzp = heightKm(a_uv + vec2(0.0, u_texel));
  float hzm = heightKm(a_uv - vec2(0.0, u_texel));
  float hx = hxp - hxm;
  float hz = hzp - hzm;
  float crest = smoothstep(0.004, 0.035, 4.0 * km - (hxp + hxm + hzp + hzm));

  // Daylight's drawing: contour lines every 100 m, heavier every 500 m —
  // the dots that lie on a level, the band as wide as one step of the grid
  // on that slope, so the lines are even — and the silhouettes, where a
  // slope turns away from the eye.
  float grad = length(vec2(hx, hz)) / (2.0 * u_texel);       // km per uv
  float step1 = max(grad / u_grid, 0.0015);                  // km per dot
  float d100 = abs(fract(km * 10.0 + 0.5) - 0.5) * 0.1;
  float d500 = abs(fract(km * 2.0 + 0.5) - 0.5) * 0.5;
  float contour = 1.0 - smoothstep(0.35, 0.75, d100 / step1);
  float index = 1.0 - smoothstep(0.45, 0.9, d500 / step1);
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
  // The silhouette: the true surface normal, against the line of sight.
  vec3 gn = normalize(vec3(-hx * 0.1 * u_exag / (2.0 * u_texel * u_size.x), 1.0, -hz * 0.1 * u_exag / (2.0 * u_texel * u_size.y)));
  float sil = smoothstep(0.82, 0.97, 1.0 - abs(dot(gn, normalize(u_eye - pos))));

  float depth = max(clip.w, 0.05);
  float snow = smoothstep(4.4, 5.6, km);
  float energy = clamp(front + riverFront, 0.0, 1.0);
  float size;
  if (u_dark > 0.5) {
    size = 0.8 + 0.5 * shade + (0.35 + 0.6 * city) * lit * twinkle + 0.7 * riverOn + 1.2 * glow + 1.4 * (front + riverFront) + 0.6 * snow + 1.3 * ripple + 0.9 * wind;
  } else {
    // Daylight: fine dots; the lines and outlines a little heavier.
    size = 0.6 + 0.85 * contour + 0.6 * index + 0.45 * sil + (0.5 + 0.7 * city) * lit * twinkle + 0.7 * riverOn + 1.1 * glow + 1.3 * energy + 1.3 * snow * (0.35 + 0.65 * (1.0 - shade)) + 1.2 * ripple + 0.8 * wind;
  }
  size *= u_px / depth;
  // The soft pass draws only the lit floor and the hand's light, large.
  float haloOn = clamp(lit * (0.55 + 0.45 * twinkle) + glow + energy + ripple, 0.0, 1.0);
  bool halo = u_halo > 0.5;
  gl_PointSize = halo ? clamp(size * 5.0, 1.0, u_maxPx * 4.0) : clamp(size, 1.0, u_maxPx);

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
    // Daylight: the surface carries the land (valley-relief.ts); the dots
    // are only its lights — the lit floor in green, the rivers, the hand.
    // The surface draws the floor; the dots only answer the hand.
    col = u_cLit;
    a = 0.0;
    float touch = clamp(glow + ripple + wind * 0.7 + energy, 0.0, 1.0);
    col = mix(col, u_cLit, touch * 0.9);
    a = max(a, touch * 0.85);
    float far = smoothstep(12.5, 5.0, depth) * 0.6 + 0.4;
    a = clamp(a, 0.0, 1.0) * far;
    if (halo) {
      // The glow: the floor's light, spread wide and soft.
      col = u_cGlow;
      a = haloOn * (0.16 + 0.1 * city) * far;
    }
  }
  v_color = col;
  v_alpha = a * edge * near;
  // The soft pass skips everything it would not light (off screen).
  gl_Position = halo && haloOn < 0.02 ? vec4(2.0, 2.0, 2.0, 1.0) : clip;
}`;

const FS = /* glsl */ `#version 300 es
precision mediump float;
uniform highp float u_dark;
uniform highp float u_halo;
in vec3 v_color;
in float v_alpha;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  // Night: a soft point of light. Daylight: an ink dot with a crisp rim;
  // its soft pass, a gaussian haze.
  float shape = mix(1.0 - smoothstep(0.55, 0.9, d), smoothstep(1.0, 0.5, d), u_dark);
  if (u_halo > 0.5) shape = exp(-d * d * 3.5) * (1.0 - smoothstep(0.85, 1.0, d));
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

  // The grid of dots, with a seed each (one field for both looks).
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
  const dots = field(cols, rows, 0.5);
  // Daylight's surface, built the first time the light theme is drawn.
  let relief: ReturnType<typeof createReliefPass> | null = null;

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
  // Until every element has faded in, its painted opacity is read each frame.
  let entered = false;
  // While a hand is about, the elements may move: measure them each frame.
  let trackUntil = 0;
  const lifts = glassEls.map(() => 0);
  const measureGlass = () => {
    panels = glass ? measurePanels(ctx.canvas, glassEls) : [];
    ctx.invalidate();
  };
  /** An element's opacity as painted: its own times its ancestors' (to the hero). */
  const paintedOpacity = (el: HTMLElement) => {
    let o = 1;
    for (let n: HTMLElement | null = el; n && n !== host; n = n.parentElement) {
      o *= parseFloat(getComputedStyle(n).opacity);
    }
    return Number.isFinite(o) ? o : 1;
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
      let glowGreen: number[] = [...pal.hydro];
      if (dark) {
        off = pal.dotOff.map((v) => v * 1.5);
        snow = [0.82, 0.88, 0.95];
        lit = [...pal.hydro];
        river = pal.glow2.map((v, i) => v * 0.55 + pal.hydro[i]! * 0.45);
      } else {
        // Daylight: slate ink for the hills, slate blue for the snow's
        // shadows, the page's hydro for the floor and a teal for the rivers.
        const hydro = encodeSrgb(pal.hydro);
        const ink = encodeSrgb(pal.ink);
        const ink3 = encodeSrgb(pal.ink3);
        const glow2 = encodeSrgb(pal.glow2);
        off = ink.map((v, i) => v * 0.45 + ink3[i]! * 0.55);
        snow = ink3.map((v, i) => (v * 0.62 + glow2[i]! * 0.38) * 0.82);
        lit = [...hydro];
        river = glow2.map((v, i) => (v * 0.5 + hydro[i]! * 0.5) * 0.85);
        // A brighter, livelier green than the ink: the floor's daylight glow.
        glowGreen = hydro.map((v, i) => v * 0.45 + [0.16, 0.8, 0.4][i]! * 0.55);
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
      const density = Math.sqrt((GRID[3][0] * GRID[3][1]) / dots.count);
      const scale = Math.max(0.8, Math.min(1.3, width / dpr / 1440));
      gl.uniform1f(u("u_px"), 11 * dpr * density * scale);
      gl.uniform1f(u("u_maxPx"), 6.5 * dpr);
      gl.uniform3fv(u("u_cOff"), off);
      gl.uniform3fv(u("u_cLit"), lit);
      gl.uniform3fv(u("u_cSnow"), snow);
      gl.uniform3fv(u("u_cRiver"), river);
      gl.uniform3fv(u("u_cGlow"), glowGreen);
      gl.uniform3fv(u("u_eye"), eye);
      gl.uniform1f(u("u_grid"), Math.sqrt(dots.count));
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

      if (!dark) {
        relief ??= createReliefPass(gl, tier);
        const hydro = encodeSrgb(pal.hydro);
        const bg = encodeSrgb(pal.bg);
        const ink3 = encodeSrgb(pal.ink3);
        const glow2 = encodeSrgb(pal.glow2);
        const raised = encodeSrgb(pal.bg).map((v) => Math.min(1, v + 0.012));
        const mixc = (a: readonly number[], b: readonly number[], t: number) => a.map((v, i) => v + (b[i]! - v) * t);
        relief.draw({
          tex: tex.texture,
          viewProj,
          size: [meta.km[0] / 10, meta.km[1] / 10],
          exag: 2.4,
          decode: [meta.height.min / 1000, meta.height.max / 1000, meta.height.gamma],
          step: 1 / meta.size,
          power,
          reach,
          city: [...meta.places.Kathmandu, ...meta.places.Lalitpur, ...meta.places.Bhaktapur],
          pointer: [f.pointer.x, f.pointer.y, f.pointer.presence],
          aspect,
          taps,
          look: {
            // Late-morning sun from the south-west, over the viewer's left shoulder.
            sun: normalize3([-0.62, 0.62, 0.48]),
            light: raised,
            shade: mixc(mixc(bg, ink3, 0.56), glow2, 0.1),
            snowShade: mixc(mixc(bg, ink3, 0.3), glow2, 0.22),
            floor: mixc(raised, hydro, 0.05),
            glow: hydro,
            river: mixc(mixc(glow2, hydro, 0.3), encodeSrgb(pal.ink), 0.45),
            sky: mixc(bg, glow2, 0.07),
            line: mixc(ink3, encodeSrgb(pal.ink), 0.25),
            // Foothills: sage in the sun, a grey-green in shadow.
            hill: mixc(raised, hydro, 0.13),
            hillShade: mixc(mixc(bg, ink3, 0.46), hydro, 0.17),
          },
        });
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex.texture);
      }

      gl.bindVertexArray(dots.vao);
      gl.uniform1f(u("u_halo"), 0);
      gl.drawArrays(gl.POINTS, 0, dots.count);
      gl.bindVertexArray(null);

      // The glass panes, made of the valley just drawn.
      if (glass && panels.length) {
        if (f.pointer.presence > 0.01 || f.pointer.down) trackUntil = f.time + 0.9;
        if (!entered || f.time < trackUntil) panels = measurePanels(ctx.canvas, glassEls);
        const hydroTint = encodeSrgb(pal.hydro);
        const styled: (GlassRect & GlassStyle)[] = panels.map((r, i) => {
          const el = glassEls[i]!;
          const want = el.matches(":active") ? 1 : el.matches(":hover, :focus-visible") ? 0.6 : 0;
          lifts[i] = lifts[i]! + (want - lifts[i]!) * (1 - Math.exp(-f.dt * 14));
          return {
            ...r,
            opacity: entered ? 1 : paintedOpacity(el),
            lift: lifts[i],
            ...(el.dataset.glassPanel === "hydro"
              ? {
                  tint: [hydroTint[0], hydroTint[1], hydroTint[2], dark ? 0.86 : 0.94] as const,
                  textLum: dark ? 0.02 : 1,
                }
              : {}),
          };
        });
        if (!entered) entered = styled.every((p) => (p.opacity ?? 1) > 0.999);
        glass.draw(styled, {
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
      relief?.dispose();
      glassRO?.disconnect();
      glass?.dispose();
      for (const el of glassEls) delete el.dataset.glass;
      gl.deleteBuffer(dots.buf);
      gl.deleteVertexArray(dots.vao);
      gl.deleteTexture(tex.texture);
      gl.deleteProgram(program);
    },
  };
};

function normalize3(v: [number, number, number]): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 2.4);
}
