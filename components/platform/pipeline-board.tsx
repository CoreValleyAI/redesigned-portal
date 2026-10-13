/**
 * Pipelines (platform): example workflows as a pipeline board, the way CI
 * and ML platforms draw a run — each lane a pipeline, each node a stage
 * with its tool and its role, joined by connectors that a pulse of light
 * runs along, stage after stage. Real lists underneath (one <ol> per lane),
 * so the board reads in order without the drawing.
 */
import { cn } from "@/lib/cn";

export interface Lane {
  id: string;
  name: string;
  stops: readonly { tool: string; role: string }[];
}

export function PipelineBoard({ lanes, className }: { lanes: readonly Lane[]; className?: string }) {
  return (
    <div className={cn("pipeline-board flex flex-col gap-3", className)}>
      {lanes.map((lane, li) => (
        <section
          key={lane.id}
          aria-label={lane.name}
          data-refract
          data-refract-bezel="18"
          className="lg grid gap-4 rounded-panel p-4 md:grid-cols-[11rem_minmax(0,1fr)] md:items-center md:gap-6 md:p-5"
          data-reveal
          style={{ "--i": li } as React.CSSProperties}
        >
          <header className="flex items-center gap-3 md:flex-col md:items-start md:gap-1.5">
            <span className="type-kicker tabular text-hydro-ink light:text-hydro">
              {String(li + 1).padStart(2, "0")}
            </span>
            <h3 className="type-body font-semibold text-ink">{lane.name}</h3>
            <span className="type-caption ml-auto font-mono text-ink-3 md:ml-0">{lane.stops.length} stages</span>
          </header>
          <ol className="-mx-1 flex items-stretch overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lane.stops.map((s, i) => (
              <li key={`${s.tool}-${i}`} className="flex shrink-0 items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="pipeline-link"
                    style={{ "--d": `${(li * 0.35 + i * 0.45).toFixed(2)}s` } as React.CSSProperties}
                  />
                )}
                <span className="pipeline-node flex min-w-[8.5rem] flex-col gap-1 rounded-card border border-line bg-bg-raised px-3.5 py-2.5">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="pipeline-dot size-1.5 rounded-full bg-hydro"
                      style={{ "--d": `${(li * 0.35 + i * 0.45).toFixed(2)}s` } as React.CSSProperties}
                    />
                    <span className="type-small font-semibold whitespace-nowrap text-ink">{s.tool}</span>
                  </span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.06em] whitespace-nowrap text-ink-2 uppercase">
                    {s.role}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
