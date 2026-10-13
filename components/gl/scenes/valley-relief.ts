/**
 * The valley in daylight, as a surface (S1, light theme). Dark dots on a
 * light page read as grain, however they are arranged, so in daylight the
 * Kathmandu Valley is drawn the way a relief model is photographed: a
 * smooth, softly lit surface in porcelain and pale slate, hairline contours
 * every 100 m (firmer every 500 m), haze that carries the far ranges into
 * the sky, the snow bright on the Himalaya, the valley floor in mint with
 * its lit districts glowing green, and the rivers in teal. The night's dot
 * field still draws on top, but only its lights: the floor, the rivers and
 * the hand's light (components/gl/scenes/valley.ts).
 *
 * One mesh from the same height texture as the dots, one draw call. The
 * canvas has no depth buffer, so the triangles are ordered far to near and
 * painted in that order: the camera always looks north over the field, so
 * a nearer row always covers a farther one.
 */
import { compileProgram, uniforms } from "@/lib/gl/core";

const VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_uv;
uniform sampler2D u_tex;
uniform mat4 u_viewProj;
uniform vec2 u_size;
uniform float u_exag;
uniform vec3 u_decode;
uniform float u_step;        // one texel, in uv
uniform float u_power;
uniform float u_reach;
uniform vec2 u_city[3];
out vec3 v_n;
out float v_km;
out float v_depth;
out vec2 v_ndc;
out vec2 v_uv;
out float v_lit;
out float v_basin;
out float v_river;
out float v_city;

float heightKm(vec2 uv) {
  float hn = pow(texture(u_tex, uv).r, 1.0 / u_decode.z);
  return mix(u_decode.x, u_decode.y, hn);
}

