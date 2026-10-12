/**
 * Lexical JSON → design-system React. No hooks and no fs, so it renders in
 * server pages and inside the client-side live preview alike.
 *
 * Only the node types the CMS lets editors use are handled; anything else
 * renders nothing (the CMS refuses to publish unknown types anyway). There is
 * no innerHTML: text is text, links are checked again here, and videos are
 * built from a provider + id, never from a URL an editor typed.
 */
import * as React from "react";
import { CodeBlock } from "@/components/docs/code-block";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { mediaSrc, mediaSrcSet } from "@/lib/content/format";
import { headingIds } from "@/lib/content/lexical";
import { key, type LexicalNode, type LexicalState, type MediaItem } from "@/lib/content/types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:)/i;

export interface RichTextProps {
  state: LexicalState | null | undefined;
  media?: Map<string, MediaItem>;
  className?: string;
}

export function RichText({ state, media, className }: RichTextProps) {
  if (!state?.root) return null;
  const ids = headingIds(state);
  let n = 0;
  const k = () => `n${n++}`;

  const renderText = (node: LexicalNode): React.ReactNode => {
    let out: React.ReactNode = String(node.text ?? "");
    const f = Number(node.format ?? 0);
    if (f & 16) out = <code>{out}</code>;
    if (f & 1) out = <strong>{out}</strong>;
    if (f & 2) out = <em>{out}</em>;
    if (f & 4) out = <s>{out}</s>;
    if (f & 8) out = <u>{out}</u>;
    return <React.Fragment key={k()}>{out}</React.Fragment>;
  };

  const kids = (node: LexicalNode) => (node.children ?? []).map(render);

  function render(node: LexicalNode): React.ReactNode {
    switch (node.type) {
      case "text":
        return renderText(node);
      case "linebreak":
        return <br key={k()} />;
      case "tab":
        return " ";
      case "paragraph":
        return node.children?.length ? <p key={k()}>{kids(node)}</p> : null;
      case "heading": {
        const Tag = (["h2", "h3", "h4"].includes(String(node.tag)) ? node.tag : "h3") as "h2" | "h3" | "h4";
        const id = ids.get(node);
        return (
          <Tag key={k()} id={id} className="scroll-mt-28">
            {kids(node)}
            {id ? (
              <a href={`#${id}`} className="md-anchor" aria-label="Link to this section">
                #
              </a>
            ) : null}
          </Tag>
        );
      }
      case "list":
        return node.listType === "number" ? <ol key={k()}>{kids(node)}</ol> : <ul key={k()}>{kids(node)}</ul>;
      case "listitem":
        return <li key={k()}>{kids(node)}</li>;
      case "quote":
        return <blockquote key={k()}>{kids(node)}</blockquote>;
      case "horizontalrule":
        return <hr key={k()} />;
      case "link":
      case "autolink": {
        const fields = (node.fields ?? {}) as { url?: string; newTab?: boolean };
        const url = String(fields.url ?? "");
        if (!SAFE_URL.test(url)) return <React.Fragment key={k()}>{kids(node)}</React.Fragment>;
        const href = url.startsWith("/") ? `${BASE}${url}` : url;
        const external = /^https?:\/\//i.test(url);
        return (
          <a
            key={k()}
            href={href}
            {...(fields.newTab || external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {kids(node)}
          </a>
        );
      }
      case "upload": {
        const item = media?.get(key(node.value as string | number));
        const img = mediaSrc(item, "wide");
        if (!img || !item) return null;
        const caption = (node.fields as { caption?: string } | undefined)?.caption ?? item.caption;
        return (
          <figure key={k()} className="not-prose my-8">
            <img
              src={img.src}
              srcSet={mediaSrcSet(item)}
              sizes="(min-width: 1024px) 720px, 100vw"
              width={img.width}
              height={img.height}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-line"
            />
            {caption || item.credit ? (
              <figcaption className="mt-3 text-[13px] text-ink-500">
                {caption}
                {item.credit ? <span className="text-ink-500/80"> · {item.credit}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        );
      }
      case "block":
        return <ContentBlock key={k()} fields={(node.fields ?? {}) as Record<string, string>} />;
      default:
        return node.children ? <React.Fragment key={k()}>{kids(node)}</React.Fragment> : null;
    }
  }

  return <div className={cn("prose-docs", className)}>{kids(state.root)}</div>;
}

const CALLOUT = {
  note: { icon: "info", cls: "border-line bg-surface-card" },
  tip: { icon: "check-circle", cls: "border-hydro/30 bg-hydro/5" },
  warning: { icon: "warning", cls: "border-warning/30 bg-warning/8" },
} as const;

function ContentBlock({ fields }: { fields: Record<string, string> }) {
  switch (fields.blockType) {
    case "code":
      return <CodeBlock code={fields.code ?? ""} lang={fields.language} title={fields.filename || undefined} />;
    case "callout": {
      const tone = CALLOUT[(fields.tone as keyof typeof CALLOUT) ?? "note"] ?? CALLOUT.note;
      return (
        <aside className={cn("flex gap-3 rounded-xl border px-5 py-4", tone.cls)}>
          <Icon name={tone.icon} size={18} weight="duotone" className="mt-0.5 shrink-0 text-ink-200" />
          <div className="text-[15px] leading-relaxed">
            {fields.title ? <p className="font-semibold text-ink-100">{fields.title}</p> : null}
            <p className="text-ink-300">{fields.body}</p>
          </div>
        </aside>
      );
    }
    case "embed": {
      const id = /^[A-Za-z0-9_-]{4,32}$/.test(fields.videoId ?? "") ? fields.videoId : null;
      if (!id) return null;
      const src =
        fields.provider === "vimeo"
          ? `https://player.vimeo.com/video/${id}?dnt=1`
          : `https://www.youtube-nocookie.com/embed/${id}`;
      return (
        <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-carbon-800">
          <iframe
            src={src}
            title={fields.title || "Video"}
            loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full"
          />
        </div>
      );
    }
    case "cta": {
      const href = SAFE_URL.test(fields.href ?? "") ? fields.href! : "/contact/";
      return (
        <aside className="cv-dark surface-dark grain rounded-[1.5rem] px-6 py-7 md:px-8">
          <p className="text-xl font-semibold tracking-tight text-white">{fields.heading}</p>
          {fields.body ? <p className="mt-2 text-[15px] leading-relaxed text-white/60">{fields.body}</p> : null}
          <a
            href={href.startsWith("/") ? `${BASE}${href}` : href}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-zinc-900 no-underline transition-transform duration-300 hover:scale-[1.02]"
          >
            {fields.label}
            <Icon name="arrow-right" size={15} />
          </a>
        </aside>
      );
    }
    default:
      return null;
  }
}
