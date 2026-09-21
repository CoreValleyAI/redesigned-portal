import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import { LogoLockup } from "@/components/layout/logo";
import { docsUrl } from "@/lib/docs";

export const metadata = {
  title: "Page not found",
};

/* Three routes out, in order of how likely each is to be what the visitor
   wanted. A 404 whose only exit is "back to home" makes the visitor do the
   navigation again by hand — the whole point of this page is to guess. */
const EXITS = [
  { href: "/products", label: "Products", meta: "pods · notebooks · endpoints" },
  { href: "/pricing", label: "Pricing", meta: "npr rates, per second" },
  /* Docs is the MkDocs site, not a Next route: plain anchor, full load. */
  {
    href: docsUrl(),
    label: "Documentation",
    meta: "quickstart · platform · billing",
    plain: true,
  },
] as const;

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-20">
      <LogoLockup size={20} />

      {/* The code, set as data rather than as decoration — this page is a
          status report, and the status is the one concrete thing on it. */}
      <p className="cv-label mt-14">error · 404</p>

      <h1 className="display mt-4 text-[clamp(2rem,7vw,3rem)]">
        That page isn&rsquo;t here.
      </h1>
      <p className="mt-5 leading-relaxed text-ink-400">
        The address doesn&rsquo;t match anything we serve. It may have moved,
        or the link that sent you here may be out of date.
      </p>

      <ul className="mt-10 flex flex-col">
        {EXITS.map((e) => {
          const Anchor = "plain" in e && e.plain ? "a" : Link;
          return (
            <li key={e.href}>
              <Anchor
                href={e.href}
                className="group flex items-center justify-between gap-4 border-t border-line-subtle py-4 transition-colors duration-normal hover:border-line-strong"
              >
              <span>
                <span className="block text-ink-100 transition-colors duration-normal">
                  {e.label}
                </span>
                <span className="mt-0.5 block font-mono text-[11.5px] tracking-wide text-ink-600">
                  {e.meta}
                </span>
              </span>
              <Icon
                name="arrow-right"
                size={15}
                className="text-ink-600 transition-transform duration-normal ease-out group-hover:translate-x-1 group-hover:text-ink-200"
              />
              </Anchor>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/">
          <Button variant="primary">Back to home</Button>
        </Link>
        <Link href="/contact">
          <Button variant="secondary">Contact us</Button>
        </Link>
      </div>
    </main>
  );
}