void main() {
  vec4 t = texture(u_tex, a_uv);
  // Heights are stored in 8 bits: the surface (and its contours) use a
  // smoothed height, and the normal is taken over a few texels, so no
  // steps show.
  float e = u_step * 2.0;
  float hxp = heightKm(a_uv + vec2(e, 0.0));
  float hxm = heightKm(a_uv - vec2(e, 0.0));
  float hzp = heightKm(a_uv + vec2(0.0, e));
  float hzm = heightKm(a_uv - vec2(0.0, e));
  float km = (heightKm(a_uv) * 2.0 + hxp + hxm + hzp + hzm) / 6.0;
  float hx = hxp - hxm;
  float hz = hzp - hzm;
  v_n = normalize(vec3(-hx * 0.1 * u_exag / (2.0 * e * u_size.x), 1.0, -hz * 0.1 * u_exag / (2.0 * e * u_size.y)));

  vec3 pos = vec3((a_uv.x - 0.5) * u_size.x, km * 0.1 * u_exag, (a_uv.y - 0.5) * u_size.y);
  vec4 clip = u_viewProj * vec4(pos, 1.0);

  float arrive = t.b * t.b;
  float basin = smoothstep(1.58, 1.44, km) * smoothstep(1.16, 1.24, km) * smoothstep(0.255, 0.235, arrive);
  float city = 0.0;
  for (int i = 0; i < 3; i++) {
    vec2 d = (a_uv - u_city[i]) * vec2(1.0, 1.04);
    city = max(city, exp(-dot(d, d) / (i == 0 ? 0.00022 : 0.00011)));
  }
  v_lit = smoothstep(arrive - 0.012, arrive, u_power) * basin;
  v_basin = basin;
  v_river = smoothstep(arrive - 0.01, arrive, u_reach) * smoothstep(0.3, 0.72, t.g);
  v_city = city;
  v_km = km;
  v_depth = clip.w;
  v_ndc = clip.xy / clip.w;
  v_uv = a_uv;
  gl_Position = clip;
}`;

const FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 v_n;
in float v_km;
in float v_depth;
in vec2 v_ndc;
in vec2 v_uv;
in float v_lit;
in float v_basin;
in float v_river;
in float v_city;
uniform sampler2D u_tex;
uniform sampler2D u_rivers;
uniform float u_hasRivers;
uniform float u_reachF;
uniform vec3 u_sun;
uniform vec3 u_cLight;
uniform vec3 u_cShade;
uniform vec3 u_cSnowShade;
uniform vec3 u_cFloor;
uniform vec3 u_cGlow;
uniform vec3 u_cRiver;
uniform vec3 u_cSky;
uniform vec3 u_cLine;
uniform vec3 u_cHill;
uniform vec3 u_cHillShade;
uniform vec3 u_pointer;      // ndc x, y, presence
uniform float u_aspect;
uniform vec3 u_tap[3];
uniform float u_hushX;
out vec4 o;

void main() {
  vec3 n = normalize(v_n);
  float diff = clamp(dot(n, u_sun), 0.0, 1.0);
  float hemi = 0.5 + 0.5 * n.y;
  float light = clamp(0.12 + 0.76 * diff + 0.12 * hemi, 0.0, 1.0);
  vec3 col = mix(u_cShade, u_cLight, smoothstep(0.0, 0.92, light));

  // The foothills carry a faint green; the high ground is stone, then snow.
  float low = smoothstep(4.3, 2.4, v_km) * (1.0 - v_basin);
  vec3 hill = mix(u_cHillShade, u_cHill, smoothstep(0.0, 0.92, light));
  col = mix(col, hill, low);

  // The snow: bright where the sun reaches it, cool blue in shadow.
  float snow = smoothstep(4.2, 5.3, v_km);
  col = mix(col, mix(u_cSnowShade, vec3(1.0), smoothstep(0.05, 0.85, diff)), snow);

  // Contours: hairlines every 100 m, firmer every 500 m (anti-aliased).
  float f1 = v_km * 10.0;
  float l1 = 1.0 - clamp(abs(fract(f1 + 0.5) - 0.5) / max(fwidth(f1), 1e-4), 0.0, 1.0);
  float f5 = v_km * 2.0;
  float l5 = 1.0 - clamp(abs(fract(f5 + 0.5) - 0.5) / max(fwidth(f5) * 1.4, 1e-4), 0.0, 1.0);
  float fade = 1.0 - smoothstep(0.25, 0.6, fwidth(f1));
  col = mix(col, u_cLine, max(l1 * 0.09 * fade, l5 * 0.24) * (1.0 - v_basin * 0.6));

  // The floor: a clean pale surface, and as power arrives it is traced in
  // fine hydro contours every 20 m — the valley drawn like an engineered
  // map — denser and brighter in the three cities. The rivers: thin, crisp
  // lines of deep teal.
  col = mix(col, u_cFloor, v_basin * 0.35);
  float f20 = v_km * 50.0;
  float l20 = 1.0 - clamp(abs(fract(f20 + 0.5) - 0.5) / max(fwidth(f20) * 0.9, 1e-4), 0.0, 1.0);
  col = mix(col, u_cGlow, v_lit * (l20 * (0.55 + 0.35 * v_city) + 0.06 + 0.1 * v_city));
  // Rivers, from a distance field of their smoothed centrelines
  // (scripts/build-rivers.mjs): crisp, anti-aliased hairlines at any zoom,
  // the Bagmati firmer, tributaries finer, fading out where too thin.
  vec4 rf = texture(u_rivers, v_uv);
  float rd = rf.r * 8.0;                       // field texels to the centreline
  float rw = mix(0.35, 1.05, rf.g);            // half-width, field texels
  float rfw = max(fwidth(rd), 1e-4);
  float rl = clamp(0.5 + (rw - rd) / rfw, 0.0, 1.0) * clamp(1.6 * rw / rfw, 0.0, 1.0);
  vec4 tx = texture(u_tex, v_uv);
  rl *= smoothstep(tx.b * tx.b - 0.01, tx.b * tx.b, u_reachF) * u_hasRivers;
  col = mix(col, u_cRiver, rl * mix(0.55, 0.9, rf.g));

  // The hand's light, and taps' rings, in green.
  vec2 dv = (v_ndc - u_pointer.xy) * vec2(u_aspect, 1.0);
  float glow = u_pointer.z * exp(-dot(dv, dv) / 0.03);
  float ripple = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = u_tap[i].z;
    if (age < 0.0 || age > 2.4) continue;
    float d = length((v_ndc - u_tap[i].xy) * vec2(u_aspect, 1.0));
    ripple = max(ripple, exp(-pow((d - age * 0.85) / 0.05, 2.0)) * (1.0 - age / 2.4));
  }
  col = mix(col, u_cGlow, clamp(glow * 0.4 + ripple * 0.55, 0.0, 0.7));

  // Atmosphere: the far ranges fade into the sky.
  float haze = smoothstep(4.0, 13.0, v_depth);
  col = mix(col, u_cSky, haze * 0.7);

  // Behind the words, the surface steps back toward the sky.
  vec2 q = abs(v_ndc - vec2(0.0, 0.24)) / vec2(u_hushX, 0.5);
  float box = pow(pow(q.x, 4.0) + pow(q.y, 4.0), 0.25);
  col = mix(col, u_cSky, (1.0 - smoothstep(0.82, 1.25, box)) * 0.5);

  float edge = smoothstep(0.0, 0.1, v_uv.x) * smoothstep(1.0, 0.9, v_uv.x)
             * smoothstep(0.0, 0.06, v_uv.y) * smoothstep(1.0, 0.9, v_uv.y);
  float near = smoothstep(0.6, 1.6, v_depth);
  float a = edge * near * (1.0 - haze * 0.5);
  o = vec4(col * a, a);
}`;

