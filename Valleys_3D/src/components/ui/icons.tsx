/**
 * Micro-icons, drawn for this page on a 20 × 20 grid: 1.4 stroke, round caps
 * and joins, no fills except where a dot is the point. One visual language
 * with the dot-matrix world, instead of a borrowed icon set.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** A die with its pins. */
export const IconChip = (p: P) => (
  <Svg {...p}>
    <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
    <rect x="8" y="8" width="4" height="4" rx="0.6" />
    <path d="M8 2.5v2M12 2.5v2M8 15.5v2M12 15.5v2M2.5 8h2M2.5 12h2M15.5 8h2M15.5 12h2" />
  </Svg>
);

/** Stacked memory dies. */
export const IconMemory = (p: P) => (
  <Svg {...p}>
    <path d="M3 7.5 10 4l7 3.5-7 3.5-7-3.5Z" />
    <path d="m3 11 7 3.5 7-3.5" />
    <path d="m3 14.5 7 3.5 7-3.5" opacity="0.55" />
  </Svg>
);

/** Two lanes of traffic: bandwidth. */
export const IconFlow = (p: P) => (
  <Svg {...p}>
    <path d="M3 7h11.5M11.5 4l3 3-3 3" />
    <path d="M17 13H5.5M8.5 10l-3 3 3 3" opacity="0.6" />
  </Svg>
);

/** Three nodes, fully meshed: a fabric. */
export const IconFabric = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="4.5" r="1.8" />
    <circle cx="4.5" cy="14.5" r="1.8" />
    <circle cx="15.5" cy="14.5" r="1.8" />
    <path d="M9 6.1 5.5 12.9M11 6.1l3.5 6.8M6.3 14.5h7.4" />
  </Svg>
);

/** A grid of dots with one lit: a slice. */
export const IconSlice = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="14" height="14" rx="2" />
    <path d="M10 3v14M3 10h14" opacity="0.5" />
    <rect x="3" y="3" width="7" height="7" rx="1.2" fill="currentColor" stroke="none" opacity="0.35" />
  </Svg>
);

/** Layers. */
export const IconLayers = (p: P) => (
  <Svg {...p}>
    <path d="M10 3 3 6.5 10 10l7-3.5L10 3Z" />
    <path d="m3 10 7 3.5 7-3.5" opacity="0.7" />
    <path d="m3 13.5 7 3.5 7-3.5" opacity="0.45" />
  </Svg>
);

/** A location pin over a valley line. */
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M10 16s-4.5-4.2-4.5-7.6a4.5 4.5 0 0 1 9 0C14.5 11.8 10 16 10 16Z" />
    <circle cx="10" cy="8.4" r="1.4" />
    <path d="M3 18h14" opacity="0.5" />
  </Svg>
);

/** The rupee sign. */
export const IconRupee = (p: P) => (
  <Svg {...p}>
    <path d="M6 4h8M6 7.5h8" />
    <path d="M6 4h2.5a3.5 3.5 0 0 1 0 7H6l6 5.5" />
  </Svg>
);

/** A headset. */
export const IconSupport = (p: P) => (
  <Svg {...p}>
    <path d="M4 11V9.5a6 6 0 0 1 12 0V11" />
    <rect x="3" y="11" width="3" height="4.5" rx="1" />
    <rect x="14" y="11" width="3" height="4.5" rx="1" />
    <path d="M16 15.5c0 1.4-1.5 2-3.5 2H11" />
  </Svg>
);

/** A shell prompt. */
export const IconPrompt = (p: P) => (
  <Svg {...p}>
    <path d="m5 7 3 3-3 3M10.5 13.5h4.5" />
  </Svg>
);

export const IconArrow = (p: P) => (
  <Svg {...p}>
    <path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" />
  </Svg>
);

export const IconArrowUpRight = (p: P) => (
  <Svg {...p}>
    <path d="M6 14 14 6M7.5 6H14v6.5" />
  </Svg>
);

export const IconSun = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="3.2" />
    <path d="M10 2.5v1.6M10 15.9v1.6M2.5 10h1.6M15.9 10h1.6M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M4.7 15.3l1.1-1.1M14.2 5.8l1.1-1.1" />
  </Svg>
);

export const IconMoon = (p: P) => (
  <Svg {...p}>
    <path d="M16 12.2A6.5 6.5 0 0 1 7.8 4a6.5 6.5 0 1 0 8.2 8.2Z" />
  </Svg>
);

/** Scroll: a mouse with its wheel. */
export const IconScroll = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="3" width="8" height="14" rx="4" />
    <path d="M10 6v2.5" />
  </Svg>
);

/** Steer: a crosshair. */
export const IconSteer = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="5.5" />
    <path d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3" />
  </Svg>
);

/** Ping: concentric rings from a point. */
export const IconPing = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="10" cy="10" r="4.2" opacity="0.7" />
    <circle cx="10" cy="10" r="7.2" opacity="0.35" />
  </Svg>
);

/** A small pulse line, for live telemetry. */
export const IconPulse = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 10h3.5l2-4.5 3.5 9 2-4.5h4" />
  </Svg>
);
