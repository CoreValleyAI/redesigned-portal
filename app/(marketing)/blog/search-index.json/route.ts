import { searchIndex } from "@/lib/content/posts";

export const dynamic = "force-static";

/** The blog search index, fetched by the search dialog on first open. */
export function GET() {
  return Response.json(searchIndex());
}
