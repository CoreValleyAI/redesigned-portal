import { CopyButton } from "./copy-button";

/**
 * A fenced code block from the docs. Server component: the frame and text
 * are static; only the copy button is a client island. No syntax
 * highlighting yet — no page ships a code fence today. When one does, a
 * build-time highlighter can slot in here without touching the pipeline.
 */
export function CodeBlock({
  code,
  lang,
  title,
}: {
  code: string;
  lang?: string;
  title?: string;
}) {
  const label = title ?? (lang && lang !== "text" ? lang : null);
  return (
    <figure
      className="md-code relative overflow-hidden rounded-lg border border-line bg-carbon-800 shadow-lg"
      data-lang={lang}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle bg-carbon-700 px-3.5 py-1.5">
        <span className="font-mono text-[11px] tracking-wide text-ink-500">
          {label ?? "code"}
        </span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
