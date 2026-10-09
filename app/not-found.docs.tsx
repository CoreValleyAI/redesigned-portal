import Link from "next/link";
import { ButtonLink, Icon } from "@/components/ui";
import { getNav } from "@/lib/docs/content";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/* The docs site's 404 (exported as 404.html), inside the docs shell, so the
   sidebar and search are right there. Lists every page as a way back. */
export default function DocsNotFound() {
  const pages = getNav().flatMap((g) => g.items);
  return (
    <article className="min-w-0">
      <p className="cv-label">404</p>
      <h1 className="mt-3 display text-[clamp(1.8rem,3.6vw,2.3rem)]">This page isn&rsquo;t in the docs.</h1>
      <p className="mt-4 max-w-[52ch] text-ink-300">
        It may have moved, or the link is out of date. Search the docs, or pick a page below.
      </p>
      <ul className="mt-8 grid gap-1.5 sm:grid-cols-2">
        {pages.map((p) => (
          <li key={p.url}>
            <Link
              href={p.url}
              className="flex items-center justify-between rounded-md border border-line px-3.5 py-2.5 text-[14px] text-ink-200 transition-colors duration-fast hover:border-line-strong hover:text-ink-100"
            >
              {p.title}
              <Icon name="arrow-right" size={14} className="text-ink-600" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <ButtonLink href="/" variant="primary" iconRight={<Icon name="arrow-right" size={16} />}>
          Documentation home
        </ButtonLink>
      </div>
    </article>
  );
}
