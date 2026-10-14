"use client";

/**
 * "Your data is safe with us" (home): the five protections as a schematic
 * beside the list that names them. Your team works into an isolated space
 * where your data and your GPU (or MIG slice) sit; from that space, other
 * customers, model training and copies abroad are blocked; CoreValley
 * staff come in only through a gate you open; and an incident notice runs
 * back to your team. Every claim matches /trust (copy/en/trust.ts).
 *
 * Pointing at, focusing or tapping a commitment lights its part of the
 * drawing and dims the rest. While the section is on screen and nobody has
 * touched it, the commitments light in turn, so the drawing reads on a
 * phone as well; reduced motion keeps it still. Wide screens get a
 * landscape drawing that stays beside the list; phones get the same parts
 * stacked, at a size that can be read. Drawn in the data-path language
 * (app/styles/visuals.css, .dp-* and .pm-*).
 */
import { useEffect, useRef, useState } from "react";
import { TextLink } from "@/components/system/text-link";
import { cn } from "@/lib/cn";

export type ProtectionId = "isolated" | "access" | "training" | "abroad" | "incident";

export interface Protection {
  id: ProtectionId;
  title: string;
  body: string;
}

const RECORDS = ["Datasets", "Models", "Prompts · answers", "Notebooks"];

/** The three ways out of your space that are closed. */
const BLOCKED: { id: ProtectionId; name: string; verdict: string }[] = [
  { id: "isolated", name: "Other customers", verdict: "Isolated" },
  { id: "training", name: "Model training", verdict: "Never" },
  { id: "abroad", name: "Copies abroad", verdict: "None" },
];

type Part = (id: ProtectionId) => string;

function Flow({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <>
      <path d={d} className="dp-link" />
      <path d={d} className="dp-flow" style={{ "--d": `${delay}s` } as React.CSSProperties} />
    </>
  );
}

/** A box with a name and a small line under it, centred on cx. */
function NamedBox({
  x,
  y,
  w,
  h,
  name,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  sub: string;
}) {
  const cx = x + w / 2;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" className="dp-box pm-target" />
      <text x={cx} y={y + h / 2 - 2} textAnchor="middle" className="dp-item">
        {name}
      </text>
      <text x={cx} y={y + h / 2 + 14} textAnchor="middle" className="dp-sub">
        {sub}
      </text>
    </>
  );
}

/** Your space: the boundary, your records and your GPU, joined by flows. */
function Space({
  x,
  y,
  w,
  h,
  recX,
  recW,
  recY,
  chipX,
  chipY,
  part,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  recX: number;
  recW: number;
  recY: number;
  chipX: number;
  chipY: number;
  part: Part;
}) {
  const ry = (i: number) => recY + i * 42;
  const c = 112; // chip size
  return (
    <>
      <g className={part("isolated")}>
        <rect x={x} y={y} width={w} height={h} rx="16" className="pm-space" />
        <text x={x + 18} y={y + 24} className="dp-label dp-label--strong">
          Your space
        </text>
      </g>
      <g className="pm-base">
        {RECORDS.map((t, i) => (
          <g key={t}>
            <rect x={recX} y={ry(i)} width={recW} height="32" rx="3" className="dp-record" />
            <rect x={recX} y={ry(i)} width="3" height="32" className="dp-record__mark" />
            <text x={recX + 13} y={ry(i) + 20.5} className="dp-item">
              {t}
            </text>
          </g>
        ))}
        {RECORDS.map((t, i) => {
          const [x0, y0, y1] = [recX + recW, ry(i) + 16, chipY + 34 + i * 14];
          const mid = (x0 + chipX) / 2;
          return <Flow key={t} d={`M${x0} ${y0} C ${mid} ${y0}, ${mid} ${y1}, ${chipX} ${y1}`} delay={i * 0.3} />;
        })}
      </g>
      <g className={part("isolated")}>
        <rect x={chipX} y={chipY} width={c} height={c} rx="6" className="dp-box" />
        <rect
          x={chipX + 32}
          y={chipY + 32}
          width="48"
          height="48"
          rx="2"
          className="dp-gpu"
          style={{ "--i": 0 } as React.CSSProperties}
        />
        {[0, 1, 2].flatMap((k) => [
          <rect
            key={`l${k}`}
            x={chipX + 10}
            y={chipY + 34 + k * 16}
            width="14"
            height="11"
            rx="1.2"
            className="dp-bay"
          />,
          <rect
            key={`r${k}`}
            x={chipX + 88}
            y={chipY + 34 + k * 16}
            width="14"
            height="11"
            rx="1.2"
            className="dp-bay"
          />,
        ])}
        <text x={chipX + c / 2} y={chipY + c + 22} textAnchor="middle" className="dp-sub">
          Your GPU or slice
        </text>
      </g>
    </>
  );
}

