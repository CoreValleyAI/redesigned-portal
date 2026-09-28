/**
 * The director runs first every frame. It flies the camera and grades the
 * world.
 *
 * SMOOTHNESS. Every moving quantity (progress, height, gaze, lens, roll,
 * pointer, theme) is a critically damped spring (the SmoothDamp integrator),
 * stepped at a fixed 120 Hz inside each frame. The result depends only on
 * elapsed time, never on the frame rate, so a dropped frame costs a longer
 * step, not a jolt. Flight speed is the progress spring's own velocity, not
 * a difference of noisy samples, so the effects that follow speed (lens
 * widening, banking, surges) are as smooth as the flight itself. Nothing is
 * clamped mid-motion: the ground is avoided by raising the spring's target
 * with a look-ahead that grows with speed.
 *
 * PATH. Distance down the valley follows scroll progress; height, offset from
 * the river and where the camera looks come from a Catmull-Rom spline
 * through the section stations (lib/stations.ts). Approaching the finale the
 * gaze swings from the river to the heart of the Kathmandu Valley and sweeps
 * slowly across it.
 *
 * GRADE. Colours blend between the two nearest stations, and between the
 * dark and light sets as the theme crossfades.
 */
import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { flight, stationAt } from "../../lib/flight";
import { DROP_CURVE, GRADES, POSE_CURVE, STATIONS, type ParsedGrade } from "../../lib/stations";
import { themeTarget } from "../../lib/theme";
import { BASIN_X, BASIN_Z, heightAt, riverX, Z_END, Z_START } from "./field";
import { GLOW_MATERIALS, WORLD } from "./world";

/** Live values the effects read each frame. */
export const live = { bloom: 1, focus: 34 };

/** A critically damped spring (Unity's SmoothDamp). */
class Spring {
  vel = 0;
  constructor(public value: number) {}
  step(target: number, smoothTime: number, dt: number) {
    const omega = 2 / Math.max(1e-4, smoothTime);
    const x = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = this.value - target;
    const temp = (this.vel + omega * change) * dt;
    this.vel = (this.vel - omega * temp) * exp;
    this.value = target + (change + temp) * exp;
    return this.value;
  }
}

const SUBSTEP = 1 / 120;
const SPAN = Z_END - Z_START;
const tmp = new THREE.Vector3();
const right = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const gA = { low: new THREE.Color(), high: new THREE.Color(), river: new THREE.Color(), accent: new THREE.Color(), warm: new THREE.Color(), fog: new THREE.Color(), sky: new THREE.Color(), horizon: new THREE.Color(), bloom: 1 };
const gB = { ...gA, low: new THREE.Color(), high: new THREE.Color(), river: new THREE.Color(), accent: new THREE.Color(), warm: new THREE.Color(), fog: new THREE.Color(), sky: new THREE.Color(), horizon: new THREE.Color() };
type Mutable = typeof gA;

function blend(out: Mutable, a: ParsedGrade, b: ParsedGrade, k: number) {
  out.low.copy(a.low).lerp(b.low, k);
  out.high.copy(a.high).lerp(b.high, k);
  out.river.copy(a.river).lerp(b.river, k);
  out.accent.copy(a.accent).lerp(b.accent, k);
  out.warm.copy(a.warm).lerp(b.warm, k);
  out.fog.copy(a.fog).lerp(b.fog, k);
  out.sky.copy(a.sky).lerp(b.sky, k);
  out.horizon.copy(a.horizon).lerp(b.horizon, k);
  out.bloom = a.bloom + (b.bloom - a.bloom) * k;
}

/** Height the camera must clear at distance z, looking `reach` units ahead. */
function groundAhead(z: number, lat: number, reach: number) {
  let need = -1e9;
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const dz = -4 + ((reach + 4) * i) / n;
    const zz = z + dz;
    need = Math.max(need, heightAt(riverX(zz) + lat, zz) + 2.8 - 0.03 * Math.max(0, dz));
  }
  return need;
}

