/**
 * Pieces of a role page. Isomorphic (no hooks, no fs) so the CMS live
 * preview can render a draft with exactly the same markup.
 */
import Link from "next/link";
import { ButtonLink, Card, Icon } from "@/components/ui";
import { RichText } from "@/components/content/rich-text";
import { ShareLinks } from "@/components/content/share-links";
import { EMPLOYMENT_LABEL, WORK_MODE_LABEL, formatDate } from "@/lib/content/format";
import type { Job, MediaItem } from "@/lib/content/types";

type RoleLike = Pick<Job, "title" | "body" | "responsibilities" | "requirements" | "niceToHave">;

function Points({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-[1.35rem] font-semibold tracking-tight text-ink-100">{title}</h2>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[15.5px] leading-relaxed text-ink-300">
            <Icon name="check" size={16} className="mt-1 shrink-0 text-hydro" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function JobRole({ job, media }: { job: RoleLike; media: Map<string, MediaItem> }) {
  return (
    <article>
      {job.body ? (
        <section>
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-ink-100">About the role</h2>
          <RichText state={job.body} media={media} className="mt-5" />
        </section>
      ) : null}
      <Points title="What you’ll do" items={job.responsibilities} />
      <Points title="What we’re looking for" items={job.requirements} />
      <Points title="Nice to have" items={job.niceToHave} />
    </article>
  );
}

export function JobSummary({
  job,
  url,
  rows,
}: {
  job: Pick<Job, "title"> & { closed?: boolean };
  url: string;
  rows: [string, string][];
}) {
  return (
    <aside className="lg:sticky lg:top-28">
      <Card surface="solid" padding={0}>
        <dl className="divide-y divide-line-subtle">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
              <dt className="cv-label shrink-0 text-[10px]">{k}</dt>
              <dd className="text-right text-[14px] text-ink-200">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-line-subtle p-5">
          {job.closed ? (
            <p className="text-[14px] text-ink-400">Applications are closed.</p>
          ) : (
            <ButtonLink href="#apply" fullWidth iconRight={<Icon name="arrow-right" size={15} />} className="justify-between">
              Apply now
            </ButtonLink>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[12.5px] text-ink-500">Share this role</span>
            <ShareLinks url={url} title={`${job.title} at CoreValley`} />
          </div>
        </div>
      </Card>
    </aside>
  );
}

export function HiringSteps({
  steps,
  heading = "How hiring works",
  compact = false,
}: {
  steps: { title: string; body?: string; duration?: string }[];
  heading?: string;
  compact?: boolean;
}) {
  return (
    <section>
      <h2 className={compact ? "cv-label text-[10px]" : "text-[1.35rem] font-semibold tracking-tight text-ink-100"}>
        {heading}
      </h2>
      <ol className={compact ? "mt-4 flex flex-col gap-3" : "mt-6 grid gap-3 sm:grid-cols-2"}>
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-line bg-surface-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[12px] text-ink-500">{String(i + 1).padStart(2, "0")}</span>
              {s.duration ? <span className="font-mono text-[11.5px] text-ink-500">{s.duration}</span> : null}
            </div>
            <p className="mt-2 text-[15px] font-semibold tracking-tight text-ink-100">{s.title}</p>
            {s.body && !compact ? <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{s.body}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SimilarRoles({
  jobs,
}: {
  jobs: (Pick<Job, "slug" | "title" | "workMode" | "employmentType" | "closesAt"> & {
    teamInfo: { name: string } | null;
    locationInfo: { name: string }[];
  })[];
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {jobs.map((j) => (
        <li key={j.slug}>
          <Link
            href={`/jobs/${j.slug}/`}
            className="group flex h-full flex-col rounded-2xl border border-line bg-surface-card p-6 transition-colors duration-300 hover:border-line-strong"
          >
            <span className="cv-label text-[10px]">{j.teamInfo?.name ?? "CoreValley"}</span>
            <span className="mt-3 text-[17px] font-semibold tracking-tight text-ink-100">{j.title}</span>
            <span className="mt-2 text-[13px] text-ink-500">
              {[j.locationInfo.map((l) => l.name).join(", ") || "Nepal", WORK_MODE_LABEL[j.workMode], EMPLOYMENT_LABEL[j.employmentType]].join(" · ")}
            </span>
            {j.closesAt ? <span className="mt-1 text-[13px] text-ink-500">Closes {formatDate(j.closesAt)}</span> : null}
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-medium text-ink-300 group-hover:text-ink-100">
              View role
              <Icon name="arrow-right" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