/** Mesh resolution per quality tier (vertices along each side). */
const MESH: Record<1 | 2 | 3, number> = { 1: 150, 2: 210, 3: 320 };

export interface ReliefLook {
  sun: readonly [number, number, number];
  light: readonly number[];
  shade: readonly number[];
  snowShade: readonly number[];
  floor: readonly number[];
  glow: readonly number[];
  river: readonly number[];
  sky: readonly number[];
  line: readonly number[];
  hill: readonly number[];
  hillShade: readonly number[];
}

export function createReliefPass(gl: WebGL2RenderingContext, tier: 1 | 2 | 3) {
  const program = compileProgram(gl, VS, FS);
  const u = uniforms(gl, program);

  const n = MESH[tier];
  const uv = new Float32Array(n * n * 2);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      uv[(r * n + c) * 2] = c / (n - 1);
      uv[(r * n + c) * 2 + 1] = r / (n - 1);
    }
  // Rows far (v = 0, north) to near: painted in order, nearer covers farther.
  const idx = new Uint32Array((n - 1) * (n - 1) * 6);
  let k = 0;
  for (let r = 0; r < n - 1; r++)
    for (let c = 0; c < n - 1; c++) {
      const a = r * n + c;
      const b = a + 1;
      const d = a + n;
      idx[k++] = a;
      idx[k++] = d;
      idx[k++] = b;
      idx[k++] = b;
      idx[k++] = d;
      idx[k++] = d + 1;
    }
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  const ibo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  return {
    draw(p: {
      tex: WebGLTexture;
      rivers: WebGLTexture | null;
      viewProj: Float32Array | number[];
      size: [number, number];
      exag: number;
      decode: [number, number, number];
      step: number;
      power: number;
      reach: number;
      city: number[];
      pointer: [number, number, number];
      aspect: number;
      taps: Float32Array;
      look: ReliefLook;
    }) {
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, p.tex);
      gl.uniform1i(u("u_tex"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, p.rivers);
      gl.uniform1i(u("u_rivers"), 1);
      gl.uniform1f(u("u_hasRivers"), p.rivers ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniformMatrix4fv(u("u_viewProj"), false, p.viewProj);
      gl.uniform2f(u("u_size"), p.size[0], p.size[1]);
      gl.uniform1f(u("u_exag"), p.exag);
      gl.uniform3f(u("u_decode"), p.decode[0], p.decode[1], p.decode[2]);
      gl.uniform1f(u("u_step"), p.step);
      gl.uniform1f(u("u_power"), p.power);
      gl.uniform1f(u("u_reach"), p.reach);
      gl.uniform2fv(u("u_city[0]"), p.city);
      gl.uniform3f(u("u_pointer"), p.pointer[0], p.pointer[1], p.pointer[2]);
      gl.uniform1f(u("u_aspect"), p.aspect);
      gl.uniform3fv(u("u_tap[0]"), p.taps);
      gl.uniform1f(u("u_reachF"), p.reach);
      gl.uniform1f(u("u_hushX"), p.aspect < 0.85 ? 1.15 : 0.6);
      const L = p.look;
      gl.uniform3fv(u("u_sun"), L.sun);
      gl.uniform3fv(u("u_cLight"), L.light);
      gl.uniform3fv(u("u_cShade"), L.shade);
      gl.uniform3fv(u("u_cSnowShade"), L.snowShade);
      gl.uniform3fv(u("u_cFloor"), L.floor);
      gl.uniform3fv(u("u_cGlow"), L.glow);
      gl.uniform3fv(u("u_cRiver"), L.river);
      gl.uniform3fv(u("u_cSky"), L.sky);
      gl.uniform3fv(u("u_cLine"), L.line);
      gl.uniform3fv(u("u_cHill"), L.hill);
      gl.uniform3fv(u("u_cHillShade"), L.hillShade);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
    },
    dispose() {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}
