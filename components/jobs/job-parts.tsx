/**
 * Pieces of a role page. Isomorphic (no hooks, no fs) so the CMS live
 * preview can render a draft with exactly the same markup.
 */
import { RichText } from "@/components/content/rich-text";
import { AppLink } from "@/components/system/app-link";
import { Arrow, ButtonLink } from "@/components/system/button";
import { ShareLinks } from "@/components/content/share-links";
import { EMPLOYMENT_LABEL, WORK_MODE_LABEL, formatDate } from "@/lib/content/format";
import type { Job, MediaItem } from "@/lib/content/types";

type RoleLike = Pick<Job, "title" | "body" | "responsibilities" | "requirements" | "niceToHave">;

function Points({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="type-title-3">{title}</h2>
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it} className="type-body flex gap-3.5 text-ink-2">
            <span aria-hidden="true" className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-hydro" />
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
          <h2 className="type-title-3">About the role</h2>
          <RichText state={job.body} media={media} className="prose-article mt-5" />
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
    <aside className="overflow-hidden rounded-panel border border-line bg-bg-raised lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
      <div>
        <dl className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
              <dt className="type-kicker shrink-0 text-ink-3">{k}</dt>
              <dd className="type-small text-right text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-line p-5">
          {job.closed ? (
            <p className="type-small text-ink-2">Applications are closed.</p>
          ) : (
            <ButtonLink href="#apply" arrow className="w-full justify-between">
              Apply now
            </ButtonLink>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="type-caption text-ink-3">Share this role</span>
            <ShareLinks url={url} title={`${job.title} at CoreValley`} />
          </div>
        </div>
      </div>
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
      <h2 className={compact ? "type-kicker text-ink-3" : "type-title-3"}>{heading}</h2>
      <ol className={compact ? "mt-4 flex flex-col gap-3" : "mt-6 grid gap-3 sm:grid-cols-2"}>
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-card border border-line bg-bg-raised p-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              {s.duration ? <span className="font-mono text-[11.5px] text-ink-3">{s.duration}</span> : null}
            </div>
            <p className="type-body mt-2 font-semibold text-ink">{s.title}</p>
            {s.body && !compact ? <p className="type-small mt-1.5 text-ink-2">{s.body}</p> : null}
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
          <AppLink
            href={`/jobs/${j.slug}/`}
            className="group/btn flex h-full flex-col rounded-card border border-line bg-bg-raised p-6 transition-colors duration-300 hover:border-line-strong"
          >
            <span className="type-kicker text-ink-3">{j.teamInfo?.name ?? "CoreValley"}</span>
            <span className="type-title-3 mt-3">{j.title}</span>
            <span className="type-small mt-2 text-ink-3">
              {[
                j.locationInfo.map((l) => l.name).join(", ") || "Nepal",
                WORK_MODE_LABEL[j.workMode],
                EMPLOYMENT_LABEL[j.employmentType],
              ].join(" · ")}
            </span>
            {j.closesAt ? <span className="type-small mt-1 text-ink-3">Closes {formatDate(j.closesAt)}</span> : null}
            <span className="type-small mt-auto inline-flex items-center gap-1.5 pt-5 font-medium text-ink-2 group-hover/btn:text-ink">
              View role
              <Arrow />
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
