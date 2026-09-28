/**
 * One station per page section: where the camera flies and how the world is
 * graded there, in both themes. The camera runs a Catmull-Rom spline through
 * the stations' poses; colours blend between neighbours, and between the
 * dark and light sets as the theme crossfades.
 *
 * Dark: obsidian and midnight, electric cyan with neon-pink accents, shifting
 * toward violet in the depths and magenta at dawn. Light: porcelain sky,
 * graphite terrain, deep cyan water, magenta accents.
 */
import * as THREE from "three";

export interface Pose {
  /** Height above the riverbed. The flight also keeps clear of the ground. */
  alt: number;
  /** Offset from the river's centreline (+ right, looking downstream). */
  lat: number;
  /** How far ahead the camera looks, and how far below its own height. */
  ahead: number;
  drop: number;
}

export interface Grade {
  low: string; // dots on low ground
  high: string; // dots on the crests
  river: string; // the data river and its glow
  accent: string; // packets, the pointer, the Dharahara
  warm: string; // city lights and temple gold in the finale
  fog: string;
  sky: string;
  horizon: string;
  bloom: number;
}

export interface Station {
  id: string;
  label: string;
  pose: Pose;
  dark: Grade;
  light: Grade;
}

const LIGHT_BASE: Grade = {
  low: "#8d969e",
  high: "#11161b",
  river: "#0b6f86",
  accent: "#c81d67",
  warm: "#a4540f",
  fog: "#eceeeb",
  sky: "#e7ecef",
  horizon: "#f6f3ee",
  bloom: 0.25,
};

export const STATIONS: Station[] = [
  {
    id: "range",
    label: "The range",
    pose: { alt: 34, lat: 0, ahead: 70, drop: 15 },
    dark: { low: "#0b3040", high: "#c9f6ff", river: "#22d3ee", accent: "#ff4fb0", warm: "#ffb86b", fog: "#03060b", sky: "#010207", horizon: "#0a2c42", bloom: 1.05 },
    light: LIGHT_BASE,
  },
  {
    id: "compute",
    label: "Compute",
    pose: { alt: 21, lat: 15, ahead: 46, drop: 8 },
    dark: { low: "#0a3444", high: "#d4fbff", river: "#2de2e6", accent: "#ff5cc0", warm: "#ffb86b", fog: "#02070a", sky: "#010306", horizon: "#093848", bloom: 1.15 },
    light: { ...LIGHT_BASE, horizon: "#f1f4f3", river: "#0a7482" },
  },
  {
    id: "river",
    label: "The river",
    pose: { alt: 3.2, lat: 0, ahead: 38, drop: 1.2 },
    dark: { low: "#0b2a54", high: "#d1e7ff", river: "#38bdf8", accent: "#ff4fd8", warm: "#ffb86b", fog: "#02050c", sky: "#010209", horizon: "#0c2a5a", bloom: 1.35 },
    light: { ...LIGHT_BASE, low: "#8699aa", sky: "#e3eaf0", horizon: "#eef3f7", river: "#0b5f96" },
  },
  {
    id: "scale",
    label: "Scale",
    pose: { alt: 13, lat: -11, ahead: 50, drop: 4 },
    dark: { low: "#231a54", high: "#e8ddff", river: "#7dd3fc", accent: "#ff4fb0", warm: "#ffb86b", fog: "#04030c", sky: "#02010a", horizon: "#2a1a58", bloom: 1.2 },
    light: { ...LIGHT_BASE, low: "#928fa8", horizon: "#f2f0f6", accent: "#b3207a" },
  },
  {
    id: "platform",
    label: "Platform",
    pose: { alt: 27, lat: 7, ahead: 60, drop: 11 },
    dark: { low: "#1b2452", high: "#dde8ff", river: "#5eead4", accent: "#f472b6", warm: "#ffb86b", fog: "#03040a", sky: "#010207", horizon: "#1a2656", bloom: 1.1 },
    light: { ...LIGHT_BASE, horizon: "#eff2f6" },
  },
  {
    id: "sovereign",
    label: "Sovereign",
    pose: { alt: 46, lat: 0, ahead: 95, drop: 17 },
    dark: { low: "#2e2240", high: "#ffe8f3", river: "#22d3ee", accent: "#ff6fae", warm: "#ffb46b", fog: "#08050a", sky: "#030208", horizon: "#4a1c40", bloom: 1.1 },
    light: { ...LIGHT_BASE, horizon: "#f8ede6", sky: "#ecebed", low: "#9a8f92" },
  },
  {
    id: "kathmandu",
    label: "Kathmandu",
    pose: { alt: 30, lat: 0, ahead: 52, drop: 16 },
    dark: { low: "#14233c", high: "#e6f3ff", river: "#22d3ee", accent: "#ff3ea5", warm: "#ffc27a", fog: "#02040a", sky: "#01020a", horizon: "#1b1744", bloom: 1.3 },
    light: { ...LIGHT_BASE, horizon: "#f5eee7", sky: "#e6eaee" },
  },
];

/** Pose spline: x = alt, y = lat, z = ahead; the drop rides a second curve. */
export const POSE_CURVE = new THREE.CatmullRomCurve3(
  STATIONS.map((s) => new THREE.Vector3(s.pose.alt, s.pose.lat, s.pose.ahead)),
  false,
  "centripetal",
);
export const DROP_CURVE = new THREE.CatmullRomCurve3(
  STATIONS.map((s) => new THREE.Vector3(s.pose.drop, 0, 0)),
  false,
  "catmullrom",
  0.5,
);

export interface ParsedGrade {
  low: THREE.Color; high: THREE.Color; river: THREE.Color; accent: THREE.Color; warm: THREE.Color;
  fog: THREE.Color; sky: THREE.Color; horizon: THREE.Color; bloom: number;
}

const parse = (g: Grade): ParsedGrade => ({
  low: new THREE.Color(g.low),
  high: new THREE.Color(g.high),
  river: new THREE.Color(g.river),
  accent: new THREE.Color(g.accent),
  warm: new THREE.Color(g.warm),
  fog: new THREE.Color(g.fog),
  sky: new THREE.Color(g.sky),
  horizon: new THREE.Color(g.horizon),
  bloom: g.bloom,
});

/** Colours as THREE.Color, parsed once: [dark, light] per station. */
export const GRADES = STATIONS.map((s) => [parse(s.dark), parse(s.light)] as const);