export function Director() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const st = React.useRef<{
    prog: Spring; y: Spring; tx: Spring; ty: Spring; tz: Spring; fov: Spring; roll: Spring;
    px: Spring; py: Spring; pk: Spring; theme: Spring; fps: number; init: boolean;
  } | null>(null);

  // A click anywhere on the world (not on the interface) sends a ripple.
  React.useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button, input, [data-ui]")) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      WORLD.uPing.value.set(x, y, WORLD.uTime.value);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  useFrame((_, rawDt) => {
    const reduced = flight.reducedMotion;
    const dt = Math.min(rawDt, 0.25);
    if (!st.current) {
      const t0 = themeTarget();
      st.current = {
        prog: new Spring(flight.target), y: new Spring(30), tx: new Spring(0), ty: new Spring(0), tz: new Spring(60),
        fov: new Spring(52), roll: new Spring(0), px: new Spring(0), py: new Spring(0), pk: new Spring(0),
        theme: new Spring(t0), fps: 60, init: true,
      };
      WORLD.uTheme.value = t0;
    }
    const s = st.current;
    s.fps += (1 / Math.max(rawDt, 1e-3) - s.fps) * (1 - Math.exp(-3 * dt));

    WORLD.uTime.value += reduced ? dt * 0.25 : Math.min(dt, 1 / 20);
    WORLD.uPR.value = gl.getPixelRatio();
    WORLD.uRise.value = reduced ? 1 : Math.min(1, WORLD.uRise.value + dt / 3.4);

    const p = flight.pointer;
    const live_ = p.active && performance.now() - p.lastMove < 2500;
    const tTheme = themeTarget();

    // Fixed-step integration of every spring.
    const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
    const h = dt / steps;
    let pose = { alt: 0, lat: 0, ahead: 0, drop: 0 }, z = 0, x = 0, speed = 0, i0 = 0, j0 = 0, t0 = 0, finale = 0;
    for (let k = 0; k < steps; k++) {
      s.prog.step(flight.target, reduced ? 0.04 : 0.32, h);
      const prog = Math.min(1, Math.max(0, s.prog.value));
      speed = Math.min(1, Math.abs(s.prog.vel) * 12);

      const [i, j, t] = stationAt(prog);
      i0 = i; j0 = j; t0 = t;
      const u = STATIONS.length > 1 ? Math.min(1, (i + t * (j - i)) / (STATIONS.length - 1)) : 0;
      POSE_CURVE.getPoint(u, tmp);
      pose = { alt: tmp.x, lat: tmp.y, ahead: tmp.z, drop: DROP_CURVE.getPoint(u).x };

      // The finale: from partway into the last stretch to its end.
      const stops = flight.stops;
      if (stops.length >= 2) {
        const a = stops[stops.length - 2]!, b = stops[stops.length - 1]!;
        const f = Math.min(1, Math.max(0, (prog - (a + (b - a) * 0.25)) / ((b - a) * 0.75 || 1)));
        finale = f * f * (3 - 2 * f);
      }

      z = Z_START + SPAN * prog;
      x = riverX(z) + pose.lat;
      const reach = 26 + Math.abs(s.prog.vel) * SPAN * 0.7;
      const wantY = Math.max(-0.9 + pose.alt, groundAhead(z, pose.lat, reach));
      s.y.step(wantY, s.init ? 1e-4 : 0.55, h);
      const floor = heightAt(x, z) + 1.1;
      if (s.y.value < floor) { s.y.value = floor; s.y.vel = Math.max(0, s.y.vel); }

      // Gaze: down the river, swinging to the valley's heart for the finale.
      const tz = z + pose.ahead;
      let gx = riverX(tz) + pose.lat * 0.35, gy = s.y.value - pose.drop, gz = tz;
      const sweep = reduced ? 0 : Math.sin(WORLD.uTime.value * 0.07) * 9;
      gx += (BASIN_X + sweep - gx) * finale;
      gz += (BASIN_Z - 6 - gz) * finale;
      gy += (heightAt(BASIN_X, BASIN_Z) + 5 - gy) * finale;
      s.px.step(live_ ? p.x : 0, 0.45, h);
      s.py.step(live_ ? p.y : 0, 0.45, h);
      s.pk.step(live_ ? 1 : 0, 0.35, h);
      s.tx.step(gx, s.init ? 1e-4 : 0.3, h);
      s.ty.step(gy, s.init ? 1e-4 : 0.3, h);
      s.tz.step(gz, s.init ? 1e-4 : 0.3, h);

      // Bank into the river's bends at speed, and a little toward the pointer.
      const curve = (riverX(z + 8) - 2 * riverX(z) + riverX(z - 8)) / 64;
      const wantRoll = reduced ? 0 : THREE.MathUtils.clamp(-curve * (6 + speed * 60) - s.px.value * 0.05, -0.2, 0.2) * (1 - finale);
      s.roll.step(wantRoll, 0.6, h);

      const baseFov = camera.aspect < 0.8 ? 68 : camera.aspect < 1.2 ? 60 : 52;
      s.fov.step(baseFov + (reduced ? 0 : speed * 14) + finale * 4, 0.5, h);
      s.theme.step(tTheme, 0.28, h);
      s.init = false;
    }

    // Place the camera.
    const bob = reduced ? 0 : Math.sin(WORLD.uTime.value * 0.5) * 0.18;
    camera.position.set(x, s.y.value + bob, z);
    tmp.set(s.tx.value, s.ty.value, s.tz.value);
    right.subVectors(tmp, camera.position).cross(UP).normalize();
    const reachLook = pose.ahead * (1 - finale * 0.4);
    tmp.addScaledVector(right, s.px.value * reachLook * 0.12).addScaledVector(UP, s.py.value * reachLook * 0.07);
    camera.lookAt(tmp);
    camera.rotateZ(s.roll.value);
    if (Math.abs(camera.fov - s.fov.value) > 0.005) {
      camera.fov = s.fov.value;
      camera.updateProjectionMatrix();
    }
    live.focus = camera.position.distanceTo(tmp);

    // Theme crossfade: glow layers switch blending at the midpoint.
    const th = Math.min(1, Math.max(0, s.theme.value));
    WORLD.uTheme.value = th;
    // Checked per material, so a layer created (or re-created for a new
    // tier) on either side of the switch always ends up right.
    const want = th > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
    GLOW_MATERIALS.forEach((m) => {
      if (m.blending !== want) {
        m.blending = want;
        m.needsUpdate = true;
      }
    });

    // Pointer, finale, grade.
    WORLD.uPointer.value.set(p.x, p.y);
    WORLD.uPointerK.value = reduced ? 0 : s.pk.value;
    WORLD.uVel.value = s.prog.vel;
    WORLD.uCamZ.value = z;
    WORLD.uFinale.value = finale;
    const kk = t0 * t0 * (3 - 2 * t0);
    blend(gA, GRADES[i0]![0], GRADES[j0]![0], kk);
    blend(gB, GRADES[i0]![1], GRADES[j0]![1], kk);
    WORLD.uLow.value.copy(gA.low).lerp(gB.low, th);
    WORLD.uHigh.value.copy(gA.high).lerp(gB.high, th);
    WORLD.uRiver.value.copy(gA.river).lerp(gB.river, th);
    WORLD.uAccent.value.copy(gA.accent).lerp(gB.accent, th);
    WORLD.uWarm.value.copy(gA.warm).lerp(gB.warm, th);
    WORLD.uSky.value.copy(gA.sky).lerp(gB.sky, th);
    WORLD.uHorizon.value.copy(gA.horizon).lerp(gB.horizon, th);
    WORLD.uFog.value.copy(gA.fog).lerp(gB.fog, th).lerp(WORLD.uHorizon.value, 0.3);
    live.bloom = (gA.bloom + (gB.bloom - gA.bloom) * th) * (1 + speed * 0.35);
    // The far valley needs a longer view.
    // Ink on porcelain fades faster than light on black: hold the haze back in the light.
    WORLD.uFogNear.value = 60 + finale * 40 + th * 35;
    WORLD.uFogFar.value = 230 + finale * 60 + th * 15;

    // Telemetry for the HUD: Kathmandu's valley floor sits near 1,350 m.
    const dz = riverX(z + 1) - riverX(z - 1);
    flight.progress = s.prog.value;
    flight.velocity = s.prog.vel;
    flight.telemetry.altitude = 1350 + (s.y.value + 0.9) * 18;
    flight.telemetry.heading = ((Math.atan2(dz, 2) * 180) / Math.PI + 360) % 360;
    flight.telemetry.speed = Math.abs(s.prog.vel) * SPAN * 18;
    flight.telemetry.fps = s.fps;
    flight.telemetry.z = z;
  }, -1);

  return null;
}
