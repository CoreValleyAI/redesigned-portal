"use client";

/**
 * The dark / light switch. One ghost icon button: a sun on Carbon (what you
 * get if you press it), a moon on paper. Hydrates as the light state — the
 * default, and what the server renders — and corrects itself on the first
 * client render if a dark choice is saved.
 *
 * `labelled` renders the same switch as a full-width text row, for the phone
 * drawer: a written label and a 48px target instead of a bare 30px icon.
 */
import * as React from "react";
import { Icon, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toggleTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({
  className,
  size = "sm",
  labelled = false,
}: {
  className?: string;
  size?: "sm" | "md";
  labelled?: boolean;
}) {
  const dark = useTheme() === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  if (labelled) {
    return (
      <button
        type="button"
        onClick={() => toggleTheme()}
        className={cn("w-full cursor-pointer text-left", className)}
      >
        {label}
        <Icon name={dark ? "sun" : "moon"} size={16} className="text-ink-500" />
      </button>
    );
  }

  return (
    <IconButton
      size={size}
      variant="ghost"
      className={cn("cursor-pointer", className)}
      title={label}
      onClick={() => toggleTheme()}
      icon={<Icon name={dark ? "sun" : "moon"} size={16} />}
    />
  );
}
