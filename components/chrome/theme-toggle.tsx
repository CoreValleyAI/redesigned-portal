"use client";

/**
 * Theme toggle — sun and moon in one icon. Pressing it switches theme with
 * a circular reveal that starts at the button (lib/theme.ts → setTheme). The
 * icon itself morphs: the moon's bite slides off as the sun's rays extend.
 */
import { cn } from "@/lib/cn";
import { setTheme, useTheme } from "@/lib/theme";
import { UI } from "@/copy/en/site";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(dark ? "light" : "dark", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={dark ? UI.theme.toLight : UI.theme.toDark}
      title={dark ? UI.theme.toLight : UI.theme.toDark}
      className={cn(
        "group/theme relative grid size-10 place-items-center rounded-full text-ink-2 transition-[background-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring hover:bg-bg-sunken hover:text-ink active:scale-[0.94]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[1.15rem] overflow-visible" aria-hidden="true">
        <mask id="cv-moon-bite">
          <rect x="-4" y="-4" width="32" height="32" fill="#fff" />
          <circle
            cx="17"
            cy="7"
            r="6"
            fill="#000"
            className={cn(
              "transition-transform duration-[var(--dur-spring-smooth)] ease-spring",
              dark ? "translate-0" : "translate-x-[9px] -translate-y-[6px]",
            )}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="currentColor"
          mask="url(#cv-moon-bite)"
          className={cn(
            "origin-center transition-transform duration-[var(--dur-spring-smooth)] ease-spring [transform-box:fill-box]",
            dark ? "scale-100" : "scale-[0.625]",
          )}
        />
        <g
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={cn(
            "origin-center transition-[opacity,transform] duration-[var(--dur-spring-smooth)] ease-spring [transform-box:fill-box]",
            dark ? "scale-50 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        >
          <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </g>
      </svg>
    </button>
  );
}
