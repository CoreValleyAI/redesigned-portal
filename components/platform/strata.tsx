/**
 * The platform as strata (08 §6, "the iceberg in dots"): five bands, the
 * widest at the bottom — the silicon everything rests on — narrowing to the
 * workspace you touch at the top, which is the one lit in hydro. Each band
 * is a field of dots; the text beside it is the real content.
 */
import { cn } from "@/lib/cn";

export function Strata({ layers, className }: { layers: readonly { id: string; name: string; touch: boolean }[]; className?: string }) {
  const n = layers.length;
  return (
    <div aria-hidden="true" className={cn("flex flex-col items-center gap-2", className)}>
      {layers.map((l, i) => {
        const width = 52 + (i / (n - 1)) * 48;
        return (
          <div
            key={l.id}
            className={cn(
              "relative flex h-14 items-center justify-center overflow-hidden rounded-card border md:h-16",
              l.touch ? "border-hydro bg-hydro-wash" : "border-line bg-bg-raised",
            )}
            style={{ width: `${width}%`, animation: `cv-rise-in 700ms var(--ease-expo) ${i * 90}ms both` }}
          >
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: `radial-gradient(circle, ${l.touch ? "var(--hydro)" : "var(--dot-off)"} 0 1.4px, transparent 1.9px)`,
                backgroundSize: "12px 12px",
                backgroundPosition: `${i * 3}px 2px`,
              }}
            />
            <span className={cn("type-kicker relative rounded-chip bg-bg/80 px-2 py-1", l.touch ? "text-hydro-ink light:text-hydro" : "text-ink-2")}>
              {l.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
