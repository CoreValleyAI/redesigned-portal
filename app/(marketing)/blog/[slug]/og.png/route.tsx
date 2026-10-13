/**
 * A post's link-preview image (S14): its own contour print, in its
 * category's tone, behind its title, rendered to a 1200 × 630 PNG at build
 * time. Used when the post has no image of its own (SEO image or cover;
 * app/(marketing)/blog/[slug]/page.tsx decides).
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { contourArt } from "@/lib/art/contours";
import { NONE, livePosts, paramsOrPlaceholder, postBySlug } from "@/lib/content/posts";
import { toneFor } from "@/lib/content/tone";

export const dynamic = "force-static";

export function generateStaticParams() {
  return paramsOrPlaceholder(
    livePosts().map((p) => ({ slug: p.slug })),
    "slug",
  );
}

/* Night Valley, as hex (app/styles/tokens.css, dark). */
const NIGHT = { bg: "#0a0f14", ink: "#eff2f5", ink2: "#b3b8be", ink3: "#90969c" };
const TONE = { hydro: "#59ec85", "glow-2": "#65dfed", "glow-3": "#9b79ee" } as const;

const font = (weight: 400 | 600) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = slug === NONE ? undefined : postBySlug(slug);
  if (!post) return new Response("Not found", { status: 404 });

  const art = contourArt(post.slug);
  const accent = TONE[toneFor(post.categoryInfo)];
  const paths = art.levels
    .map((l, i) =>
      i === art.accent
        ? `<path d="${l.d}" fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`
        : `<path d="${l.d}" fill="none" stroke="${NIGHT.ink3}" stroke-width="0.8" stroke-linecap="round" opacity="${(0.2 + l.t * 0.45).toFixed(2)}"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" width="1200" height="750">${paths}</svg>`;
  const [regular, semibold] = await Promise.all([font(400), font(600)]);

  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: NIGHT.bg }}>
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`}
        width={1200}
        height={750}
        alt=""
        style={{ position: "absolute", top: -60, left: 0 }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          background: `linear-gradient(90deg, ${NIGHT.bg} 0%, rgba(10,15,20,0.88) 46%, rgba(10,15,20,0.25) 100%)`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", padding: "76px 80px", width: 860, gap: 22 }}>
        <div style={{ fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: NIGHT.ink3 }}>
          {`CoreValley blog${post.categoryInfo ? ` · ${post.categoryInfo.name}` : ""}`}
        </div>
        <div style={{ fontSize: 62, fontWeight: 600, lineHeight: 1.06, letterSpacing: -1.8, color: NIGHT.ink }}>
          {post.title}
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.4, color: NIGHT.ink2 }}>{post.excerpt}</div>
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 52, fontSize: 19, letterSpacing: 3, color: accent }}>
        COREVALLEY.AI
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
