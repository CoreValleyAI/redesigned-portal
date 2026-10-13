"use client";

/**
 * Live preview for the CMS. The CMS opens this page in an iframe with
 * ?c=<collection>&id=<id>&cms=<cms origin>; as the editor types, the CMS
 * posts the draft here and we render it with the same components as the
 * published pages.
 *
 * Only CMS origins in NEXT_PUBLIC_CMS_ORIGINS are listened to, and the
 * library itself ignores messages from any other origin. Nothing on this
 * page is indexed or linked.
 */
import * as React from "react";
import { ready, subscribe, unsubscribe } from "@payloadcms/live-preview";
import { LayoutBlocks } from "@/components/content/layout-blocks";
import { PageHero, TitledSection as Section } from "@/components/system/page-hero";
import { JobRole, JobSummary } from "@/components/jobs/job-parts";
import { PostBody, PostHeader } from "@/components/blog/post-article";
import { EMPLOYMENT_LABEL, WORK_MODE_LABEL, formatDate } from "@/lib/content/format";
import { PreviewLookups, previewCareers, previewJob, previewPost } from "@/lib/content/from-payload";

const ALLOWED = (process.env.NEXT_PUBLIC_CMS_ORIGINS || "http://localhost:3000,https://cms.corevalley.ai")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

type Doc = Record<string, unknown>;

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page">
      <div className="pt-40 pb-24 text-center">
        <p className="type-kicker text-ink-3">Live preview</p>
        <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-2">{children}</p>
      </div>
    </div>
  );
}

export function CmsPreview() {
  const [params, setParams] = React.useState<{ c: string; id: string; cms: string } | null>(null);
  const [data, setData] = React.useState<Doc | null>(null);

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setParams({ c: p.get("c") ?? "", id: p.get("id") ?? "", cms: p.get("cms") ?? "" });
  }, []);

  const allowed = params ? ALLOWED.includes(params.cms) : false;

  React.useEffect(() => {
    if (!params || !allowed) return;
    const initial: Doc = params.id && params.id !== "global" ? { id: params.id } : {};
    const sub = subscribe<Doc>({
      serverURL: params.cms,
      initialData: initial,
      depth: 2,
      callback: (d) => setData(d),
    });
    ready({ serverURL: params.cms });
    return () => unsubscribe(sub);
  }, [params, allowed]);

  if (!params) return null;
  if (!allowed) return <Notice>This preview only accepts drafts from the CoreValley CMS.</Notice>;
  if (!data || Object.keys(data).length <= 1) return <Notice>Waiting for the draft from the editor…</Notice>;

  const L = new PreviewLookups(params.cms);

  if (params.c === "jobs") {
    const job = previewJob(data, L);
    return (
      <>
        <PageHero
          eyebrow={job.teamInfo ? `Careers · ${job.teamInfo.name}` : "Careers"}
          title={job.title}
          lead={job.summary}
        />
        <Section>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
            <JobRole job={job} media={L.media} />
            <JobSummary
              job={job}
              url="#"
              rows={[
                ["Team", job.teamInfo?.name ?? "—"],
                ["Location", job.locationInfo.map((l) => l.name).join(", ") || "Nepal"],
                ["Work mode", WORK_MODE_LABEL[job.workMode]],
                ["Type", EMPLOYMENT_LABEL[job.employmentType]],
                ["Closes", job.closesAt ? formatDate(job.closesAt) : "When filled"],
              ]}
            />
          </div>
        </Section>
      </>
    );
  }

  if (params.c === "posts") {
    const post = previewPost(data, L);
    return (
      <article>
        <PostHeader post={post} media={L.media} />
        <PostBody post={post} media={L.media} url="#" />
      </article>
    );
  }

  if (params.c === "careers-page") {
    const page = previewCareers(data, L);
    return (
      <>
        <PageHero eyebrow={page.hero.eyebrow ?? "Careers"} title={page.hero.title} lead={page.hero.lead} />
        <Section eyebrow="Open roles" title="Join the team.">
          <p className="text-[15px] text-ink-2">Published roles are listed here on the live page.</p>
        </Section>
        <LayoutBlocks blocks={page.layout} media={L.media} />
      </>
    );
  }

  return <Notice>Nothing to preview for “{params.c}”.</Notice>;
}
