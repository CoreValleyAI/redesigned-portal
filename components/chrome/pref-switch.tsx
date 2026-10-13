"use client";

/**
 * Preference switches: "Reduce motion" and "Engineer mode" (S15). Real
 * checkboxes with the `switch` attribute, so iOS Safari renders its native
 * switch (with haptics) and every platform gets correct semantics; other
 * browsers get the styled track below.
 */
import { useId } from "react";
import { cn } from "@/lib/cn";
import { setEngineer, setMotion, useEngineer, useMotionPref } from "@/lib/theme";

function Switch({
  checked,
  onChange,
  label,
  hint,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center justify-between gap-4", className)}>
      <span className="flex flex-col">
        <span className="type-small text-ink">{label}</span>
        {hint && <span className="type-caption text-ink-3">{hint}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        {...{ switch: "" }}
        checked={checked}
        onChange={(e) => onChange(e.currentTarget.checked)}
        className={cn(
          "relative h-[1.625rem] w-[2.75rem] shrink-0 cursor-pointer appearance-none rounded-pill border border-line-strong bg-bg-sunken",
          "transition-[background-color,border-color] duration-[var(--dur-spring-snappy)] ease-spring",
          "before:absolute before:top-[2px] before:left-[2px] before:size-[1.25rem] before:rounded-full before:bg-ink before:shadow-sm before:content-['']",
          "before:transition-transform before:duration-[var(--dur-spring-snappy)] before:ease-spring",
          "checked:border-hydro checked:bg-hydro checked:before:translate-x-[1.125rem] checked:before:bg-on-hydro",
        )}
      />
    </label>
  );
}

export function MotionSwitch({ className }: { className?: string }) {
  const pref = useMotionPref();
  return (
    <Switch
      className={className}
      label="Reduce motion"
      hint="Stills instead of animation"
      checked={pref === "reduce"}
      onChange={(v) => setMotion(v ? "reduce" : "full")}
    />
  );
}

export function EngineerSwitch({ className }: { className?: string }) {
  const on = useEngineer();
  return (
    <Switch
      className={className}
      label="Engineer mode"
      hint="Full specs, less story"
      checked={on}
      onChange={setEngineer}
    />
  );
}
