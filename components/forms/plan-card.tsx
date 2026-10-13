"use client";

/**
 * The plan card (S13): what a visitor just asked for, summarised, at the
 * end of the contact form. The reference code is stamped in the site's dot
 * face and its dots arrive one after another. The card can be saved as an
 * image (drawn on a canvas from the same data: the brand mark, the dot
 * reference, the rows), handed to the phone's share sheet, or used to
 * start another request with the same answers.
 *
 * Name, email and phone never appear on the card or in the image: an image
 * is easy to forward.
 */
import { useEffect, useRef, useState } from "react";
import { BRANDMARK } from "@/components/brand/paths";
import { Arrow, Button, ButtonLink } from "@/components/system/button";
import { DOT_FONT, DotText } from "@/components/system/dot-text";
import { DotGlyph } from "@/components/system/dot-glyph";

export interface PlanRow {
  label: string;
  value: string;
}

export function PlanCard({
  title,
  lead,
  reference,
  rows,
  next,
  againHref,
  headingRef,
}: {
  title: string;
  lead: string;
  reference: string;
  rows: PlanRow[];
  next: readonly string[];
  /** A new request with the same answers (workload requests only). */
  againHref?: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  const [canShare, setCanShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // The share sheet exists only on some devices, and only in the browser.
  useEffect(() => {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    const probe = new File([new Blob()], "x.png", { type: "image/png" });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a browser capability, known only after mount
    setCanShare(typeof nav.share === "function" && Boolean(nav.canShare?.({ files: [probe] })));
  }, []);

  const file = async () => {
    const blob = await drawCard(cardRef.current, { title, lead, reference, rows });
    return new File([blob], `corevalley-request-${reference || "plan"}.png`, { type: "image/png" });
  };

  const save = async () => {
    setBusy(true);
    try {
      const f = await file();
      const url = URL.createObjectURL(f);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const f = await file();
      await navigator.share({ files: [f], title: `CoreValley request ${reference}` });
    } catch {
      /* cancelled, or refused: nothing to do */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="overflow-hidden rounded-panel border border-line bg-bg-raised"
      style={{ animation: "cv-rise-in 600ms var(--ease-expo) both" }}
    >
      <div className="flex flex-col gap-6 p-7 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <DotGlyph name="contact" className="size-12" on />
          <p className="type-kicker text-ink-3">Plan card</p>
        </div>
        <h2 ref={headingRef} tabIndex={-1} className="type-title-1 outline-none">
          {title}
        </h2>
        <p className="type-lead text-ink-2">{lead}</p>

        {reference && (
          <div className="flex flex-col gap-3 rounded-card bg-bg-sunken p-5">
            <p className="type-kicker text-ink-3">Your reference</p>
            <DotText
              text={reference}
              label={`Reference ${reference}`}
              assemble
              className="h-9 w-auto max-w-full self-start md:h-11"
              litClassName="text-hydro-ink light:text-hydro"
            />
          </div>
        )}

        {rows.length > 0 && (
          <dl className="flex flex-col">
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 border-t border-line py-3.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="type-kicker text-ink-3 sm:pt-0.5">{r.label}</dt>
                <dd className="type-body text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <ol className="flex flex-col gap-3 border-t border-line pt-6">
          {next.map((s, i) => (
            <li key={s} className="type-body flex gap-4 text-ink-2">
              <span className="type-kicker mt-1 text-hydro-ink light:text-hydro">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-bg-sunken/60 px-7 py-5 md:px-10">
        <Button variant="secondary" onClick={() => void save()} disabled={busy}>
          Save as image
        </Button>
        {canShare && (
          <Button variant="secondary" onClick={() => void share()} disabled={busy}>
            Share
          </Button>
        )}
        {againHref && (
          <ButtonLink href={againHref} variant="ghost" className="sm:ml-auto">
            Start another like this
            <Arrow />
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

/* ── The image ─────────────────────────────────────────────────────────── */

const W = 1200;
const PAD = 72;

/**
 * Draw the card on a canvas in the page's current theme: the brand mark,
 * the title, the reference in dots, the rows and a footer. Fonts are the
 * page's own (already loaded), colours its tokens.
 */
async function drawCard(
  el: HTMLElement | null,
  data: { title: string; lead: string; reference: string; rows: PlanRow[] },
): Promise<Blob> {
  await document.fonts?.ready;
  const cs = getComputedStyle(el ?? document.documentElement);
  const tok = (name: string) => cs.getPropertyValue(name).trim() || "#888";
  const sans = getComputedStyle(document.body).fontFamily;
  const mono = cs.getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";

  // Measure first, then draw at 2× for sharpness.
  const scratch = document.createElement("canvas").getContext("2d")!;
  const lines = (text: string, font: string, width: number) => {
    scratch.font = font;
    const out: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (scratch.measureText(next).width > width && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    if (line) out.push(line);
    return out;
  };
  const titleFont = `600 64px ${sans}`;
  const leadFont = `400 30px ${sans}`;
  const labelFont = `500 18px ${mono}`;
  const valueFont = `400 28px ${sans}`;
  const valueX = PAD + 230;
  const valueW = W - valueX - PAD;
  const rowLines = data.rows.map((r) => lines(r.value, valueFont, valueW));
  const H =
    PAD +
    64 + // mark
    40 +
    80 + // title
    lines(data.lead, leadFont, W - PAD * 2).length * 42 +
    40 +
    (data.reference ? 150 : 0) +
    rowLines.reduce((h, l) => h + 28 + l.length * 38, 0) +
    40 +
    40 + // footer
    PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const g = canvas.getContext("2d")!;
  g.scale(2, 2);

  // Ground.
  g.fillStyle = tok("--bg-raised");
  g.fillRect(0, 0, W, H);
  g.strokeStyle = tok("--line");
  g.lineWidth = 2;
  g.strokeRect(1, 1, W - 2, H - 2);

  // The brand mark, from its own paths.
  const [vx, vy, vw] = BRANDMARK.viewBox;
  const k = 92 / vw;
  g.save();
  g.translate(PAD - vx * k, PAD - vy * k);
  g.scale(k, k);
  const G = BRANDMARK.gradient;
  const grad = g.createLinearGradient(G.x1, G.y1, G.x2, G.y2);
  grad.addColorStop(0, G.from);
  grad.addColorStop(1, G.to);
  g.fillStyle = grad;
  for (const d of BRANDMARK.paths) g.fill(new Path2D(d));
  g.restore();
  g.font = labelFont;
  g.fillStyle = tok("--ink-3");
  g.textAlign = "right";
  g.fillText("PLAN CARD", W - PAD, PAD + 36);
  g.textAlign = "left";

  let y = PAD + 64 + 40;
  g.fillStyle = tok("--ink");
  g.font = titleFont;
  y += 64;
  g.fillText(data.title, PAD, y);
  y += 16;
  g.font = leadFont;
  g.fillStyle = tok("--ink-2");
  for (const l of lines(data.lead, leadFont, W - PAD * 2)) {
    y += 42;
    g.fillText(l, PAD, y);
  }
  y += 40;

  // The reference, in dots.
  if (data.reference) {
    g.fillStyle = tok("--bg-sunken");
    roundRect(g, PAD, y, W - PAD * 2, 130, 20);
    g.fill();
    g.font = labelFont;
    g.fillStyle = tok("--ink-3");
    g.fillText("YOUR REFERENCE", PAD + 28, y + 38);
    const pitch = 9;
    let cx = PAD + 28;
    const top = y + 56;
    const lit = tok("--hydro");
    const off = tok("--dot-off");
    for (const ch of data.reference.toUpperCase()) {
      const rows = DOT_FONT[ch] ?? DOT_FONT[" "]!;
      rows.forEach((row, ry) => {
        Array.from(row).forEach((d, rx) => {
          g.beginPath();
          g.fillStyle = d === "#" ? lit : off;
          g.globalAlpha = d === "#" ? 1 : 0.6;
          g.arc(cx + rx * pitch + pitch / 2, top + ry * pitch + pitch / 2, d === "#" ? 3.4 : 2, 0, Math.PI * 2);
          g.fill();
        });
      });
      g.globalAlpha = 1;
      cx += 6 * pitch;
    }
    y += 150;
  }

  // The rows.
  data.rows.forEach((r, i) => {
    g.strokeStyle = tok("--line");
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(PAD, y);
    g.lineTo(W - PAD, y);
    g.stroke();
    g.font = labelFont;
    g.fillStyle = tok("--ink-3");
    g.fillText(r.label.toUpperCase(), PAD, y + 40);
    g.font = valueFont;
    g.fillStyle = tok("--ink");
    rowLines[i]!.forEach((l, li) => g.fillText(l, valueX, y + 42 + li * 38));
    y += 28 + rowLines[i]!.length * 38;
  });

  // Footer.
  y += 40;
  g.font = labelFont;
  g.fillStyle = tok("--ink-3");
  g.fillText("COREVALLEY.AI · NEPAL'S GPU CLOUD, IN THE KATHMANDU VALLEY", PAD, y + 24);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
