import Link from "next/link";
import { Icon } from "@/components/ui";
import { RidgelineBand } from "@/components/marketing/ridgeline-band";
import { Logo } from "./logo";

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
    heading: "developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/cli", label: "CLI reference" },
      { href: "/docs/api", label: "API reference" },
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
    <footer className="relative mt-24 overflow-hidden border-t border-line-subtle bg-carbon-900">
      {/* The dot-matrix ridgeline: the brand's signature graphic, in the place
          the design system prescribes for it — the footer band. Texture, not
          navigation: aria-hidden and inert to the pointer. */}
      <RidgelineBand height={220} opacity={0.28} />

      <div className="relative mx-auto max-w-page-xl px-5 pt-16 pb-10 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo mark="combinedmark" height={74} />
            <p className="mt-5 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-400">
              Sovereign AI compute for Nepal. Train, fine-tune and serve on
              NVIDIA GPUs hosted in Kathmandu — billed in NPR, supported in
              Nepal time.
            </p>

            {/* A named region and its state beats a badge claiming "99.9%
                uptime". Deliberately NOT a link: there is no status page yet,
                and a chip that looks clickable and goes nowhere is worse than
                one that plainly does not. It becomes a link the day
                status.corevalley.ai exists. */}
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-pill border border-line px-3 py-1.5 font-mono text-[11px] tracking-wide text-ink-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-pill bg-hydro opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-pill bg-hydro" />
              </span>
              np-ktm-1 · operational
            </p>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="cv-label mb-5 text-[10px]">{group.heading}</h2>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
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
