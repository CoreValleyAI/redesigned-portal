/**
 * The refraction pass behind `.lg-refract`.
 *
 * WHAT THIS REPLACES
 * ──────────────────
 * dashersw/liquid-glass-js gets its refraction by rasterising the document
 * with html2canvas and bending that texture in a per-instance WebGL context.
 * Neither half survives contact with a real page: a browser allows roughly a
 * dozen live WebGL contexts, and this site wants glass on the nav, on every
 * card, on the modal and on the portal panels simultaneously. A full-page
 * html2canvas pass also costs tens of milliseconds and has to be re-run on
 * every scroll, resize and DOM change.
 *
 * The compositor already holds the backdrop as a GPU texture. So instead of
 * capturing it, we hand the compositor a displacement map and let it bend
 * what it already has, via `backdrop-filter: url(#cv-lg-md)`. No capture, no
 * extra context, no per-frame JavaScript — the effect costs one filter node.
 *
 * HOW THE MAP IS BUILT
 * ────────────────────
 * feDisplacementMap offsets each output pixel by
 *     dx = scale * (R/255 - 0.5)      dy = scale * (G/255 - 0.5)
 * so R=G=128 is "sample yourself" — no displacement. The map is therefore a
 * neutral #808000-ish plateau across the middle of the pane with ramps only
 * in the outer 14%:
 *
 *     R:  0 at the left edge  →  128 across the middle  →  255 at the right
 *     G:  0 at the top edge   →  128 across the middle  →  255 at the bottom
 *
 * Negative offsets at the leading edges mean the pane samples from OUTSIDE
 * itself there, squeezing the surrounding page into its border — which is
 * exactly what a thick convex slab does to what lies behind it, and what
 * makes the edge read as ground glass rather than as a blur rectangle.
 *
 * The two ramps are separate linear gradients composited with
 * `mix-blend-mode: screen`, which for disjoint channels is addition: the red
 * ramp contributes only R, the green ramp only G. One image, both axes.
 *
 * Three strengths are published because the pane's thickness should scale
 * with its job — a 64px nav bar bent as hard as a 600px modal looks broken.
 */

/** 100x100 normal map, stretched to any pane by preserveAspectRatio="none". */
function displacementMap(plateau: number): string {
  const a = plateau.toFixed(2);
  const b = (1 - plateau).toFixed(2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'>
<defs>
<linearGradient id='x' x1='0' y1='0' x2='1' y2='0'>
<stop offset='0' stop-color='#000000'/>
<stop offset='${a}' stop-color='#800000'/>
<stop offset='${b}' stop-color='#800000'/>
<stop offset='1' stop-color='#ff0000'/>
</linearGradient>
<linearGradient id='y' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='#000000'/>
<stop offset='${a}' stop-color='#008000'/>
<stop offset='${b}' stop-color='#008000'/>
<stop offset='1' stop-color='#00ff00'/>
</linearGradient>
</defs>
<rect width='100' height='100' fill='#000000'/>
<rect width='100' height='100' fill='url(%23x)'/>
<rect width='100' height='100' fill='url(%23y)' style='mix-blend-mode:screen'/>
</svg>`;
  // Only the characters that are illegal unescaped in a CSS/SVG url() need
  // touching; encodeURIComponent would bloat this fourfold for no gain.
  return `data:image/svg+xml,${svg
    .replace(/\n/g, "")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/"/g, "'")}`;
}

interface LensProps {
  id: string;
  /** Peak edge offset in px. Roughly "how thick is this slab". */
  scale: number;
  /** Where the neutral middle starts, 0-0.5. Smaller = a wider flat centre. */
  plateau: number;
  /**
   * Split the pass into R/G/B at slightly different strengths so the bent
   * edge fringes like real glass. Costs three displacement nodes, so it is
   * reserved for panes that only ever exist once on screen.
   */
  chroma?: boolean;
}

function Lens({ id, scale, plateau, chroma = false }: LensProps) {
  const map = displacementMap(plateau);

  return (
    /* The filter region is the element's own box. Widening it would move the
       map's ramps outside the pane and flatten the very edge we want bent. */
    <filter
      id={id}
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feImage href={map} preserveAspectRatio="none" result="map" />

      {chroma ? (
        <>
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale * 1.09}
            xChannelSelector="R"
            yChannelSelector="G"
            result="rPass"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="gPass"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale * 0.91}
            xChannelSelector="R"
            yChannelSelector="G"
            result="bPass"
          />
          {/* Keep one channel from each pass, drop the rest, then add the
              three single-channel images back together. */}
          <feColorMatrix
            in="rPass"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="rOnly"
          />
          <feColorMatrix
            in="gPass"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="gOnly"
          />
          <feColorMatrix
            in="bPass"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="bOnly"
          />
          <feComposite in="rOnly" in2="gOnly" operator="arithmetic" k2="1" k3="1" result="rg" />
          <feComposite in="rg" in2="bOnly" operator="arithmetic" k2="1" k3="1" />
        </>
      ) : (
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      )}
    </filter>
  );
}

/**
 * Mounted once, in the root layout. Renders nothing visible — it is a
 * definitions-only SVG that the CSS references by id.
 *
 * Kept out of the flow and out of the a11y tree entirely: `aria-hidden` plus
 * a zero-size absolutely positioned host, so it can never affect layout or
 * be announced.
 */
export function LiquidFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <defs>
        {/* Nav: a thin pane. A hard bend on a 64px bar smears the logo. */}
        <Lens id="cv-lg-sm" scale={7} plateau={0.2} />
        {/* Cards, chips, panels — the everyday weight. */}
        <Lens id="cv-lg-md" scale={13} plateau={0.13} />
        {/* Dialogs. One on screen at a time, so it can afford the fringe. */}
        <Lens id="cv-lg-lg" scale={22} plateau={0.1} chroma />
      </defs>
    </svg>
  );
}
