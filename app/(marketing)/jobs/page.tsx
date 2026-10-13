import { ButtonLink } from "@/components/system/button";
import { PageHero, TitledSection as Section } from "@/components/system/page-hero";
import { TextLink } from "@/components/system/text-link";
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
        data={[breadcrumbJsonLd([{ name: "Careers", path: "/jobs" }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]}
      />
      <PageHero eyebrow={page.hero.eyebrow ?? "Careers"} title={page.hero.title} lead={page.hero.lead}>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink href="#roles" size="lg" arrow>
            {jobs.length ? `See ${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}` : "Open roles"}
          </ButtonLink>
          {general ? <TextLink href={general}>Send a general application</TextLink> : null}
        </div>
      </PageHero>

      <Section id="roles" eyebrow="Open roles" title="Join the team.">
        <JobsBoard jobs={jobs.map(toListItem)} generalHref={general} />
      </Section>

      <LayoutBlocks blocks={page.layout} media={media} />

      {general ? (
        <Section>
          <div
            data-reveal
            className="flex flex-col items-start justify-between gap-6 rounded-panel border border-line bg-bg-raised p-8 md:flex-row md:items-center md:p-10"
          >
            <div className="flex max-w-[52ch] flex-col gap-2">
              <h2 className="type-title-2">{page.generalApplication.title}</h2>
              <p className="type-body text-ink-2">{page.generalApplication.summary}</p>
            </div>
            <ButtonLink href={general} variant="secondary" size="lg" arrow>
              Apply
            </ButtonLink>
          </div>
        </Section>
      ) : null}
    </>
  );
}
