import Link from "next/link";
import { Icon } from "@/components/ui";
import { DotMatrix } from "@/components/marketing/dot-matrix";
import { docsHref } from "@/lib/docs/href";
import { SHOW_STATUS, STATUS_URL } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Four columns of links is a link farm. Three groups, each capped at six
   entries, plus a legal row — every path here resolves to a page with real
   content. The docs reference pages (API reference, specs, billing) are
   outlines while early access runs, so the footer points at the pages that
   already answer the question: the products page's hardware table and the
   pricing page's billing explainer. */
const GROUPS = [
  {
    heading: "platform",
    links: [
      { href: "/platform", label: "Platform overview" },
      { href: "/products/gpu-pods", label: "GPU pods" },
      { href: "/products/jupyterhub", label: "JupyterHub" },
      { href: "/products/model-endpoints", label: "Model endpoints" },
      { href: "/products/dedicated", label: "Dedicated & bare metal" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "developers",
    links: [
      { href: docsHref(), label: "Documentation" },
      { href: docsHref("guides/quickstart"), label: "Getting started" },
      { href: "/products#hardware", label: "Hardware & availability" },
      { href: "/use-cases", label: "Use cases" },
    ],
  },
  {
    heading: "company",
    links: [
      { href: "/company", label: "About CoreValley" },
      { href: "/contact", label: "Contact" },
      // Hidden until status monitoring is integrated (SHOW_STATUS in lib/site.ts).
      ...(SHOW_STATUS ? [{ href: STATUS_URL, label: "System status", external: true }] : []),
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

/* min-h-8: every row is a 32px target on a phone, not an 18px line of text. */
const linkClass =
  "inline-flex min-h-8 items-center rounded-sm text-[13.5px] text-ink-400 transition-colors duration-normal ease-standard hover:text-ink-100";

const smallLinkClass =
  "inline-flex min-h-8 items-center rounded-sm font-mono text-[11.5px] text-ink-500 transition-colors duration-normal ease-standard hover:text-ink-200";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 px-4 pb-6 md:px-8">
      {/* The whole footer is one liquid-glass slab, floated off the page
          edge, clear enough that the floor reads through it. */}
      <div className="lg lg-liquid lg-clear relative mx-auto max-w-page-xl overflow-hidden rounded-xl px-6 pt-12 pb-8 md:px-12 md:pt-14 md:pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-12">
          <div>
            {/* The mark, as the brand's dot matrix, in place of the flat
                lockup. It assembles out of scattered dots the first time it
                scrolls into view and afterwards parts around the pointer and
                lights where it passes. The official combined lockup is the
                sampling source, so the proportions are the brandbook's.
                aria-hidden and inert to the pointer; the accessible name is
                the copy beside it. Smaller on a phone, where it would
                otherwise push the links a full screen down. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative h-[190px] w-[190px] md:h-[300px] md:w-[300px]"
            >
              <DotMatrix
                src={`${BASE}/brand/cv-combinedmark-green.svg`}
                cell={4}
                threshold={0.08}
                gamma={0.6}
                intensity={1}
                radius={90}
                push={18}
                bleed={90}
                replay
              />
            </div>
            <p className="sr-only">CoreValley</p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="cv-label mb-3 text-[10px] md:mb-4">{group.heading}</h2>
              <ul className="flex flex-col gap-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`${linkClass} gap-1.5`}
                      >
                        {link.label}
                        <Icon
                          name="arrow-right"
                          size={11}
                          className="-rotate-45 text-ink-600"
                        />
                        <span className="sr-only">(opens in a new tab)</span>
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

        <hr className="rule-fade mt-12 md:mt-16" />

        <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
          <p className="font-mono text-[11.5px] text-ink-500">
            © {new Date().getUTCFullYear()} CoreValley AI Pvt. Ltd. · Kathmandu,
            Nepal
          </p>

          <div className="flex flex-wrap items-center gap-x-5">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className={smallLinkClass}>
                {l.label}
              </Link>
            ))}
            {/* RFC 9116 contact file: a plain anchor, since it is a static
                file rather than a route. */}
            <a href={`${BASE}/.well-known/security.txt`} className={smallLinkClass}>
              Security
            </a>
            <a href="mailto:info@corevalley.ai" className={smallLinkClass}>
              info@corevalley.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
