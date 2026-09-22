/**
 * Markdown → design-system React. Server component.
 *
 * react-markdown parses the (already preprocessed) page body with the same
 * remark plugins the content module uses, so heading ids here match the
 * table of contents and the search index exactly. The components map turns
 * the Material constructs the plugins produced (`.md-cards`, `.md-admonition`,
 * `.md-tabs`, `.md-icon`) into Card / Icon / Tabs, and gives tables, code
 * and links their site treatment. Pure typography lives in app/prose.css.
 *
 * No rehype-raw: raw HTML other than the recognised wrappers renders as
 * nothing, so there is no innerHTML anywhere in this pipeline.
 */
import * as React from "react";
import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element, ElementContent } from "hast";
import { Card, Icon, ICON_NAMES, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { docsHref, slugFromFile } from "@/lib/docs/href";
import { remarkContainers, remarkHeadingIds, remarkIcons } from "@/lib/docs/markdown";
import { CodeBlock } from "./code-block";
import { DocTabs } from "./doc-tabs";

/* ── Icon shortcodes → design-system icons ───────────────────────────────── */

const ICON_MAP: Record<string, IconName> = {
  "material-rocket-outline": "launch",
  "material-rocket-launch-outline": "launch",
  "material-key-variant": "key",
  "material-key": "key",
  "material-book-open-variant": "docs",
  "material-book-open-outline": "docs",
  "material-flash": "zap",
  "material-lightning-bolt": "zap",
  "material-cloud": "globe",
  "material-cloud-outline": "globe",
  "material-chip": "cpu",
  "material-memory": "cpu",
  "material-database": "database",
  "material-console": "terminal",
  "material-information-outline": "info",
  "material-alert": "warning",
  "material-alert-outline": "warning",
  "material-check": "check",
  "material-check-circle": "check-circle",
  "material-content-copy": "copy",
  "material-lock": "lock",
  "material-folder": "folder",
  "material-notebook": "notebook",
  "material-package-variant": "package",
  "material-magnify": "search",
  "material-cash": "billing",
  "material-shield-check": "compliance",
  "material-server": "node",
  "material-chart-line": "chart",
  "octicons-arrow-right-24": "arrow-right",
  "octicons-arrow-right-16": "arrow-right",
  "octicons-link-external-16": "external",
  "octicons-terminal-24": "terminal",
  "octicons-book-24": "docs",
};

function iconFor(shortcode: string | undefined): IconName | null {
  if (!shortcode) return null;
  const mapped = ICON_MAP[shortcode];
  if (mapped) return mapped;
  // `material-<name>` where <name> happens to be a design-system icon.
  const bare = shortcode.replace(/^(material|octicons|fontawesome|simple)-/, "").replace(/-\d+$/, "");
  return (ICON_NAMES as readonly string[]).includes(bare) ? (bare as IconName) : null;
}

/* ── hast helpers ────────────────────────────────────────────────────────── */

function hastText(node: ElementContent | Element | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(hastText).join("");
  return "";
}

function elements(node: Element | undefined): Element[] {
  return (node?.children ?? []).filter((c): c is Element => c.type === "element");
}

function findElement(node: Element | undefined, tag: string): Element | undefined {
  for (const c of elements(node)) {
    if (c.tagName === tag) return c;
    const deep = findElement(c, tag);
    if (deep) return deep;
  }
  return undefined;
}

function prop(node: Element | undefined, key: string): string | undefined {
  const v = node?.properties?.[key];
  return typeof v === "string" ? v : undefined;
}

function hasClass(node: Element | undefined, name: string): boolean {
  const c = node?.properties?.className;
  return Array.isArray(c) ? c.includes(name) : c === name;
}

/* ── Links ───────────────────────────────────────────────────────────────── */

/**
 * Resolves a Markdown href against the page it appears on. `.md` links
 * become docs routes (relative to the page's folder, as MkDocs does);
 * everything else is left alone.
 */
function resolveHref(href: string, pageFile: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#") || href.startsWith("/")) {
    return href;
  }
  const m = /^(.*?\.md)(#.*)?$/i.exec(href);
  if (!m) return href;
  const dir = pageFile.includes("/") ? pageFile.slice(0, pageFile.lastIndexOf("/")) : "";
  const parts = `${dir ? `${dir}/` : ""}${m[1]!}`.split("/");
  const out: string[] = [];
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return docsHref(slugFromFile(out.join("/"))) + (m[2] ?? "");
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* ── Callout (admonition) ────────────────────────────────────────────────── */

const TONES: Record<string, { icon: IconName; text: string; border: string }> = {
  note: { icon: "info", text: "text-info", border: "border-l-info" },
  info: { icon: "info", text: "text-info", border: "border-l-info" },
  abstract: { icon: "docs", text: "text-info", border: "border-l-info" },
  example: { icon: "terminal", text: "text-info", border: "border-l-info" },
  tip: { icon: "check-circle", text: "text-hydro", border: "border-l-hydro" },
  hint: { icon: "check-circle", text: "text-hydro", border: "border-l-hydro" },
  success: { icon: "check-circle", text: "text-hydro", border: "border-l-hydro" },
  question: { icon: "info", text: "text-warning", border: "border-l-warning" },
  warning: { icon: "warning", text: "text-warning", border: "border-l-warning" },
  caution: { icon: "warning", text: "text-warning", border: "border-l-warning" },
  danger: { icon: "warning", text: "text-danger", border: "border-l-danger" },
  failure: { icon: "warning", text: "text-danger", border: "border-l-danger" },
  bug: { icon: "warning", text: "text-danger", border: "border-l-danger" },
};

function Callout({
  type,
  title,
  collapse,
  children,
}: {
  type: string;
  title: string;
  collapse: "" | "open" | "closed";
  children: React.ReactNode;
}) {
  const tone = TONES[type] ?? TONES.note!;
  const label = title || type.charAt(0).toUpperCase() + type.slice(1);
  const head = (
    <span className={cn("flex items-center gap-2 text-[13px] font-semibold", tone.text)}>
      <Icon name={tone.icon} size={16} weight="duotone" />
      {label}
      {collapse ? (
        <Icon name="caret-right" size={12} className="md-callout-caret ml-auto transition-transform duration-fast" />
      ) : null}
    </span>
  );
  const shell = cn("md-callout rounded-lg border border-line bg-surface-card px-5 py-4 border-l-2", tone.border);
  if (collapse) {
    return (
      <details className={shell} open={collapse === "open"}>
        <summary>{head}</summary>
        {children}
      </details>
    );
  }
  return (
    <div className={shell}>
      {head}
      {children}
    </div>
  );
}

/* ── Grid card ───────────────────────────────────────────────────────────── */

/**
 * A Material grid card is a list item shaped as: `icon **Title**`, `---`,
 * body paragraphs, and a final paragraph holding one link. Pull those apart
 * and lay them out like the archived docs landing cards; if the shape does
 * not match, fall back to rendering the children as-is.
 */
function GridCard({ node, children, pageFile }: { node: Element; children: React.ReactNode; pageFile: string }) {
  const kids = elements(node);
  const first = kids[0];
  const strong = first?.tagName === "p" ? findElement(first, "strong") : undefined;
  const iconEl = first?.tagName === "p" ? findElement(first, "span") : undefined;
  const last = kids[kids.length - 1];
  const linkEl = last && last !== first && last.tagName === "p" ? findElement(last, "a") : undefined;

  if (!strong) {
    return (
      <Card padding={22} className="md-card h-full">
        {children}
      </Card>
    );
  }

  const icon = iconFor(prop(iconEl, "dataIcon"));
  const title = hastText(strong);
  const href = linkEl ? resolveHref(prop(linkEl, "href") ?? "", pageFile) : null;
  const linkText = linkEl ? hastText(linkEl).trim() : "";
  // Element children only (drop the "\n" text nodes between blocks), minus
  // the title paragraph, the link paragraph and the `---` divider.
  const elems = React.Children.toArray(children).filter(React.isValidElement);
  const body = elems.slice(1, linkEl ? -1 : undefined).filter((c) => c.type !== "hr");

  const inner = (
    <Card
      padding={22}
      className={cn(
        "md-card h-full transition-[border-color] duration-fast",
        href ? "group-hover:border-line-strong" : null,
      )}
    >
      {icon ? <Icon name={icon} size={19} weight="duotone" className="text-ink-100" /> : null}
      <h3 className="mt-3.5 text-base font-semibold tracking-tight text-ink-100">{title}</h3>
      <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-ink-400">{body}</div>
      {href ? (
        <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[12.5px] text-hydro">
          {linkText || "Read more"}
          <Icon name="arrow-right" size={13} />
        </span>
      ) : null}
    </Card>
  );

  if (!href) return inner;
  return href.startsWith("/") ? (
    <Link href={href} className="md-card-link group">
      {inner}
    </Link>
  ) : (
    <a href={href} className="md-card-link group">
      {inner}
    </a>
  );
}

/* ── The component map ───────────────────────────────────────────────────── */

function components(pageFile: string): Components {
  const Heading = (Tag: "h2" | "h3" | "h4") =>
    function DocHeading({ node, children, ...rest }: React.ComponentProps<"h2"> & { node?: Element }) {
      const id = prop(node, "id");
      return (
        <Tag id={id} {...rest}>
          {children}
          {id ? (
            <a href={`#${id}`} className="md-anchor" aria-label="Link to this section">
              #
            </a>
          ) : null}
        </Tag>
      );
    };

  return {
    h1: Heading("h2"), // A stray second H1 reads as a section, not a title.
    h2: Heading("h2"),
    h3: Heading("h3"),
    h4: Heading("h4"),

    a({ node, href = "", children, ...rest }) {
      void node;
      const target = resolveHref(href, pageFile);
      if (target.startsWith("/")) {
        return (
          <Link href={target} {...rest}>
            {children}
          </Link>
        );
      }
      if (/^https?:/i.test(target)) {
        return (
          <a href={target} target="_blank" rel="noreferrer noopener" {...rest}>
            {children}
          </a>
        );
      }
      return (
        <a href={target} {...rest}>
          {children}
        </a>
      );
    },

    img({ node, src, alt, ...rest }) {
      void node;
      const s = typeof src === "string" ? src : "";
      return <img src={s.startsWith("/") ? `${BASE}${s}` : s} alt={alt ?? ""} loading="lazy" {...rest} />;
    },

    table({ node, children, ...rest }) {
      void node;
      return (
        <div className="md-table">
          <table {...rest}>{children}</table>
        </div>
      );
    },

    pre({ node }) {
      const code = elements(node)[0];
      const cls = code?.properties?.className;
      const lang = (Array.isArray(cls) ? cls : [cls])
        .map(String)
        .find((c) => c.startsWith("language-"))
        ?.slice(9);
      const meta = (code?.data as { meta?: string } | undefined)?.meta ?? "";
      const title = /title="([^"]*)"/.exec(meta)?.[1];
      return <CodeBlock code={hastText(code).replace(/\n$/, "")} lang={lang} title={title} />;
    },

    span({ node, children, ...rest }) {
      if (hasClass(node, "md-icon")) {
        const name = iconFor(prop(node, "dataIcon"));
        return name ? (
          <span className="md-icon" aria-hidden="true">
            <Icon name={name} size={16} />
          </span>
        ) : null;
      }
      return <span {...rest}>{children}</span>;
    },

    div({ node, children, ...rest }) {
      if (hasClass(node, "cards")) {
        // Material's `<div class="grid cards" markdown>` — the list inside
        // becomes the grid, each item a card.
        const list = findElement(node, "ul") ?? findElement(node, "ol");
        const items = elements(list);
        // Intrinsic elements get no `node` prop, so match the list by tag.
        const rendered = React.Children.toArray(children);
        const listEl = rendered.find(
          (c): c is React.ReactElement<{ children?: React.ReactNode }> =>
            React.isValidElement(c) && c.type === list?.tagName,
        );
        const liEls = listEl
          ? React.Children.toArray(listEl.props.children).filter(
              (c): c is React.ReactElement<{ children?: React.ReactNode }> =>
                React.isValidElement(c) && c.type === "li",
            )
          : [];
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((li, i) => (
              <GridCard key={i} node={li} pageFile={pageFile}>
                {liEls[i]?.props.children}
              </GridCard>
            ))}
          </div>
        );
      }
      if (hasClass(node, "md-admonition")) {
        const collapse = prop(node, "dataCollapse");
        return (
          <Callout
            type={prop(node, "dataType") ?? "note"}
            title={prop(node, "dataTitle") ?? ""}
            collapse={collapse === "open" || collapse === "closed" ? collapse : ""}
          >
            {children}
          </Callout>
        );
      }
      if (hasClass(node, "md-tabs")) {
        return <DocTabs>{children}</DocTabs>;
      }
      if (hasClass(node, "md-tab")) {
        return (
          <div className="md-tabpanel" data-title={prop(node, "dataTitle")}>
            {children}
          </div>
        );
      }
      const { className, ...others } = rest;
      return (
        <div className={typeof className === "string" ? className : undefined} {...others}>
          {children}
        </div>
      );
    },
  };
}

/* ── Public component ────────────────────────────────────────────────────── */

export function DocMarkdown({ body, pageFile }: { body: string; pageFile: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkContainers, remarkIcons, remarkHeadingIds]}
      components={components(pageFile)}
    >
      {body}
    </Markdown>
  );
}
