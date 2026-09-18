/**
 * A rack elevation: node rows, each with its GPUs as cells whose fill rises
 * and falls like utilisation, and a status LED per node. Pure CSS animation
 * (see `.rack` in app/glass.css) staggered by the `--i` index, so it costs
 * nothing at runtime and holds still under `prefers-reduced-motion`.
 *
 * Server component. Hovering a row lifts it, so the rack reads as something
 * you could reach into.
 */
import { cn } from "@/lib/cn";

const NODES = [
  { id: "ktm-a-01", gpus: 8, sku: "h200", cool: "dtc" },
  { id: "ktm-a-02", gpus: 8, sku: "h200", cool: "dtc" },
  { id: "ktm-a-03", gpus: 8, sku: "h100", cool: "dtc" },
  { id: "ktm-a-04", gpus: 8, sku: "h100", cool: "dtc" },
  { id: "ktm-a-05", gpus: 4, sku: "h100", cool: "air" },
  { id: "ktm-a-06", gpus: 4, sku: "h100", cool: "air" },
] as const;

export function RackGraphic({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rack glass-panel rounded-lg p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-label text-ink-500 uppercase">
        <span>rack a · np-ktm-1</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-pill bg-hydro shadow-[0_0_6px_var(--hydro)]" />
          hydro feed
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {NODES.map((n, r) => (
          <li
            key={n.id}
            className="rack__row group flex items-center gap-3 rounded-md border border-line-subtle bg-carbon-800/70 px-2.5 py-2 transition-[border-color,background-color] duration-normal ease-standard hover:border-line-strong hover:bg-carbon-700"
          >
            <span
              className="rack__led size-1.5 shrink-0 rounded-pill bg-hydro"
              style={{ "--i": r } as React.CSSProperties}
            />
            <span className="w-[6.5rem] shrink-0 font-mono text-[10.5px] text-ink-300">
              {n.id}
            </span>
            <span className="flex flex-1 items-end gap-1">
              {Array.from({ length: 8 }, (_, c) => (
                <span
                  key={c}
                  className={cn(
                    "rack__cell relative h-4 flex-1 overflow-hidden rounded-[2px] border border-line-subtle",
                    c >= n.gpus && "opacity-25",
                  )}
                  style={{ "--i": r * 8 + c } as React.CSSProperties}
                >
                  {c < n.gpus ? <span className="rack__fill" /> : null}
                </span>
              ))}
            </span>
            <span className="hidden w-16 shrink-0 text-right font-mono text-[10px] text-ink-500 sm:block">
              {n.sku} · {n.cool}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
