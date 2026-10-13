import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Card, Icon } from "@/components/ui";
import { PageHero, TitledSection as Section } from "@/components/system/page-hero";
import { JobRole, JobSummary, HiringSteps, SimilarRoles } from "@/components/jobs/job-parts";
import { ApplicationForm } from "@/components/jobs/application-form";
import { JsonLd, breadcrumbJsonLd, jobPostingJsonLd } from "@/components/seo/json-ld";
import { EMPLOYMENT_LABEL, WORK_MODE_LABEL, formatDate } from "@/lib/content/format";
import { GENERAL_APPLICATION, allJobs, careersPage, jobBySlug, jobMetaLine, similarJobs } from "@/lib/content/jobs";
import { toHtml } from "@/lib/content/lexical";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: GENERAL_APPLICATION }, ...allJobs().map((j) => ({ slug: j.slug }))];
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  if (slug === GENERAL_APPLICATION) {
    const g = careersPage().generalApplication;
    return pageMetadata({ title: `${g.title} — Careers`, description: g.summary, path: `/jobs/${slug}` });
  }
  const job = jobBySlug(slug);
  if (!job) return {};
  return pageMetadata({
    title: `${job.title} — ${job.teamInfo?.name ?? "Careers"}`,
    description: job.summary,
    path: `/jobs/${job.slug}`,
    noindex: job.closed,
  });
}

function jobDescriptionHtml(job: NonNullable<ReturnType<typeof jobBySlug>>): string {
  const list = (title: string, items: string[]) =>
    items.length
      ? `<h3>${title}</h3><ul>${items.map((i) => `<li>${i.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</li>`).join("")}</ul>`
      : "";
  return [
    `<p>${job.summary.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`,
    toHtml(job.body, absoluteUrl),
    list("What you’ll do", job.responsibilities),
    list("What we’re looking for", job.requirements),
    list("Nice to have", job.niceToHave),
  ].join("");
}

export default async function JobPage({ params }: Params) {
  const { slug } = await params;
  const careers = careersPage();
  const steps = careers.layout.find((b) => b.blockType === "processSteps");

  if (slug === GENERAL_APPLICATION) {
    const g = careers.generalApplication;
    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Careers", path: "/jobs" },
            { name: g.title, path: `/jobs/${slug}` },
          ])}
        />
        <PageHero eyebrow="Careers" title={g.title} lead={g.summary} />
        <Section>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div id="apply" className="scroll-mt-28">
              <ApplicationForm role="General application" slug={slug} />
            </div>
            <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
              {steps && steps.blockType === "processSteps" ? <HiringSteps steps={steps.steps} compact /> : null}
              <Link
                href="/jobs/#roles"
                className="inline-flex items-center gap-2 text-[14px] text-ink-300 underline underline-offset-4 hover:text-ink-100"
              >
                See open roles
                <Icon name="arrow-right" size={14} />
              </Link>
            </aside>
          </div>
        </Section>
      </>
    );
  }

  const job = jobBySlug(slug);
  if (!job) notFound();
  const { media } = loadContent();
  const path = `/jobs/${job.slug}`;
  const team = job.teamInfo?.name;
  const similar = similarJobs(job);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Careers", path: "/jobs" },
            { name: job.title, path },
          ]),
          ...(job.closed
            ? []
            : [
                jobPostingJsonLd({
                  path,
                  title: job.title,
                  descriptionHtml: jobDescriptionHtml(job),
                  datePosted: job.postedAt,
                  validThrough: job.closesAt,
                  employmentType: job.employmentType,
                  remote: job.workMode === "remote",
                  locations: job.locationInfo.map((l) => ({ city: l.city, region: l.region, country: l.country })),
                  team,
                }),
              ]),
        ]}
      />

      <PageHero eyebrow={team ? `Careers · ${team}` : "Careers"} title={job.title} lead={job.summary}>
        <p className="mt-6 font-mono text-[12.5px] tracking-wide text-white/50">{jobMetaLine(job)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          {job.closed ? (
            <span className="text-[14px] text-white/70">This role closed on {formatDate(job.closesAt!)}.</span>
          ) : (
            <ButtonLink href="#apply" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
              Apply for this role
            </ButtonLink>
          )}
          <Link
            href="/jobs/#roles"
            className="text-[14px] font-medium text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
          >
            All open roles
          </Link>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="min-w-0">
            <JobRole job={job} media={media} />
            {steps && steps.blockType === "processSteps" ? (
              <div className="mt-14">
                <HiringSteps steps={steps.steps} heading={steps.heading ?? "How hiring works"} />
              </div>
            ) : null}
          </div>
          <JobSummary
            job={job}
            url={absoluteUrl(path)}
            rows={[
              ["Team", team ?? "—"],
              ["Location", job.locationInfo.map((l) => l.name).join(", ") || "Nepal"],
              ["Work mode", WORK_MODE_LABEL[job.workMode]],
              ["Type", EMPLOYMENT_LABEL[job.employmentType]],
              ...(job.seniority ? ([["Level", job.seniority]] as [string, string][]) : []),
              ["Posted", formatDate(job.postedAt)],
              ["Closes", job.closesAt ? formatDate(job.closesAt) : "When filled"],
            ]}
          />
        </div>
      </Section>

      <Section
        id="apply"
        eyebrow={job.closed ? "Closed" : "Apply"}
        title={job.closed ? "This role has closed." : "Apply for this role."}
      >
        {job.closed ? (
          <Card surface="solid" padding={28} className="max-w-[44rem]">
            <p className="text-[15px] leading-relaxed text-ink-300">
              We’re no longer taking applications for {job.title}. Have a look at the other open roles, or send a
              general application and we’ll keep you in mind.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/jobs/#roles" iconRight={<Icon name="arrow-right" size={15} />}>
                Open roles
              </ButtonLink>
              <ButtonLink href={`/jobs/${GENERAL_APPLICATION}/`} variant="secondary">
                General application
              </ButtonLink>
            </div>
          </Card>
        ) : job.applyMode === "external" && job.externalApplyUrl ? (
          <ButtonLink href={job.externalApplyUrl} size="lg" iconRight={<Icon name="external" size={16} />}>
            Apply on our hiring partner’s site
          </ButtonLink>
        ) : (
          <div className="max-w-[48rem]">
            <ApplicationForm role={job.title} team={team} slug={job.slug} />
          </div>
        )}
      </Section>

      {similar.length ? (
        <Section eyebrow="More roles" title="You might also like.">
          <SimilarRoles jobs={similar} />
        </Section>
      ) : null}
    </>
  );
}
