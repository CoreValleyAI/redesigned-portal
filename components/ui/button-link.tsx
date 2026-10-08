// A link that looks like a Button.
//
// `<Link><Button/></Link>` nests a <button> inside an <a>: invalid HTML, two
// tab stops per call to action, and a screen reader announces it twice. This
// renders ONE element, the anchor, with the Button's classes, so a CTA is a
// single focusable link.
import * as React from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { buttonVariants } from "./button";

const ICON_SLOT = { sm: "size-3.5", md: "size-4", lg: "size-4.5" } as const;

export interface ButtonLinkProps
  extends Omit<React.ComponentPropsWithRef<typeof Link>, "color">,
    VariantProps<typeof buttonVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function ButtonLink({
  className,
  variant,
  size = "md",
  mono,
  fullWidth,
  iconLeft,
  iconRight,
  children,
  ...rest
}: ButtonLinkProps) {
  const slot = ICON_SLOT[size ?? "md"];
  return (
    <Link
      className={cn(buttonVariants({ variant, size, mono, fullWidth }), className)}
      {...rest}
    >
      {iconLeft ? (
        <span className={cn("inline-flex shrink-0 items-center", slot)}>{iconLeft}</span>
      ) : null}
      {children}
      {iconRight ? (
        <span className={cn("inline-flex shrink-0 items-center", slot)}>{iconRight}</span>
      ) : null}
    </Link>
  );
}
