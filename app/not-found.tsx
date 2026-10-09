import Link from "next/link";
import { ButtonLink, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { SiteHeader } from "@/components/layout/site-header";
import { DotTerrain } from "@/components/marketing/dot-terrain";
import { docsHref } from "@/lib/docs/href";
import { DOCS_URL } from "@/lib/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/* Old addresses land here, and are forwarded before anything renders.
   GitHub Pages serves this page as 404.html for every unknown path, so this
   runs for all of them:
   - /redesigned-portal/… (the site's preview period) → the same page at the root;
   - /docs/… (the docs before they moved) → the same page on the docs host. */
const LEGACY_REDIRECT = `(function(){var p=location.pathname,q=location.search+location.hash,b="/redesigned-portal";if(p===b||p.indexOf(b+"/")===0){location.replace((p.slice(b.length)||"/")+q);return}if(p==="/docs"||p.indexOf("/docs/")===0)location.replace(${JSON.stringify(DOCS_URL)}+(p.slice(5)||"/")+q)})();`;

/* Where the visitor most likely meant to go, in that order. */
const EXITS: { href: string; label: string; meta: string; icon: IconName }[] = [
  { href: "/products", label: "Products", meta: "gpu pods · notebooks · endpoints", icon: "slice" },
  { href: "/pricing", label: "Pricing", meta: "billed per second, in rupees", icon: "cost" },
  { href: docsHref(), label: "Documentation", meta: "guides · platform · billing", icon: "docs" },
  { href: "/contact", label: "Get early access", meta: "h200 available now", icon: "send" },
];

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LEGACY_REDIRECT }} />
      <SiteHeader />

      <main id="main" tabIndex={-1} className="shell py-2 focus:outline-none md:py-3">
        <div className="cv-dark surface-dark grain flex min-h-[calc(100dvh-1.5rem)] flex-col">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-60">
              <DotTerrain theme="dark" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 to-zinc-950/90" />
          </div>

          <div className="mx-auto flex w-full max-w-[52rem] flex-1 flex-col items-center justify-center px-5 pt-32 pb-16 text-center">
            <p className="nf-code nums text-[clamp(5rem,16vw,10rem)] leading-none font-bold tracking-[-0.07em]">
              404
            </p>

            <h1 className="display mt-6 text-[clamp(2rem,5vw,3.4rem)] text-white">
              This trail goes off the map.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[clamp(1rem,1.5vw,1.15rem)] leading-relaxed font-light text-white/60">
              This page isn&rsquo;t here. It may have moved, or the link that
              brought you here is out of date. One of these will get you back
              on track.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
                Back to home
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Get early access
              </ButtonLink>
            </div>

            <nav aria-label="Popular pages" className="mt-14 grid w-full gap-3 sm:grid-cols-2">
              {EXITS.map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className="group glass flex items-center gap-4 rounded-3xl px-5 py-4 text-left transition-colors duration-300 hover:bg-white/10"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/5">
                    <Icon name={e.icon} size={18} className="text-hydro" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold tracking-tight text-white">{e.label}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-white/50">{e.meta}</span>
                  </span>
                  <Icon
                    name="arrow-right"
                    size={15}
                    className="shrink-0 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-hydro"
                  />
                </Link>
              ))}
            </nav>

            <p className="mt-10 text-[12.5px] text-white/45">
              Error 404 · page not found ·{" "}
              <a href="mailto:info@corevalley.ai" className="text-hydro underline-offset-4 hover:underline">
                info@corevalley.ai
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