/** The gate CoreValley staff come in through, drawn on a vertical line at x. */
function Gate({ x, y, label, anchor }: { x: number; y: number; label: string; anchor: "start" | "end" }) {
  return (
    <>
      <path d={`M${x - 16} ${y} H ${x - 4} M${x + 4} ${y} H ${x + 16}`} className="pm-gate" />
      <rect x={x + 22} y={y - 7} width="12" height="10" rx="1.5" className="pm-lock" />
      <path d={`M${x + 25} ${y - 7} v-3 a3 3 0 0 1 6 0 v3`} className="pm-lock__shackle" />
      <text x={anchor === "start" ? x + 42 : x - 24} y={y + 4} textAnchor={anchor} className="dp-sub">
        {label}
      </text>
    </>
  );
}

function Envelope({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="22" height="15" rx="2" className="pm-envelope" />
      <path d={`M${x} ${y + 1} l11 7.5 l11 -7.5`} className="pm-envelope__flap" />
    </>
  );
}

/** Wide screens: your team on the left, the closed ways out on the right,
    staff below, the incident notice arching back over the top. */
function Landscape({ part, active }: { part: Part; active: boolean }) {
  return (
    <svg
      viewBox="0 0 680 520"
      className={cn("data-path pm h-auto w-full", active && "has-active")}
      aria-hidden="true"
      focusable="false"
    >
      <g className={part("incident")}>
        <path d="M220 116 C 220 60, 70 60, 70 212" className="pm-notice" />
        <Envelope x={134} y={79} />
        <text x="166" y="72" className="dp-sub">
          Told within 72 h
        </text>
      </g>
      <g className="pm-base">
        <rect x="12" y="212" width="116" height="60" rx="4" className="dp-box" />
        <text x="70" y="239" textAnchor="middle" className="dp-name">
          Your team
        </text>
        <text x="70" y="256" textAnchor="middle" className="dp-sub">
          signed in
        </text>
        <Flow d="M128 236 H 180" />
        <Flow d="M180 246 H 128" delay={0.6} />
      </g>
      <Space x={164} y={116} w={316} h={250} recX={180} recW={142} recY={156} chipX={350} chipY={172} part={part} />
      {BLOCKED.map((b, i) => {
        const y = 150 + i * 91;
        return (
          <g key={b.id} className={part(b.id)}>
            <path d={`M480 ${y} H 540`} className="dp-blocked" />
            <path d={`M503 ${y - 7} l 14 14 M517 ${y - 7} l -14 14`} className="pm-x" />
            <rect x="540" y={y - 25} width="132" height="50" rx="4" className="dp-box pm-target" />
            <text x="553" y={y - 3} className="dp-item">
              {b.name}
            </text>
            <text x="553" y={y + 14} className="dp-sub pm-verdict">
              {b.verdict}
            </text>
          </g>
        );
      })}
      <g className={part("access")}>
        <path d="M322 436 V 366" className="dp-blocked" />
        <Gate x={322} y={401} label="Only when you ask" anchor="start" />
        <NamedBox x={240} y={436} w={164} h={52} name="CoreValley staff" sub="support" />
      </g>
      <text x="12" y="512" className="dp-sub">
        Data protection · illustration
      </text>
    </svg>
  );
}

/** Phones: the same drawing stacked — your team and staff above your
    space, the closed ways out below it. */
