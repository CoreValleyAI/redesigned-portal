import { motion, useReducedMotion } from "framer-motion";
import { flyTo } from "../../lib/flight";
import { SITE } from "../../lib/content";
import { GhostLink, PrimaryLink, rise, Stagger } from "../ui/primitives";
import { IconPing, IconScroll, IconSteer } from "../ui/icons";

const LINE_1 = "The GPU cloud".split(" ");
const LINE_2 = "that lives in the".split(" ");

/** Words rise out of the range one by one. */
function Word({ w, i, delay, className = "" }: { w: string; i: number; delay: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
      <motion.span
        className={`inline-block ${className}`}
        initial={reduced ? false : { y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.15, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
      >
        {w}
      </motion.span>
      {" "}
    </span>
  );
}

const SPECS: [string, string][] = [
  ["H200", "141 GB HBM3e"],
  ["RTX PRO 6000", "96 GB GDDR7"],
  ["Billing", "Per second, in NPR"],
  ["Region", "np-ktm-1, Nepal"],
];

export function Hero() {
  return (
    <section id="range" data-station className="relative flex min-h-svh items-center px-5 pt-24 pb-24 md:px-[6vw]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 70% at 25% 50%, rgb(var(--scrim-rgb) / 0.55), transparent 70%)" }}
      />
      <div className="max-w-[1040px]">
        <h1 className="display text-[clamp(2.9rem,6.4vw,6.4rem)]">
          <span className="block">
            {LINE_1.map((w, i) => (
              <Word key={i} w={w} i={i} delay={0.6} />
            ))}
          </span>
          <span className="block text-fg-3">
            {LINE_2.map((w, i) => (
              <Word key={i} w={w} i={i} delay={0.8} />
            ))}
            <Word w="valley." i={LINE_2.length} delay={0.8} className="accent-text" />
          </span>
        </h1>

        <Stagger delay={1.3} amount={0.1}>
          <motion.p variants={rise} className="mt-8 max-w-[50ch] text-[clamp(15.5px,1.2vw,18px)] leading-[1.6] text-fg-2">
            Enterprise-grade GPU infrastructure with local support, predictable NPR pricing and data that never leaves
            Nepal.
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-wrap gap-3">
            <PrimaryLink href={`${SITE}/contact/`}>Get early access</PrimaryLink>
            <GhostLink onClick={() => flyTo(1)}>Begin the flight</GhostLink>
          </motion.div>
          <motion.dl variants={rise} className="mt-14 grid max-w-[760px] grid-cols-2 border-t border-line md:grid-cols-4">
            {SPECS.map(([k, v], i) => (
              <div key={k} className={`py-4 pr-4 ${i % 2 ? "border-l border-line pl-5" : ""} ${i === 2 ? "md:border-l md:border-line md:pl-5" : ""}`}>
                <dt className="eyebrow text-[10px]">{k}</dt>
                <dd className="mt-1.5 text-[14.5px] font-medium tracking-[-0.01em] text-fg">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </Stagger>
      </div>

      <motion.div
        className="eyebrow pointer-events-none absolute inset-x-0 bottom-7 flex justify-center gap-7 text-[10.5px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
      >
        <span className="flex items-center gap-2">
          <IconScroll size={15} /> Scroll to fly
        </span>
        <span className="hidden items-center gap-2 md:flex">
          <IconSteer size={15} /> Move to steer
        </span>
        <span className="hidden items-center gap-2 md:flex">
          <IconPing size={15} /> Click to ping
        </span>
      </motion.div>
    </section>
  );
}
