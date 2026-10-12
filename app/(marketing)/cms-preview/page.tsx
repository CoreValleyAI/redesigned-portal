import type { Metadata } from "next";
import { CmsPreview } from "@/components/content/cms-preview";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

/** Draft preview for the CMS. Not linked anywhere; disallowed in robots.txt. */
export default function CmsPreviewPage() {
  return <CmsPreview />;
}
