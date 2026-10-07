import { IcebergDive } from "@/components/marketing/iceberg-dive";
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from "@/components/seo/json-ld";
import { PLATFORM_LAYERS } from "@/lib/platform-layers";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

const TITLE = "The Platform Under the GPU — Networking, Storage, Security, NPR Billing";
const DESCRIPTION =
  "You rent the GPU; CoreValley runs the rest. Nine layers under every NVIDIA H200 in Kathmandu, available now for enterprises (RTX PRO 6000 Blackwell coming soon): networking, storage, hydropower and cooling, scheduling, monitoring, security, data residency, NPR billing and local support.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/platform" });

export default function PlatformPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ path: "/platform", name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Platform", path: "/platform" },
          ]),
          {
            "@type": "ItemList",
            name: "The CoreValley platform layers",
            url: absoluteUrl("/platform"),
            itemListElement: PLATFORM_LAYERS.map((l, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: l.title,
              description: l.body,
            })),
          },
        ]}
      />
      <IcebergDive />
    </>
  );
}
