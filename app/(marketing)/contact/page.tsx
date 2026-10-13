import { ValleyTime } from "@/components/chrome/valley-time";
import { Ascent } from "@/components/forms/ascent";
import { Page } from "@/components/motion/page";
import { Faq } from "@/components/system/faq";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { CONTACT } from "@/copy/en/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: CONTACT.meta.title,
  description: CONTACT.meta.description,
  path: "/contact",
});

const FAQ = [
  {
    q: "What should we include?",
    a: "What you want to run, roughly how big, for how long, and anything about your data that matters — for example that it must stay in Nepal. A sentence each is enough.",
  },
  {
    q: "How fast do you reply?",
    a: "Within one working day, from Kathmandu.",
  },
  {
    q: "What happens after?",
    a: "We check what you need against the cluster, then send a capacity plan and a firm quote in rupees. If it fits, we set you up for early access.",
  },
];

const fallbackInput = "type-body h-12 w-full rounded-card border border-line-strong/60 bg-bg px-4 text-ink";

export default function ContactPage() {
  const c = CONTACT;
  return (
    <Page>
      <section className="relative pt-[calc(var(--header-h)+clamp(2.5rem,6vw,5rem))] pb-[var(--section-y)]">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-10">
            <div className="flex max-w-[44rem] flex-col gap-5">
              <Kicker>{c.hero.kicker}</Kicker>
              <h1 className="type-display-2">{c.hero.title}</h1>
              <p className="type-lead text-ink-2">{c.hero.lead}</p>
            </div>

            <div className="nojs:hidden">
              <Ascent />
            </div>

            {/* Without scripting: one plain form to the same inbox. */}
            <form
              action={`https://formsubmit.co/${c.inbox}`}
              method="POST"
              className="hidden flex-col gap-5 rounded-panel border border-line bg-bg-raised p-6 nojs:flex md:p-10"
            >
              <input type="hidden" name="_subject" value="Request from corevalley.ai (no-script form)" />
              <input type="hidden" name="_template" value="table" />
              <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" />
              <label className="flex flex-col gap-2">
                <span className="type-kicker text-ink-3">What are you here for?</span>
                <select name="Route" className={fallbackInput}>
                  {c.routes
                    .filter((r) => r.id !== "careers")
                    .map((r) => (
                      <option key={r.id}>{r.title}</option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="type-kicker text-ink-3">Your message</span>
                <textarea name="Message" required rows={5} className={`${fallbackInput} h-auto py-3`} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="type-kicker text-ink-3">Name</span>
                  <input name="Name" required autoComplete="name" className={fallbackInput} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="type-kicker text-ink-3">Work email</span>
                  <input name="Email" type="email" required autoComplete="email" className={fallbackInput} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="type-kicker text-ink-3">Organisation</span>
                  <input name="Organisation" autoComplete="organization" className={fallbackInput} />
                </label>
              </div>
              <button
                type="submit"
                className="type-body h-12 self-start rounded-pill bg-hydro px-6 font-medium text-on-hydro"
              >
                Send request
              </button>
              <p className="type-caption text-ink-3">{c.disclosure}</p>
            </form>
          </div>

          {/* Side rail: the human details. */}
          <aside aria-label="Other ways to reach us" className="flex flex-col gap-8 lg:pt-[12.5rem]">
            <div className="flex flex-col gap-2 border-t border-line pt-5">
              <p className="type-kicker text-ink-3">Email</p>
              <a
                href={`mailto:${c.inbox}`}
                className="type-title-3 underline decoration-line-strong underline-offset-4 hover:decoration-hydro"
              >
                {c.inbox}
              </a>
            </div>
            <div className="flex flex-col gap-2 border-t border-line pt-5">
              <p className="type-kicker text-ink-3">Time in Kathmandu</p>
              <ValleyTime />
            </div>
            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <p className="type-kicker text-ink-3">What happens next</p>
              <ol className="flex flex-col gap-2.5">
                {c.done.next.map((s, i) => (
                  <li key={s} className="type-small flex gap-3 text-ink-2">
                    <span className="type-kicker mt-0.5 text-hydro-ink light:text-hydro">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <SectionHead id="faq-title" kicker="Questions" title="Before you write." size="title-2" />
          <Faq items={FAQ} />
        </div>
      </section>
    </Page>
  );
}
