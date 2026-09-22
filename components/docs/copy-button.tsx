"use client";

import * as React from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Copies `text` to the clipboard; confirms with a check for a moment. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef(0);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard denied: nothing to show, nothing to break. */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy code"
      aria-label="Copy code"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-ink-500 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100",
        copied && "text-hydro hover:text-hydro",
        className,
      )}
    >
      <Icon name={copied ? "check" : "copy"} size={13} />
      <span aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
