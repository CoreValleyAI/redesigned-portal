import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot infer the custom utilities declared in
 * app/globals.css, so they are registered here: anything added there that
 * can conflict with another class belongs here too.
 */
const twMerge = extendTailwindMerge<"type-role" | "cv-glass">({
  extend: {
    theme: {
      radius: ["chip", "card", "panel", "pill"],
      ease: ["expo", "spring", "standard"],
      text: ["2xs", "md"],
      tracking: ["label"],
    },
    classGroups: {
      // One type role per element: a later type-* replaces an earlier one.
      "type-role": [
        {
          type: [
            "display-1",
            "display-2",
            "title-1",
            "title-2",
            "title-3",
            "lead",
            "body",
            "small",
            "caption",
            "kicker",
            "mono",
            "metric",
          ],
        },
      ],
      shadow: [{ shadow: ["chrome", "glow-sm", "glow-md", "glow-lg"] }],
      "font-family": [{ font: ["body", "display"] }],
      "border-color": [{ border: ["subtle", "default", "strong", "hydro"] }],
      duration: [{ duration: ["fast", "normal", "slow"] }],
      "cv-glass": ["glass", "glass-card", "glass-nav", "glass-modal", "glass-panel"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
