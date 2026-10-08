import { Card, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import type { IconName } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/availability";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";

export const metadata = pageMetadata({
  title: "Get Early Access — NVIDIA H200 GPUs in Nepal",
  description:
    "Enterprise early access to NVIDIA H200 GPUs in a hydro-powered Kathmandu datacenter. Tell us the workload and we reply within one working day with a capacity plan and a firm NPR quote.",
  path: "/contact",
});

const DETAILS: { icon: IconName; title: string; body: React.ReactNode }[] = [
  {
    icon: "send",
    title: "Email",
    body: (
      <a
        href="mailto:info@corevalley.ai"
        className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
      >
        info@corevalley.ai
      </a>
    ),
  },
  {
    icon: "location",
    title: "Location",
    body: "Kathmandu Valley, Nepal · np-ktm-1",
  },
  {
    icon: "health",
    title: "Support hours",
    body: "Nepal Standard Time (UTC+5:45). Technical questions welcome.",
  },
  {
    icon: "cost",
    title: "Payment rails",
    body: "eSewa, Khalti, bank transfer or a corporate invoice on net terms — all in NPR.",
  },
];

const FAQ = [
  {
    q: "Who can get access today?",
    a: "Enterprises, on NVIDIA H200. The RTX PRO 6000 Blackwell is coming soon, and so is access for more teams. Ask now and we will tell you first.",
  },
  {
    q: "What should I include?",
    a: "The model and its size, roughly how much data, the GPU hours you expect each month, and whether you need pods, notebooks, an API for a model or dedicated servers. A rough guess is fine.",
  },
  {
    q: "How quickly will I hear back?",
    a: "Within one working day, with a capacity plan and a firm price in NPR. Once you accept it and your account is set up, you launch on H200 and pay by the second.",
  },
  {
    q: "Do you support universities?",
    a: "Yes. Access for universities and labs is coming soon, with JupyterHub built for teaching. Join the list now and we will be in touch when it opens.",
  },
  {
    q: "How will I pay?",
    a: "In Nepali rupees, metered by the second with a 60-second minimum. Pay by eSewa, Khalti, bank transfer or a corporate invoice on net terms.",
  },
  {
    q: "Can data stay in Nepal?",
    a: "Yes — that is the point. Compute and storage are in our Kathmandu datacenter, nothing is copied abroad, and regulated projects block all outbound traffic by default. This form is the exception: it travels through FormSubmit, so keep confidential details for a secure channel.",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <PageHero
        eyebrow="Get early access"
        title="Tell us what you want to run."
        lead={`${EARLY_ACCESS.line} We reply ${EARLY_ACCESS.replyTime} with a capacity plan and a firm rupee quote.`}
      >
        <p className="mt-7 flex items-center gap-3 font-mono text-[11.5px] tracking-label text-ink-300 uppercase">
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-hydro" />
          <span>
            <span className="text-hydro light:text-hydro-dark">{EARLY_ACCESS.pill}</span>
            <span className="hidden sm:inline"> · enterprise early access</span>
          </span>
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-start lg:gap-8">
          {/* The form leads on a phone; on a wide screen it takes the right
              column and the ways to reach us sit beside it. */}
          <div className="order-1 lg:order-2">
            <ContactForm />
          </div>

          <div className="order-2 lg:order-1">
            <h2 className="text-xl font-semibold tracking-tight text-ink-100">
              Reach us directly
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
              Prefer email? Write to us. We answer in Nepal business hours,
              usually {EARLY_ACCESS.replyTime}.
            </p>

            <div className="mt-6 space-y-3">
              {DETAILS.map((d) => (
                <Card key={d.title} surface="solid" padding={18}>
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 shrink-0">
                      <Icon name={d.icon} size={18} className="text-ink-200" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-ink-100">
                        {d.title}
                      </h3>
                      <div className="mt-1 text-[14px] leading-relaxed text-ink-400">
                        {d.body}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Quick answers" title="Before you write." alt>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((f) => (
            <Card key={f.q} surface="solid" padding={22} className="h-full">
              <h3 className="text-[15px] font-semibold tracking-tight text-ink-100">
                {f.q}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
                {f.a}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
