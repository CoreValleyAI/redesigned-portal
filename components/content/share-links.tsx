"use client";

import * as React from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Copy link, LinkedIn, X and email. Plain links: no third-party scripts. */
export function ShareLinks({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the other links still work */
    }
  };

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const item =
    "inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors duration-300 hover:border-line-strong hover:text-ink";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={copy}
        className={item}
        aria-label={copied ? "Link copied" : "Copy link"}
        title="Copy link"
      >
        <Icon name={copied ? "check" : "copy"} size={15} className={copied ? "text-hydro" : undefined} />
      </button>
      <a
        className={cn(item, "font-mono text-[11px] font-semibold")}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        in
      </a>
      <a
        className={cn(item, "font-mono text-[12px] font-semibold")}
        href={`https://x.com/intent/post?url=${u}&text=${t}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="Share on X"
      >
        X
      </a>
      <a className={item} href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" title="Share by email">
        <Icon name="send" size={15} />
      </a>
    </div>
  );
}
