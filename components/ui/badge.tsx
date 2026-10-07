// Server component — the design-system original was already hook-free.
// Ported from design_system/components/display/Badge.jsx.
//
// A status set as TYPE, not as a capsule: mono caps in the tone's colour.
// No border, no fill, no rounded pill, and no status dot — a pill badge with
// a glowing or blinking dot is the most generic pattern on the web, and the
// words already carry the status.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-2 whitespace-nowrap",
    "font-mono text-[11px] font-medium uppercase tracking-[0.06em] leading-[1.4]",
  ],
  {
    variants: {
      tone: {
        neutral: "text-ink-400",
        hydro: "text-hydro light:text-hydro-dark",
        success: "text-success",
        warning: "text-warning",
        danger: "text-danger",
        info: "text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.ComponentPropsWithRef<"span">,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone = "neutral", children, ...rest }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...rest}>
      {children}
    </span>
  );
}

export { badgeVariants };
