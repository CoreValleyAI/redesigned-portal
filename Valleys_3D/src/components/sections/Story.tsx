/**
 * The rest of the flight: the platform under the GPUs, sovereignty at dawn,
 * and the finale, where the valley of data opens into the Kathmandu Valley.
 */
import { motion } from "framer-motion";
import { LAYERS, SITE, SOVEREIGN } from "../../lib/content";
import { Card, Eyebrow, GhostLink, IconTile, Lede, PrimaryLink, rise, Stagger, Title } from "../ui/primitives";
import { IconPin, IconRupee, IconSupport } from "../ui/icons";
import { Station } from "./Station";

export function Platform() {
  return (
    <Station id="platform" side="right">
      <Stagger step={0.05}>
        <Eyebrow index="04">Platform</Eyebrow>
        <Title>
          Nine layers you <span className="accent-text">never operate.</span>
        </Title>
        <Lede>You rent the GPU. Everything underneath it is ours to run, from the network to the invoice.</Lede>
        {/* One pane, ruled into nine cells: a system, not nine floating tiles. */}
        <Card className="mt-8 overflow-hidden p-0">
          <ol className="grid grid-cols-1 sm:grid-cols-3">
            {LAYERS.map((l, i) => (
              <li
                key={l.title}
                className={[
                  "relative px-4 py-4",
                  i > 0 ? "border-t border-line" : "",
                  i > 0 && i < 3 ? "sm:border-t-0" : "",
                  i % 3 ? "sm:border-l sm:border-line" : "",
                ].join(" ")}
              >
                <span className="metric text-[10.5px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[14px] leading-tight font-semibold tracking-[-0.015em]">{l.title}</h3>
                <p className="mt-1.5 font-mono text-[10px] leading-snug text-fg-4">{l.tags}</p>
              </li>
            ))}
          </ol>
        </Card>
      </Stagger>
    </Station>
  );
}

const ICONS = { pin: IconPin, wallet: IconRupee, support: IconSupport } as const;

export function Sovereign() {
  return (
    <Station id="sovereign" side="left">
      <Stagger>
        <Eyebrow index="05">Sovereign</Eyebrow>
        <Title>
          Nothing leaves <span className="accent-text">the valley.</span>
        </Title>
        <Lede>Your models, your data and your invoices stay under one jurisdiction: Nepal&apos;s.</Lede>
        <div className="mt-8 space-y-2.5">
          {SOVEREIGN.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <Card key={s.title} className="flex gap-4 p-5">
                <IconTile>
                  <Icon size={16} />
                </IconTile>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                    <span className="font-mono text-[10.5px] text-fg-4">{s.tag}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fg-3">{s.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Stagger>
    </Station>
  );
}

const LANDMARKS = ["Dharahara", "Swayambhunath", "Boudhanath", "Pashupatinath", "Bagmati", "Bishnumati"];

/**
 * The finale. The copy sits low so the valley fills the view above it: the
 * city grid, the temples and stupas, the rivers meeting in the south, the
 * Dharahara at the centre and the Himalaya behind.
 */
export function Finale() {
  return (
    <section id="kathmandu" data-station className="relative flex min-h-svh flex-col justify-end px-5 pt-24 pb-8 md:px-[6vw]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[48%]"
        style={{ background: "linear-gradient(to top, rgb(var(--scrim-rgb) / 0.9), rgb(var(--scrim-rgb) / 0.45) 55%, transparent)" }}
      />
      <Stagger className="grid w-full items-end gap-8 lg:grid-cols-[1.25fr_1fr]" amount={0.3}>
        <div>
          <Eyebrow index="06">Kathmandu Valley</Eyebrow>
          <Title className="text-[clamp(2.2rem,4.6vw,4.4rem)]">
            Rooted in the valley. <span className="accent-text">Scaling to infinity.</span>
          </Title>
          <Lede>
            Intelligence rooted in depth. H200 and RTX PRO 6000 Blackwell in Kathmandu, billed per second in rupees, run
            by people on your time zone.
          </Lede>
        </div>
        <div className="lg:justify-self-end lg:text-right">
          <motion.div variants={rise} className="flex flex-wrap gap-3 lg:justify-end">
            <PrimaryLink href={`${SITE}/contact/`}>Get early access</PrimaryLink>
            <GhostLink href={`${SITE}/pricing/`}>See pricing</GhostLink>
          </motion.div>
          <motion.ul variants={rise} className="mt-7 flex max-w-[420px] flex-wrap gap-x-4 gap-y-2 lg:ml-auto lg:justify-end">
            {LANDMARKS.map((l) => (
              <li key={l} className="eyebrow flex items-center gap-2 text-[10px]">
                <span className="size-1 rounded-full bg-accent" />
                {l}
              </li>
            ))}
          </motion.ul>
        </div>
      </Stagger>
      <footer className="eyebrow mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-[10px] text-fg-4">
        <span>© 2026 CoreValley AI Pvt. Ltd. · Kathmandu, Nepal</span>
        <a className="transition-colors hover:text-fg" href={SITE} data-ui>
          corevalley.ai
        </a>
      </footer>
    </section>
  );
}
