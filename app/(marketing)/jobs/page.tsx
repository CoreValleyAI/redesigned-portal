import { ButtonLink, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/fx/reveal";
import { JobsBoard } from "@/components/jobs/jobs-board";
import { LayoutBlocks } from "@/components/content/layout-blocks";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { GENERAL_APPLICATION, careersPage, openJobs, toListItem } from "@/lib/content/jobs";
import { loadContent } from "@/lib/content/source";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  const page = careersPage();
  return pageMetadata({
    title: page.seo.title ?? "Careers — jobs at CoreValley in Kathmandu",
    description:
      page.seo.description ??
      "Open roles at CoreValley, Nepal’s GPU cloud: platform engineering, datacenter infrastructure, customer engineering and more, in Kathmandu.",
    path: "/jobs",
    noindex: page.seo.noindex,
  });
}

export default function JobsPage() {
  const page = careersPage();
  const { media } = loadContent();
  const jobs = openJobs();
  const general = page.generalApplication.enabled ? `/jobs/${GENERAL_APPLICATION}/` : undefined;
  const faqs = page.layout.flatMap((b) =>
    b.blockType === "faq" ? b.items.map((f) => ({ q: f.question, a: f.answer })) : [],
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Careers", path: "/jobs" }]),
          ...(faqs.length ? [faqJsonLd(faqs)] : []),
        ]}
      />
      <PageHero eyebrow={page.hero.eyebrow ?? "Careers"} title={page.hero.title} lead={page.hero.lead}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink href="#roles" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
            {jobs.length ? `See ${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}` : "Open roles"}
          </ButtonLink>
          {general ? (
            <a
              href={general}
              className="text-[14px] font-medium text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
            >
              Send a general application
            </a>
          ) : null}
        </div>
      </PageHero>

      <Section id="roles" eyebrow="Open roles" title="Join the team.">
        <JobsBoard jobs={jobs.map(toListItem)} generalHref={general} />
      </Section>

      <LayoutBlocks blocks={page.layout} media={media} />

      {general ? (
        <Section>
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-line bg-surface-card p-8 md:flex-row md:items-center md:p-10">
              <div className="max-w-[52ch]">
                <h2 className="text-2xl font-semibold tracking-tight text-ink-100">{page.generalApplication.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-400">{page.generalApplication.summary}</p>
              </div>
              <ButtonLink href={general} variant="secondary" size="lg" iconRight={<Icon name="arrow-right" size={16} />}>
                Apply
              </ButtonLink>
            </div>
          </Reveal>
        </Section>
      ) : null}
    </>
  );
}
