/**
 * Small shared portal pieces: status pills, meters, page headers, metric
 * tiles, tables and the placeholder-pricing badge. Server components — none
 * of them hold state; the motion is CSS (app/portal.css) plus CountUp.
 */
import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { CountUp } from "@/components/fx/count-up";
import { CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { PodStatus } from "@/lib/api/types";

/* ── Status ───────────────────────────────────────────────────────────── */

type Tone = "success" | "info" | "neutral" | "danger" | "warning";

const POD_TONE: Record<PodStatus, Tone> = {
  running: "success",
  queued: "info",
  provisioning: "info",
  "pulling-image": "info",
  stopping: "warning",
  stopped: "neutral",
  failed: "danger",
  terminated: "neutral",
};

/** A pod's state, said in its colour. Nothing blinks or pulses: the word
    is the status. */
export function PodStatusPill({ status }: { status: PodStatus }) {
  return <Badge tone={POD_TONE[status]}>{status}</Badge>;
}

/** Thin utilisation meter. Fills on mount; warms up above 60%. */
export function UtilBar({
  value,
  width = 64,
  delay = 0,
}: {
  value: number;
  width?: number;
  delay?: number;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-[5px] overflow-hidden rounded-pill bg-carbon-500"
        style={{ width }}
      >
        {v > 0 ? (
          <div
            className={cn("pt-bar h-full rounded-pill bg-hydro", v > 60 && "pt-bar--hot")}
            style={{ width: `${v}%`, "--pt-d": `${delay}ms` } as React.CSSProperties}
          />
        ) : null}
      </div>
      <span className="nums w-8 font-mono text-[11px] text-ink-500">{value}%</span>
    </div>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────── */

export function PortalPageHeader({
  title,
  eyebrow,
  description,
  actions,
  mono = false,
}: {
  title: string;
  /** The CLI-style path above the title, e.g. "compute / pods". */
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Resource names (a pod, a key) keep their monospaced spelling. */
  mono?: boolean;
}) {
  return (
    <div className="pt-in mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="cv-label flex items-center gap-2 text-[11px] text-hydro">
              <span aria-hidden="true">&gt;</span>
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "mt-2.5 text-ink-100",
              mono
                ? "font-mono text-[26px] font-medium tracking-tight"
                : "display text-[clamp(1.75rem,2.6vw,2.15rem)]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-[68ch] text-[14.5px] leading-relaxed text-ink-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <hr className="rule-fade mt-7" />
    </div>
  );
}

/** A section heading inside a page: a label, an optional link on the right. */
export function SectionHeading({
  children,
  aside,
  className,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3.5 flex items-end justify-between gap-4", className)}>
      <h2 className="text-[15px] font-semibold tracking-tight text-ink-100">{children}</h2>
      {aside}
    </div>
  );
}

/** "all pods →" beside a section heading. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 font-mono text-[12px] tracking-wide text-ink-400 transition-colors duration-fast hover:text-hydro"
    >
      {children}
      <Icon
        name="arrow-right"
        size={13}
        className="transition-transform duration-normal ease-out group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/** The console card: the site's glass card at rounded-xl. */
export function Panel({
  children,
  className,
  padding = 22,
  accent = false,
  hover = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: number;
  accent?: boolean;
  hover?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("pt-card", accent && "pt-card--accent", hover && "pt-card--hover", className)}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  count,
  unit,
  sub,
  delta,
  accent = false,
  index = 0,
}: {
  label: string;
  /** Rendered as-is when `count` is not given. */
  value?: React.ReactNode;
  /** A number that counts up on first view (the server renders the final value). */
  count?: { value: number; decimals?: number; prefix?: string; suffix?: string };
  /** A smaller trailing unit: "GB", "GPUs", "/ 6". */
  unit?: React.ReactNode;
  sub?: React.ReactNode;
  /** A short Hydro pill next to the label, e.g. "+12%". */
  delta?: string;
  accent?: boolean;
  /** Position in a row, for the entrance stagger. */
  index?: number;
}) {
  return (
    <div
      className={cn("pt-card pt-card--hover pt-in p-5", accent && "pt-card--accent")}
      style={{ "--pt-d": `${index * 70}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="cv-label text-[10px]">{label}</p>
        {delta ? <span className="gpu-delta">{delta}</span> : null}
      </div>
      <p
        className={cn(
          "nums mt-3.5 font-mono text-[28px] leading-none font-medium tracking-tight",
          accent ? "text-hydro" : "text-ink-100",
        )}
      >
        {count ? (
          <CountUp
            value={count.value}
            decimals={count.decimals}
            prefix={count.prefix}
            suffix={count.suffix}
            duration={1200}
          />
        ) : (
          value
        )}
        {unit ? (
          <span className="ml-1.5 text-[0.55em] font-normal text-ink-400">{unit}</span>
        ) : null}
      </p>
      {sub ? <div className="mt-2.5 text-[12.5px] text-ink-500">{sub}</div> : null}
    </div>
  );
}

/** Rendered wherever a figure derives from placeholder catalogue rates. */
export function PlaceholderPricingBadge({ className }: { className?: string }) {
  if (!CATALOG.meta.pricingIsPlaceholder) return null;
  return (
    <span
      title={CATALOG.meta.notice}
      className={cn(
        // Set as type in the warning colour — never a pill.
        "inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-wide text-warning uppercase",
        className,
      )}
    >
      <Icon name="warning" size={11} weight="fill" />
      indicative pricing
    </span>
  );
}

export function EmptyState({
  icon = "package",
  title,
  body,
  action,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel padding={0}>
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-lg border border-line bg-carbon-600 text-hydro">
          <Icon name={icon} size={20} />
        </span>
        <p className="mt-1 text-[15px] font-semibold tracking-tight text-ink-100">{title}</p>
        <p className="max-w-sm text-[13.5px] leading-relaxed text-ink-500">{body}</p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </Panel>
  );
}

/** Horizontal-scrolling wrapper so dense tables never break the page layout. */
export function TableScroll({
  children,
  minWidth = "48rem",
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="pt-card pt-in overflow-x-auto">
      <table className="pt-table w-full border-collapse" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "cv-label px-4 py-3 text-[10px]",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

/** A table row with the console hover (Hydro tick) and a short entrance. */
export function Tr({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <tr
      className={cn("pt-row pt-in", className)}
      style={{ "--pt-d": `${Math.min(index, 8) * 40 + 120}ms` } as React.CSSProperties}
    >
      {children}
    </tr>
  );
}
