import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { AppLink } from "@/components/system/app-link";
import { Arrow, ButtonLink } from "@/components/system/button";
import { DotGlyph, type GlyphName } from "@/components/system/dot-glyph";
import { DotText } from "@/components/system/dot-text";
import { DOCS_URL } from "@/lib/site";

export const metadata = {
  title: "Off the map",
  robots: { index: false, follow: false },
};

/* GitHub Pages serves this page as 404.html for every unknown path, so old
   addresses are forwarded from here before anything renders:
   - /redesigned-portal/… (the site's preview period) → the same page at the root;
   - /docs/… (the docs before they moved) → the same page on the docs host. */
const LEGACY_REDIRECT = `(function(){var p=location.pathname,q=location.search+location.hash,b="/redesigned-portal";if(p===b||p.indexOf(b+"/")===0){location.replace((p.slice(b.length)||"/")+q);return}if(p==="/docs"||p.indexOf("/docs/")===0)location.replace(${JSON.stringify(DOCS_URL)}+(p.slice(5)||"/")+q)})();`;

const EXITS: { href: string; label: string; meta: string; glyph: GlyphName }[] = [
  { href: "/products", label: "Products", meta: "Six ways to run", glyph: "platform" },
  { href: "/pricing", label: "Pricing", meta: "Billed by the second, in rupees", glyph: "pricing" },
  { href: DOCS_URL, label: "Documentation", meta: "Guides and references", glyph: "docs" },
  { href: "/contact", label: "Contact", meta: "Request access", glyph: "contact" },
];

export default function NotFound() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LEGACY_REDIRECT }} />
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <section className="container-page flex flex-col items-center pt-[calc(var(--header-h)+clamp(3rem,10vw,8rem))] pb-[var(--section-y)] text-center">
            <DotText text="404" label="404" className="w-[min(22rem,70vw)] text-hydro" />
            <h1 className="type-display-2 mt-12 max-w-[16ch]">This trail goes off the map.</h1>
            <p className="type-lead mt-5 max-w-[34rem] text-ink-2">
              The page isn&apos;t here. It may have moved, or the link is out of date. One of these will get you back on
              the path.
            </p>
            <div className="mt-9">
              <ButtonLink href="/" size="lg" transitionTypes={["page-up"]}>
                Back to the valley
              </ButtonLink>
            </div>
            <nav aria-label="Popular pages" className="mt-14 grid w-full max-w-[48rem] gap-3 text-left sm:grid-cols-2">
              {EXITS.map((e) => (
                <AppLink
                  key={e.href}
                  href={e.href}
                  className="group flex items-center gap-4 rounded-card border border-line bg-bg-raised p-4 transition-[border-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <DotGlyph name={e.glyph} className="size-8" />
                  <span className="flex flex-1 flex-col">
                    <span className="type-body font-semibold text-ink">{e.label}</span>
                    <span className="type-small text-ink-3">{e.meta}</span>
                  </span>
                  <Arrow className="text-ink-3 group-hover:translate-x-1 group-hover:text-ink" />
                </AppLink>
              ))}
            </nav>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
