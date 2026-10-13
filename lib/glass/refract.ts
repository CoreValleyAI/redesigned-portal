/**
 * Liquid-glass refraction for DOM glass, Chromium only (05 §4).
 *
 * `backdrop-filter: url(#filter)` lets an SVG feDisplacementMap bend the
 * backdrop. Safari and Firefox parse that value and then drop the whole
 * filter at paint time (WebKit 245510, Mozilla 1989910), and @supports
 * cannot tell, so it is added from script, only in Chromium, on top of the
 * CSS glass every browser already shows.
 *
 * The map: for a rounded rectangle, a bezel band at the rim whose height
 * follows a convex squircle; each pixel stores, in R and G, where to read
 * the backdrop from — the shift of a vertical ray refracted once at the
 * bezel (Snell, n = 1.5), along the inward normal. After kube.io's
 * "Liquid Glass in the browser" and Kyant's AndroidLiquidGlass.
 */

interface MapOptions {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  thickness: number;
}

const LUT = 96;

function profile(bezel: number, thick: number, ior = 1.5) {
  const out = new Float32Array(LUT);
  for (let i = 0; i < LUT; i++) {
    const x = (i + 0.5) / LUT;
    const a = 1 - x;
    const h = Math.pow(1 - a ** 4, 0.25);
    const slope = a ** 3 * Math.pow(Math.max(1 - a ** 4, 1e-6), -0.75);
    const t1 = Math.atan(slope * (thick / bezel));
    const t2 = Math.asin(Math.sin(t1) / ior);
    out[i] = thick * h * Math.tan(t1 - t2);
  }
  return out;
}

/** Signed distance (< 0 inside) and outward normal of a rounded rectangle. */
function sd(px: number, py: number, hw: number, hh: number, r: number): [number, number, number] {
  const sx = px < 0 ? -1 : 1;
  const sy = py < 0 ? -1 : 1;
  const qx = Math.abs(px) - (hw - r);
  const qy = Math.abs(py) - (hh - r);
  if (qx > 0 && qy > 0) {
    const len = Math.hypot(qx, qy) || 1e-4;
    return [len - r, (sx * qx) / len, (sy * qy) / len];
  }
  return qx > qy ? [qx - r, sx, 0] : [qy - r, 0, sy];
}

function mapDataUrl(o: MapOptions): { href: string; scale: number } {
  const w = Math.max(1, Math.round(o.width));
  const h = Math.max(1, Math.round(o.height));
  const hw = w / 2;
  const hh = h / 2;
  const r = Math.min(o.radius, hw, hh);
  const bezel = Math.max(1, Math.min(o.bezel, hw, hh));
  const lut = profile(bezel, o.thickness);
  const max = Math.max(...lut) || 1;
  const rN = Math.min(Math.max(r, bezel * 1.5), hw, hh);
  const data = new Uint8ClampedArray(w * h * 4);
  const put = (i: number, j: number, ox: number, oy: number) => {
    const k = (j * w + i) * 4;
    data[k] = 128 + Math.round(ox * 127);
    data[k + 1] = 128 + Math.round(oy * 127);
    data[k + 2] = 128;
    data[k + 3] = 255;
  };
  // One quadrant, mirrored.
  for (let j = 0; j < Math.ceil(h / 2); j++)
    for (let i = 0; i < Math.ceil(w / 2); i++) {
      const px = i + 0.5 - hw;
      const py = j + 0.5 - hh;
      const inside = -sd(px, py, hw, hh, r)[0];
      let ox = 0;
      let oy = 0;
      if (inside > 0 && inside < bezel) {
        const [, nx, ny] = sd(px, py, hw, hh, rN);
        const t = Math.min(LUT - 1, Math.max(0, (inside / bezel) * LUT - 0.5));
        const i0 = Math.floor(t);
        const i1 = Math.min(LUT - 1, i0 + 1);
        const s = (lut[i0]! * (1 - (t - i0)) + lut[i1]! * (t - i0)) / max;
        ox = -nx * s;
        oy = -ny * s;
      }
      put(i, j, ox, oy);
      put(w - 1 - i, j, -ox, oy);
      put(i, h - 1 - j, ox, -oy);
      put(w - 1 - i, h - 1 - j, -ox, -oy);
    }
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.putImageData(new ImageData(data, w, h), 0, 0);
  return { href: c.toDataURL("image/png"), scale: 2 * max };
}

/** Chromium, without "more contrast" or forced colours, on a device with
    room to spare. (Reduced transparency only makes the glass denser: the
    bend at the rim does not cost legibility.) */
export function canRefract(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    userAgentData?: { brands?: { brand: string }[] };
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (!nav.userAgentData?.brands?.some((b) => b.brand === "Chromium")) return false;
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 6) return false;
  return !matchMedia("(prefers-contrast: more), (forced-colors: active)")
    .matches;
}

let host: SVGSVGElement | null = null;
let seq = 0;

/** Adds refraction to an element that already has the CSS glass look.
    Returns a cleanup. `blur` and `saturate` repeat the CSS glass so the
    look matches; `bezel` is the refracting rim, CSS px. */
export function refract(
  el: HTMLElement,
  { bezel = 14, blur = 14, saturate = 1.75 }: { bezel?: number; blur?: number; saturate?: number } = {},
): () => void {
  if (!host) {
    host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    document.body.append(host);
  }
  const base = `lgr${++seq}`;
  let version = 0;
  let filter: SVGFilterElement | null = null;
  let last = "";
  const ro = new ResizeObserver(([entry]) => {
    const box = entry?.borderBoxSize?.[0];
    const width = Math.round(box?.inlineSize ?? el.offsetWidth);
    const height = Math.round(box?.blockSize ?? el.offsetHeight);
    if (!width || !height) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const sig = `${width}x${height}r${radius}`;
    if (sig === last) return;
    last = sig;
    const b = Math.min(bezel, height * 0.42, width * 0.42);
    const { href, scale } = mapDataUrl({ width, height, radius, bezel: b, thickness: b * 1.7 });
    const id = `${base}-${++version}`;
    filter?.remove();
    filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.id = id;
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(width));
    filter.setAttribute("height", String(height));
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    filter.innerHTML =
      `<feImage href="${href}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" result="map"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
    host!.append(filter);
    el.style.setProperty("backdrop-filter", `url(#${id}) blur(${blur}px) saturate(${saturate})`);
    el.dataset.refract = "on";
  });
  ro.observe(el, { box: "border-box" });
  return () => {
    ro.disconnect();
    filter?.remove();
    el.style.removeProperty("backdrop-filter");
    if (el.dataset.refract === "on") el.dataset.refract = "";
  };
}
