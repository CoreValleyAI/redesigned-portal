import Link from "next/link";
import { ButtonLink, Icon } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/availability";
import { docsHref } from "@/lib/docs/href";
import { SHOW_STATUS, siteHref, STATUS_URL } from "@/lib/site";
import { LogoLockup } from "./logo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const GROUPS = [
  {
    heading: "Platform",
    links: [
      { href: siteHref("/platform"), label: "Platform overview" },
      { href: siteHref("/products/gpu-pods"), label: "GPU pods" },
      { href: siteHref("/products/jupyterhub"), label: "JupyterHub" },
      { href: siteHref("/products/model-endpoints"), label: "Model endpoints" },
      { href: siteHref("/products/dedicated"), label: "Dedicated & bare metal" },
      { href: siteHref("/pricing"), label: "Pricing" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { href: docsHref(), label: "Documentation" },
      { href: docsHref("guides/quickstart"), label: "Getting started" },
      { href: siteHref("/products#hardware"), label: "Hardware & availability" },
      { href: siteHref("/use-cases"), label: "Use cases" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: siteHref("/company"), label: "About CoreValley" },
      { href: siteHref("/contact"), label: "Contact" },
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
  { href: siteHref("/legal/privacy"), label: "Privacy" },
  { href: siteHref("/legal/terms"), label: "Terms" },
  { href: siteHref("/legal/data-residency"), label: "Data residency" },
] as const;

const linkClass =
  "inline-flex min-h-8 items-center text-[14px] text-white/60 transition-colors duration-300 hover:text-white";

const smallLinkClass =
  "inline-flex min-h-8 items-center rounded-full px-3 text-[12.5px] text-white/50 transition-colors duration-300 hover:bg-white/10 hover:text-white";

export function SiteFooter() {
  return (
    <footer className="shell mt-3 pb-3">
      <div className="cv-dark surface-dark grain px-6 pt-14 pb-6 md:px-14 md:pt-20 md:pb-8">
        {/* The brand word, huge and nearly invisible, behind everything. */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-[3vw] -z-10 text-center text-[17vw] leading-none font-bold tracking-[-0.06em] whitespace-nowrap text-white/[0.04] select-none min-[1600px]:text-[272px]"
        >
          corevalley
        </p>

        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="label !text-white/50">Early access · {EARLY_ACCESS.pill}</p>
            <h2 className="display mt-5 max-w-[16ch] text-[clamp(2.2rem,4.4vw,3.75rem)] text-white">
              Your next training run, on{" "}
              <span className="text-hydro">Himalayan hydro.</span>
            </h2>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed font-light text-white/60">
              Tell us the model, the dataset size and the GPU hours you expect.
              We reply {EARLY_ACCESS.replyTime} with a capacity plan and a firm
              rupee price.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href={siteHref("/contact")}
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Get early access
              </ButtonLink>
              <ButtonLink href={docsHref()} variant="secondary" size="lg">
                Read the docs
              </ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {GROUPS.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="label mb-4 !text-white/40">{group.heading}</h2>
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
                          <Icon name="arrow-right" size={11} className="-rotate-45 text-white/40" />
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
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 md:mt-32 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <LogoLockup size={15} />
            <p className="text-[12.5px] text-white/45">
              © {new Date().getUTCFullYear()} CoreValley AI Pvt. Ltd. · Kathmandu, Nepal
            </p>
          </div>

          <div className="-mx-3 flex flex-wrap items-center">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className={smallLinkClass}>
                {l.label}
              </Link>
            ))}
            <a href={siteHref(`${BASE}/.well-known/security.txt`)} className={smallLinkClass}>
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