function Portrait({ part, active }: { part: Part; active: boolean }) {
  return (
    <svg
      viewBox="0 0 360 620"
      className={cn("data-path pm h-auto w-full", active && "has-active")}
      aria-hidden="true"
      focusable="false"
    >
      <g className={part("incident")}>
        <path d="M24 290 H 8 V 20 H 20" className="pm-notice" />
        <Envelope x={20} y={12} />
        <text x="52" y="24" className="dp-sub">
          Told within 72 h
        </text>
      </g>
      <g className="pm-base">
        <rect x="24" y="44" width="130" height="56" rx="4" className="dp-box" />
        <text x="89" y="69" textAnchor="middle" className="dp-name">
          Your team
        </text>
        <text x="89" y="86" textAnchor="middle" className="dp-sub">
          signed in
        </text>
        <Flow d="M84 100 V 156" />
        <Flow d="M94 156 V 100" delay={0.6} />
      </g>
      <g className={part("access")}>
        <path d="M273 100 V 156" className="dp-blocked" />
        <Gate x={273} y={128} label="Only when you ask" anchor="end" />
        <NamedBox x={206} y={44} w={134} h={56} name="CoreValley staff" sub="support" />
      </g>
      <Space x={24} y={156} w={316} h={250} recX={38} recW={142} recY={196} chipX={214} chipY={212} part={part} />
      <path d="M44 406 V 562" className="dp-blocked pm-base" />
      {BLOCKED.map((b, i) => {
        const y = 446 + i * 58;
        return (
          <g key={b.id} className={part(b.id)}>
            <path d={`M44 ${y} H 112`} className="dp-blocked" />
            <path d={`M71 ${y - 7} l 14 14 M85 ${y - 7} l -14 14`} className="pm-x" />
            <rect x="112" y={y - 22} width="228" height="44" rx="4" className="dp-box pm-target" />
            <text x="126" y={y + 4.5} className="dp-item">
              {b.name}
            </text>
            <text x="326" y={y + 4} textAnchor="end" className="dp-sub pm-verdict">
              {b.verdict}
            </text>
          </g>
        );
      })}
      <text x="24" y="612" className="dp-sub">
        Data protection · illustration
      </text>
    </svg>
  );
}

export function ProtectionMap({
  items,
  link,
  children,
}: {
  items: readonly Protection[];
  link: { href: string; label: string };
  /** The section head. */
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<ProtectionId | null>(null);
  const [touched, setTouched] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // The commitments light in turn while the section is on screen, until
  // someone points at one.
  useEffect(() => {
    const el = root.current;
    if (!el || touched || document.documentElement.dataset.motion === "reduce") return;
    let timer: number | undefined;
    let i = 0;
    const step = () => {
      setActive(items[i % items.length]!.id);
      i++;
      timer = window.setTimeout(step, 2600);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer);
        if (e?.isIntersecting) timer = window.setTimeout(step, 900);
        else setActive(null);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [items, touched]);

  const pick = (id: ProtectionId | null) => {
    setTouched(true);
    setActive(id);
  };
  const part: Part = (id) => cn("pm-part", active === id && "is-on");

  return (
    <div
      ref={root}
      className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8"
    >
      {/* Head, then drawing, then list on phones; drawing beside both on wide screens. */}
      <div className="lg:col-start-2">{children}</div>
      <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <div className="hidden sm:block">
          <Landscape part={part} active={active !== null} />
        </div>
        <div className="mx-auto max-w-[26rem] sm:hidden">
          <Portrait part={part} active={active !== null} />
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:col-start-2 lg:row-start-2">
        <ul
          className="flex flex-col"
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setActive(null);
          }}
        >
          {items.map((it, i) => (
            <li
              key={it.id}
              className="border-t border-line last:border-b"
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
            >
              <button
                type="button"
                aria-pressed={active === it.id}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") pick(it.id);
                }}
                onFocus={() => pick(it.id)}
                onClick={() => pick(it.id)}
                className="group grid w-full grid-cols-[1.25rem_1fr] items-baseline gap-x-3 py-4 text-left focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 translate-y-[-0.1rem] rounded-full transition-colors duration-[var(--dur-short)]",
                    active === it.id ? "bg-hydro" : "bg-line-strong",
                  )}
                />
                <span className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "type-body font-semibold transition-colors duration-[var(--dur-short)]",
                      active === it.id ? "text-ink" : "text-ink-2",
                    )}
                  >
                    {it.title}
                  </span>
                  <span className="type-small text-ink-3">{it.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div>
          <TextLink href={link.href} arrow>
            {link.label}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
