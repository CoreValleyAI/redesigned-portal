# Valleys 3D

A design draft of the CoreValley homepage as a flight through a dot-matrix
mountain range. Scrolling flies the camera down a valley of data. The ridges
carry GPU nodes and a river of light runs along the valley floor. At the end,
the valley opens into the Kathmandu Valley: the city grid, pagodas and stupas,
the Dharahara, the Bagmati and Bishnumati, and the Himalaya behind.

It's live but unlisted at https://corevalley.ai/valleys/ (noindex, not linked
from the site or the sitemap). The site's deploy workflow builds this folder on
its own toolchain and copies `dist/` into `out/valleys/`; the site's ESLint and
TypeScript ignore it.

## Run it

```bash
cd Valleys_3D
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/
```

`?tier=0`, `?tier=1` or `?tier=2` pins a quality tier (low, medium or high) and
stops the pixel ratio from adapting. Use it to judge a look on a slow machine.

## Stack

Vite, React 19, Three.js through React Three Fiber, drei, and
`@react-three/postprocessing`, plus Tailwind CSS v4, Framer Motion and Lenis for
smooth scrolling. Type is Geist and Geist Mono. The icons are drawn for this
page (`src/components/ui/icons.tsx`), not taken from an icon set. Every figure
on the page is one corevalley.ai already publishes (see `src/lib/content.ts`).

## Themes

The page ships dark only: there is no toggle, and `index.html` sets
`<html data-theme="dark">`. The light theme is still in the code, so a toggle
calling `toggleTheme()` from `src/lib/theme.ts` would bring it back.

- **The interface:** every colour is a CSS variable in `src/index.css`, and Tailwind reads them (`bg-bg`, `text-fg-3`, `border-line`, `text-accent` and so on).
- **The scene:** the theme is a crossfade, not a reload. The director eases `uTheme` from 0 to 1, and each station has a dark and a light grade (`src/lib/stations.ts`).
- **Glow layers:** these switch from additive to normal blending at the midpoint of the crossfade.
- **The lens:** bloom, grain, chromatic aberration, depth of field and the vignette all ease down in light mode. Blur and bloom that read as glow on black only wash porcelain out.

## How it's built

| Path | What it does |
|---|---|
| `components/terrain/field.ts` | The world's shape: the river's meander, the valley width, ridged mountains and the Kathmandu basin (floor, rim, the Chobhar gorge and Swayambhu's hill). It's written in GLSL and mirrored in TypeScript, so the camera, the compute nodes and the city all agree with the shaders about where the ground is. |
| `components/terrain/Terrain.tsx` | The range as a grid of up to ~235k points. The grid is a window that travels with the camera and snaps to whole steps, so dots never swim. Heights, contour lines, the pointer's pool of light, click ripples and surges all run in the vertex shader. |
| `components/terrain/DataRiver.tsx` | Light in parallel lanes along the riverbed, with packets racing downstream. It hands over to the Bagmati in the basin. |
| `components/terrain/ComputeNodes.tsx` | GPU nodes on real summits, each with an uplink beam and a sweeping halo, linked by arcs that carry packets: the InfiniBand fabric between nodes. |
| `components/finale/build.ts` | The Kathmandu Valley as points. It covers the old city, Patan and Bhaktapur street grids, the Ring Road, and pagodas (Taleju, Kasthamandap, Pashupatinath, Nyatapola). It also builds Boudhanath and Swayambhunath with their prayer flags, the Dharahara with its spine of light, both rivers, and three layers of rim hills and Himalaya. |
| `components/finale/KathmanduValley.tsx` | The finale's shader: flowing rivers, traffic, windows switching on and off, and rings climbing the Dharahara. It stays asleep (no draw call) until the camera nears it. |
| `components/terrain/Director.tsx` | The camera rig, which runs first each frame. Every moving value is a critically damped spring, stepped at a fixed 120 Hz, so the flight is identical at any frame rate. It avoids the ground by raising the spring's target from a look-ahead, never by clamping mid-motion. Height, offset and gaze follow a Catmull-Rom spline through the stations. The director also crossfades the theme. |
| `components/terrain/Effects.tsx` | Depth of field focused on the gaze, bloom, chromatic aberration, tone mapping (ACES in dark, neutral in light), grain and vignette. All of them are adjusted live. |
| `lib/stations.ts` | One camera pose and a dark and light grade per section. Tune the flight here. |
| `lib/quality.ts` | The GPU tiers. The tier is picked from the device once, at load, and never changes, because the tiers look different and a mid-flight switch reads as the scene going dark. drei's `PerformanceMonitor` lowers (or raises) only the pixel ratio from measured frame times. |
| `lib/theme.ts` | The theme store, shared by the DOM and the scene. |
| `components/sections/` | The page sections. Each is a stretch of scroll with its panel pinned while the camera travels. |
| `components/ui/` | Pointer-lit cards, the micro-icons, the bar with live telemetry, the station rail and the loading veil. |

## Performance

- The pixel ratio is capped per tier (1 / 1.25 / 1.75) and drops toward 1 when frames do.
- Point density, river particles and the finale's detail all scale with the tier.
- The terrain is uploaded once and every frame runs on the GPU. Materials share one uniform object, so a frame writes a handful of values.
- The finale costs nothing until it's near.
- Depth of field only runs on the top tier, and chromatic aberration from the middle tier up.
- The HUD writes telemetry straight to the DOM. React only re-renders when the active section changes.
- Under `prefers-reduced-motion`, scrolling is native, the camera follows it almost directly, ambient motion stops and the range appears already risen.
