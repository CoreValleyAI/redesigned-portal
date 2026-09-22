"use client";

/**
 * The dark / light switch. One ghost icon button: a sun on Carbon (what you
 * get if you press it), a moon on paper. Hydrates as the dark state — the
 * server does not know the visitor's theme — and corrects itself on the
 * first client render, before the header is interactive anyway.
 */
import * as React from "react";
import { Icon, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toggleTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dark = useTheme() === "dark";
  return (
    <IconButton
      size={size}
      variant="ghost"
      className={cn("cursor-pointer", className)}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => toggleTheme()}
      icon={<Icon name={dark ? "sun" : "moon"} size={16} />}
    />
  );
}
