"use client";

/**
 * The Machine (S6), CSS edition. A pinned stage with the server drawn as
 * five isometric plates — chassis, GPUs, GPU memory, host, network — that
 * separate as you scroll, the plate being described lifting and lighting
 * up. Each plate is a flat SVG top-view in a CSS 3D stack, so it is crisp
 * at any size and costs no WebGL. The text beside it is real, server
 * rendered and readable without scripting: with reduced motion (or no JS)
 * the stage is not pinned and every layer is listed in order.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { trackScroll } from "@/lib/motion/scroll";

export interface Layer {
  id: string;
  title: string;
  body: string;
  value: ReactNode;
  caption: string;
}

const W = 420;
const H = 300;

function Plate({ id, lit }: { id: string; lit: boolean }) {
  const stroke = lit ? "var(--hydro)" : "var(--line-strong)";
  const fill = lit ? "color-mix(in oklch, var(--hydro) 10%, var(--bg-raised))" : "var(--bg-raised)";
  const dot = lit ? "var(--hydro)" : "var(--ink-3)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full overflow-visible" aria-hidden="true">
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="18" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {id === "chassis" &&
        Array.from({ length: 6 }, (_, i) => (
          <g key={i} transform={`translate(${30 + i * 62} 26)`}>
            <circle cx="24" cy="24" r="22" fill="none" stroke={stroke} strokeWidth="1.2" />
            {Array.from({ length: 12 }, (_, k) => (
              <circle key={k} cx={24 + Math.cos((k / 12) * 6.283) * 12} cy={24 + Math.sin((k / 12) * 6.283) * 12} r="1.6" fill={dot} />
            ))}
          </g>
        ))}
      {id === "chassis" && <rect x="30" y="110" width={W - 60} height="160" rx="10" fill="none" stroke={stroke} strokeDasharray="2 6" strokeLinecap="round" />}
      {id === "gpus" &&
        Array.from({ length: 4 }, (_, i) => (
          <g key={i} transform={`translate(28 ${26 + i * 64})`}>
            <rect width={W - 56} height="46" rx="8" fill="none" stroke={stroke} strokeWidth="1.4" />
            <rect x="14" y="12" width="70" height="22" rx="4" fill={dot} opacity="0.85" />
            {Array.from({ length: 22 }, (_, k) => (
              <circle key={k} cx={104 + k * 11} cy="23" r="2" fill={dot} opacity="0.55" />
            ))}
          </g>
        ))}
      {id === "memory" && (
        <g>
          <rect x={W / 2 - 60} y={H / 2 - 60} width="120" height="120" rx="10" fill={dot} opacity="0.9" />
          {[
            [W / 2 - 150, H / 2 - 95],
            [W / 2 - 150, H / 2 - 25],
            [W / 2 - 150, H / 2 + 45],
            [W / 2 + 80, H / 2 - 95],
            [W / 2 + 80, H / 2 - 25],
            [W / 2 + 80, H / 2 + 45],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect width="70" height="50" rx="6" fill="none" stroke={stroke} strokeWidth="1.4" />
              {Array.from({ length: 4 }, (_, r) =>
                Array.from({ length: 6 }, (_, c) => <circle key={`${r}-${c}`} cx={10 + c * 10} cy={10 + r * 10} r="2" fill={dot} />),
              )}
            </g>
          ))}
        </g>
      )}
      {id === "host" && (
        <g>
          {[110, 310].map((cx) => (
            <g key={cx}>
              <rect x={cx - 42} y="70" width="84" height="84" rx="8" fill="none" stroke={stroke} strokeWidth="1.5" />
              <rect x={cx - 24} y="88" width="48" height="48" rx="4" fill={dot} opacity="0.85" />
              {Array.from({ length: 12 }, (_, k) => (
                <rect key={k} x={cx - 66 + k * 11} y="180" width="5" height="90" rx="2" fill={dot} opacity="0.5" />
              ))}
            </g>
          ))}
        </g>
      )}
      {id === "network" && (
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`translate(${40 + i * 44} 40)`}>
              <rect width="30" height="20" rx="3" fill="none" stroke={stroke} strokeWidth="1.4" />
              <path d={`M15 20 C15 120, ${(W / 2 - 40 - i * 44) * 0.6 + 15} 160, ${W / 2 - 40 - i * 44 + 15} 230`} fill="none" stroke={dot} strokeWidth="1.2" strokeDasharray="1 7" strokeLinecap="round" />
            </g>
          ))}
          <rect x={W / 2 - 70} y="226" width="140" height="44" rx="8" fill={dot} opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

export function ExplodedServer({ layers }: { layers: Layer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = layers.length;

  useEffect(() => {
    const el = ref.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    return trackScroll(el, "pin", (p) => {
      stage.style.setProperty("--p", p.toFixed(4));
      setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
    });
  }, [n]);

  return (
    <div ref={ref} className="relative still:!h-auto" style={{ height: `${n * 70 + 30}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center still:static still:h-auto still:py-16">
        <div className="container-page grid w-full items-center gap-8 pt-[var(--header-h)] lg:grid-cols-[1.15fr_1fr] lg:gap-16 still:pt-0">
          {/* The stack. */}
          <div
            ref={stageRef}
            aria-hidden="true"
            className="relative mx-auto aspect-square w-full max-w-[34rem] [perspective:1600px] max-lg:max-w-[22rem]"
          >
            <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(56deg)_rotateZ(-40deg)_translateZ(-8%)]">
              {layers.map((l, i) => {
                const lift = i === active ? 1 : 0;
                return (
                  <div
                    key={l.id}
                    className="absolute inset-[14%] transition-[transform,opacity] duration-[var(--dur-spring-gentle)] ease-spring [transform-style:preserve-3d]"
                    style={{
                      transform: `translateZ(calc((${i} - ${(n - 1) / 2}) * (0.6rem + var(--p, 0) * 3.4rem) + ${lift} * 1.2rem))`,
                      opacity: i > active + 1 ? 0.55 : 1,
                    }}
                  >
                    <Plate id={l.id} lit={i === active} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* The words: one layer at a time when pinned, all of them otherwise. */}
          <div>
          <ol className="relative grid min-h-[16rem] still:min-h-0 still:gap-10">
            {layers.map((l, i) => (
              <li
                key={l.id}
                aria-current={i === active ? "step" : undefined}
                className={cn(
                  "col-start-1 row-start-1 flex flex-col gap-4 transition-[opacity,transform] duration-[var(--dur-base)] ease-out still:col-auto still:row-auto still:!translate-y-0 still:!opacity-100",
                  i === active ? "translate-y-0 opacity-100" : i < active ? "-translate-y-4 opacity-0" : "translate-y-4 opacity-0",
                )}
              >
                <p className="type-kicker text-ink-3">
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {l.title}
                </p>
                <p className="type-display-2 tabular text-ink">{l.value}</p>
                <p className="type-small text-ink-3">{l.caption}</p>
                <p className="type-lead measure text-ink-2">{l.body}</p>
              </li>
            ))}
          </ol>
            {/* Progress dots. */}
            <div aria-hidden="true" className="mt-8 flex gap-2 still:hidden">
              {layers.map((l, i) => (
                <span
                  key={l.id}
                  className={cn(
                    "h-1.5 rounded-full transition-[width,background-color] duration-[var(--dur-spring-smooth)] ease-spring",
                    i === active ? "w-8 bg-hydro" : "w-1.5 bg-line-strong",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
