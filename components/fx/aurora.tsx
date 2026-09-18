"use client";

/**
 * The moving ground: a shader gradient that drifts behind the marketing
 * pages the way a slow weather system does. Two domain-warped noise fields
 * shape soft bodies of Hydro green and a cooler teal over Carbon, held at low
 * alpha so copy stays legible and green stays a signal rather than a wash.
 *
 * A fixed, full-viewport WebGL canvas rendered at half resolution: one
 * fragment shader per frame, no geometry, ~1 ms on integrated graphics. It
 * reacts to the pointer (a slow lean of the field) and to scroll (the field
 * advances with the page so sections do not all sit on the same colour).
 *
 * `prefers-reduced-motion`: one static frame. Tab hidden: the loop sleeps.
 * No WebGL: nothing is drawn; the Carbon ground is already there.
 */

import * as React from "react";

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision mediump float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;   // -1..1
uniform float uScroll;    // page scroll in px

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + vec2(11.3, 7.1);
    a *= 0.5;
  }
  return s;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0);
  // Scroll advances the field so each section sits on different weather.
  p.y += uScroll * 0.00035;
  p += uPointer * 0.08;
  float t = uTime * 0.045;

  // Domain warp: one field bends the coordinates of the next, which is what
  // turns blobs into slow, folded bodies of colour.
  vec2 q = vec2(fbm(p * 0.9 + t), fbm(p * 0.9 - t * 0.6 + 3.7));
  float f = fbm(p * 0.8 + q * 1.7);
  float g = smoothstep(0.38, 0.9, f);
  float k = smoothstep(0.5, 0.95, fbm(p * 0.7 - q * 1.2 + 9.1));

  vec3 deep  = vec3(11.0, 46.0, 26.0) / 255.0;    // hydro-900
  vec3 hydro = vec3(74.0, 222.0, 128.0) / 255.0;  // hydro
  vec3 teal  = vec3(56.0, 189.0, 248.0) / 255.0;  // info
  vec3 col = mix(deep, hydro, g);
  col = mix(col, teal, k * 0.55);

  // Keep the left of the viewport — where copy usually sits — a little
  // quieter than the right.
  float side = 0.7 + 0.3 * smoothstep(0.15, 0.85, uv.x);
  float a = (0.05 + g * 0.3 + k * 0.12) * side;
  gl_FragColor = vec4(col * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[aurora] shader:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function Aurora({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One full-screen triangle.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      scroll: gl.getUniformLocation(program, "uScroll"),
    };

    let running = false;
    let frame = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const resize = () => {
      // Half resolution: the field is soft by nature and the page cannot
      // tell, but the fill cost drops fourfold.
      const scale = 0.5;
      canvas.width = Math.max(2, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(2, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      if (!running) draw(performance.now());
    };

    const t0 = performance.now();
    const draw = (now: number) => {
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      gl.uniform1f(u.time, reduced ? 0 : (now - t0) / 1000);
      gl.uniform2f(u.pointer, px, py);
      gl.uniform1f(u.scroll, window.scrollY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        pointerEvents: "none",
      }}
    />
  );
}
