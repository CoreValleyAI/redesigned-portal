// A link that looks like a Button: ONE element, the anchor, with the Button's
// classes, so a call to action is a single focusable link.
import * as React from "react";
import Link from "next/link";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { buttonParts, buttonVariants } from "./button";

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
  const { pad, content } = buttonParts({ variant, size, iconLeft, iconRight, children });
  return (
    <Link
      className={cn(buttonVariants({ variant, size, mono, fullWidth }), pad, className)}
      {...rest}
    >
      {content}
    </Link>
  );
}
