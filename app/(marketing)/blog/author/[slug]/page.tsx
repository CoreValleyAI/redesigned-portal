import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/blog-listing";
import { JsonLd, personJsonLd } from "@/components/seo/json-ld";
import { mediaSrc } from "@/lib/content/format";
import { NONE, authorsInUse, paramsOrPlaceholder, postsByAuthor } from "@/lib/content/posts";
import { loadContent } from "@/lib/content/source";
import { key } from "@/lib/content/types";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return paramsOrPlaceholder(authorsInUse().map((a) => ({ slug: a.slug })), "slug");
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const a = authorsInUse().find((x) => x.slug === slug);
  if (!a || slug === NONE) return {};
  return pageMetadata({
    title: `${a.name} — Blog`,
    description: a.bio ?? `Posts by ${a.name} on the CoreValley blog.`,
    path: `/blog/author/${slug}`,
  });
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const a = authorsInUse().find((x) => x.slug === slug);
  if (!a) notFound();
  const { media } = loadContent();
  const avatar = mediaSrc(a.avatar !== undefined ? media.get(key(a.avatar)) : undefined, "thumb");
  const links = Object.values(a.links).filter((l): l is string => Boolean(l));
  return (
    <>
      <JsonLd data={personJsonLd({ path: `/blog/author/${slug}`, name: a.name, jobTitle: a.title, sameAs: links })} />
      <BlogListing eyebrow={a.title ?? "Author"} title={a.name} lead={a.bio} posts={postsByAuthor(slug)} media={media}>
        {avatar ? (
          <img
            src={avatar.src}
            alt=""
            width={64}
            height={64}
            className="mt-8 size-16 rounded-full border border-white/15 object-cover"
          />
        ) : null}
      </BlogListing>
    </>
  );
}
