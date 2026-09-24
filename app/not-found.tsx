import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { SiteHeader } from "@/components/layout/site-header";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { docsHref } from "@/lib/docs/href";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/* The site used to be previewed under /redesigned-portal/. Links from that
   period (bookmarks, open tabs, shared URLs) land here; forward them to the
   same page at the root before anything renders. GitHub Pages serves this
   page as 404.html for every unknown path, so this runs for all of them. */
const LEGACY_REDIRECT = `(function(){var p=location.pathname,b="/redesigned-portal";if(p===b||p.indexOf(b+"/")===0){location.replace((p.slice(b.length)||"/")+location.search+location.hash)}})();`;

/* Where the visitor most likely meant to go, in that order. */
const EXITS: { href: string; label: string; meta: string; icon: IconName }[] = [
  { href: "/products", label: "Products", meta: "pods · notebooks · endpoints", icon: "slice" },
  { href: "/pricing", label: "Pricing", meta: "npr rates, per second", icon: "cost" },
  { href: docsHref(), label: "Documentation", meta: "guides · platform · billing", icon: "docs" },
  { href: "/contact", label: "Contact", meta: "talk to the team in kathmandu", icon: "send" },
];

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LEGACY_REDIRECT }} />
      <SiteHeader />

      <main id="main" tabIndex={-1} className="relative isolate flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden focus:outline-none">
        {/* The same range as the homepage, behind everything. */}
        <div className="absolute inset-0 -z-10">
          <DotTerrain />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent via-bg-base/60 to-bg-base"
          />
        </div>

        <div className="hero-copy mx-auto flex w-full max-w-[52rem] flex-1 flex-col items-center justify-center px-5 py-20 text-center md:py-24">
          <p className="nf-code nums font-mono text-[clamp(5rem,16vw,10rem)] leading-none font-medium tracking-[-0.06em]">
            404
          </p>

          <h1 className="display mt-6 text-[clamp(2rem,5vw,3.4rem)] leading-[1.04] tracking-[-0.03em]">
            This trail goes off the map.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed text-ink-300">
            The page you were looking for isn&rsquo;t here. It may have moved, or
            the link that brought you here is out of date.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
                Back to home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Get early access
              </Button>
            </Link>
          </div>

          <nav aria-label="Popular pages" className="mt-14 grid w-full gap-3 sm:grid-cols-2">
            {EXITS.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="nf-exit group lg lg-hover flex items-center gap-4 rounded-xl px-5 py-4 text-left"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-carbon-600">
                  <Icon name={e.icon} size={18} weight="duotone" className="text-hydro" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold tracking-tight text-ink-100">{e.label}</span>
                  <span className="mt-0.5 block truncate font-mono text-[11.5px] tracking-wide text-ink-500">
                    {e.meta}
                  </span>
                </span>
                <Icon
                  name="arrow-right"
                  size={15}
                  className="shrink-0 text-ink-500 transition-transform duration-normal ease-out group-hover:translate-x-1 group-hover:text-hydro"
                />
              </Link>
            ))}
          </nav>

          <p className="mt-10 font-mono text-[11.5px] tracking-wide text-ink-500">
            error 404 · page not found ·{" "}
            <a href="mailto:info@corevalley.ai" className="text-hydro underline-offset-4 hover:underline">
              info@corevalley.ai
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
