// Server component. No "use client": hover, press and focus are pure CSS.
//
// The action button: a pill with a nested circular icon. The colours come
// from --btn-* tokens (app/theme.css), so the same variant is a black pill
// with an emerald orb on paper and a white pill with a zinc orb inside a
// dark island. The whole pill scales to 105% on hover; the orb shifts tone.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "group/btn items-center justify-center whitespace-nowrap select-none",
    "rounded-full border leading-none font-medium tracking-[-0.01em]",
    "transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "hover:scale-105 active:scale-[1.02]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
    "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45 disabled:scale-100",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]",
        secondary:
          "border-[var(--btn2-border)] bg-[var(--btn2-bg)] text-[var(--btn2-fg)] backdrop-blur-md hover:bg-[var(--btn2-hover)]",
        ghost:
          "border-transparent bg-transparent text-ink-300 hover:bg-[var(--btn2-hover)] hover:text-ink-100",
        danger:
          "border-line bg-transparent text-danger hover:bg-danger/10",
      },
      size: {
        sm: "h-9 gap-2 px-4 text-[13px]",
        md: "h-11 gap-2.5 px-5 text-[14px]",
        lg: "h-14 gap-3 px-6 text-[15px]",
      },
      /** Kept for API compatibility; the redesign is Inter throughout. */
      mono: {
        true: "",
        false: "",
      },
      fullWidth: {
        true: "flex w-full",
        false: "inline-flex w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      mono: false,
      fullWidth: false,
    },
  },
);

type Size = "sm" | "md" | "lg";

/* With a trailing icon the pill becomes pl-6 pr-2 py-2 and the icon sits in
   its own circle. */
const ORB_PAD: Record<Size, string> = {
  sm: "pl-4 pr-1.5",
  md: "pl-5 pr-1.5",
  lg: "pl-6 pr-2",
};
const ORB_SIZE: Record<Size, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};
const ICON_SLOT: Record<Size, string> = { sm: "size-3.5", md: "size-4", lg: "size-4.5" };

const orbTone: Record<string, string> = {
  primary:
    "bg-[var(--btn-orb)] text-[var(--btn-orb-fg)] group-hover/btn:bg-[var(--btn-orb-hover)]",
  secondary: "bg-[var(--btn-bg)] text-[var(--btn-fg)]",
  ghost: "bg-[var(--btn2-hover)] text-ink-100",
  danger: "bg-danger/10 text-danger",
};

export function buttonParts({
  variant,
  size,
  iconLeft,
  iconRight,
  children,
}: {
  variant?: string | null;
  size?: Size | null;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const s = size ?? "md";
  const v = variant ?? "primary";
  return {
    pad: iconRight ? ORB_PAD[s] : "",
    content: (
      <>
        {iconLeft ? (
          <span className={cn("inline-flex shrink-0 items-center", ICON_SLOT[s])}>{iconLeft}</span>
        ) : null}
        {children}
        {iconRight ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-300",
              ORB_SIZE[s],
              orbTone[v],
            )}
          >
            {iconRight}
          </span>
        ) : null}
      </>
    ),
  };
}

export interface ButtonProps
  extends Omit<React.ComponentPropsWithRef<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size = "md",
  mono,
  fullWidth,
  iconLeft,
  iconRight,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const { pad, content } = buttonParts({ variant, size, iconLeft, iconRight, children });
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, mono, fullWidth }), pad, className)}
      {...rest}
    >
      {content}
    </button>
  );
}

export { buttonVariants };
