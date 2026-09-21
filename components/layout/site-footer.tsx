import Link from "next/link";
import { Icon } from "@/components/ui";
import { DotMatrix } from "@/components/marketing/dot-matrix";
import { docsUrl } from "@/lib/docs";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Four columns of links is a link farm. Three groups, each capped at five
   entries, plus a legal row — every path here resolves to a real page. */
const GROUPS = [
  {
    heading: "platform",
    links: [
      { href: "/products/gpu-pods", label: "GPU pods" },
      { href: "/products/jupyterhub", label: "JupyterHub" },
      { href: "/products/model-endpoints", label: "Model endpoints" },
      { href: "/products/dedicated", label: "Dedicated & bare metal" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    /* The docs are the MkDocs site under /docs/ — not Next routes, so they
       are `plain` anchors (full navigation, base path already applied). */
    heading: "developers",
    links: [
      { href: docsUrl(), label: "Documentation", plain: true },
      { href: docsUrl("guides/quickstart"), label: "Quickstart", plain: true },
      { href: docsUrl("platform/inference"), label: "API reference", plain: true },
      { href: docsUrl("hardware/specs"), label: "GPU & instance specs", plain: true },
      { href: "/use-cases", label: "Use cases" },
    ],
  },
  {
    heading: "company",
    links: [
      { href: "/company", label: "About CoreValley" },
      { href: "/contact", label: "Contact sales" },
      {
        href: "https://www.linkedin.com/company/corevalleyai/jobs/",
        label: "Careers",
        external: true,
      },
    ],
  },
] as const;

const LEGAL = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/data-residency", label: "Data residency" },
] as const;

const linkClass =
  "text-[13.5px] text-ink-400 transition-colors duration-normal hover:text-ink-100";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 px-4 pb-6 md:px-8">
      {/* The whole footer is one liquid-glass slab, floated off the page
          edge, clear enough that the floor reads through it. */}
      <div className="lg lg-liquid lg-clear relative mx-auto max-w-page-xl overflow-hidden rounded-xl px-6 pt-14 pb-10 md:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            {/* The mark, as the brand's dot matrix, in place of the flat
                lockup. It assembles out of scattered dots the first time it
                scrolls into view and afterwards parts around the pointer and
                lights where it passes. The official combined lockup is the
                sampling source, so the proportions are the brandbook's.
                aria-hidden and inert to the pointer; the accessible name is
                the copy beside it. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative -ml-4 h-[260px] w-[260px] md:h-[300px] md:w-[300px]"
            >
              <DotMatrix
                src={`${BASE}/brand/cv-combinedmark-green.svg`}
                cell={4}
                threshold={0.08}
                gamma={0.6}
                intensity={1}
                radius={90}
                push={18}
              />
            </div>
            <p className="sr-only">CoreValley</p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="cv-label mb-5 text-[10px]">{group.heading}</h2>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {"plain" in link && link.plain ? (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    ) : "external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`${linkClass} inline-flex items-center gap-1.5`}
                      >
                        {link.label}
                        <Icon
                          name="arrow-right"
                          size={11}
                          className="-rotate-45 text-ink-600"
                        />
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule-fade mt-16" />

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11.5px] text-ink-500">
            © {new Date().getUTCFullYear()} CoreValley AI Pvt. Ltd. · Kathmandu,
            Nepal
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[11.5px] text-ink-500 transition-colors duration-normal hover:text-ink-200"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="mailto:info@corevalley.ai"
              className="font-mono text-[11.5px] text-ink-500 transition-colors duration-normal hover:text-ink-200"
            >
              info@corevalley.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
