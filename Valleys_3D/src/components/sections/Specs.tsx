/**
 * The infrastructure, section by section: the GPUs on the peaks, the river
 * that carries their data, and how a team climbs from a slice to a rack.
 */
import { motion } from "framer-motion";
import { GPUS, RIVER_METRICS, SCALE_STEPS } from "../../lib/content";
import { Card, CountUp, Eyebrow, IconTile, Lede, rise, Stagger, Title } from "../ui/primitives";
import { IconChip, IconFabric, IconFlow, IconPin, IconPrompt, IconSlice } from "../ui/icons";
import { Station } from "./Station";

export function Compute() {
  return (
    <Station id="compute" side="left">
      <Stagger>
        <Eyebrow index="01">Compute</Eyebrow>
        <Title>
          Two kinds of <span className="accent-text">summit.</span>
        </Title>
        <Lede>
          Every node on the ridgeline is a GPU. Hopper for the largest models, Blackwell for inference and visual AI,
          both billed by the second.
        </Lede>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {GPUS.map((g) => {
            const [mem, ...rest] = g.specs;
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow text-[10px]">{g.arch}</p>
                    <h3 className="mt-2 text-[16px] leading-tight font-semibold tracking-[-0.02em]">{g.name}</h3>
                  </div>
                  <IconTile>
                    <IconChip size={16} />
                  </IconTile>
                </div>
                {mem ? (
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="metric text-[40px] leading-none text-fg">{mem.v.split(" ")[0]}</span>
                    <span className="text-[13px] text-fg-3">
                      {mem.v.split(" ")[1]} {mem.sub}
                    </span>
                  </p>
                ) : null}
                <dl className="mt-5 grid grid-cols-3 border-t border-line pt-4">
                  {rest.map((s, i) => (
                    <div key={s.k} className={i ? "border-l border-line pl-3" : "pr-3"}>
                      <dt className="text-[10.5px] text-fg-3">{s.k}</dt>
                      <dd className="metric mt-1 text-[14px] text-fg">{s.v}</dd>
                      <dd className="mt-0.5 text-[10.5px] leading-tight text-fg-4">{s.sub}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-center gap-2 border-t border-line pt-3.5 text-[12px] text-fg-2">
                  <IconSlice size={14} className="text-accent" />
                  {g.mig}
                </p>
              </Card>
            );
          })}
        </div>
        <motion.p variants={rise} className="mt-3.5 text-[11px] text-fg-4">
          Datasheet figures from NVIDIA. H200 tensor throughput is quoted with sparsity.
        </motion.p>
      </Stagger>
    </Station>
  );
}

const RIVER_ICONS = [IconFabric, IconFabric, IconFlow, IconPin] as const;

export function River() {
  return (
    <Station id="river" side="right">
      <Stagger>
        <Eyebrow index="02">The river of data</Eyebrow>
        <Title>
          The river is the <span className="accent-text">throughput.</span>
        </Title>
        <Lede>
          Down in the valley, every lane is a link and every pulse a packet. Memory bandwidth on the card, NVLink between
          H200s, InfiniBand between nodes, and storage that never replicates your data out of the country.
        </Lede>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {RIVER_METRICS.map((m, i) => {
            const Icon = RIVER_ICONS[i] ?? IconFlow;
            return (
              <Card key={m.label} className="p-5">
                <Icon size={16} className="text-accent" />
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="metric text-[clamp(1.7rem,2.6vw,2.4rem)] leading-none text-fg">
                    {m.text ?? <CountUp value={m.value} decimals={m.decimals} />}
                  </span>
                  {m.unit ? <span className="text-[13px] text-fg-3">{m.unit}</span> : null}
                </p>
                <p className="mt-2 text-[12.5px] text-fg-3">{m.label}</p>
              </Card>
            );
          })}
        </div>
      </Stagger>
    </Station>
  );
}

export function Scale() {
  return (
    <Station id="scale" side="left">
      <Stagger>
        <Eyebrow index="03">Scale</Eyebrow>
        <Title>
          From a slice <span className="accent-text">to the rack.</span>
        </Title>
        <Lede>One image, one volume, one API key, from a MIG partition to dedicated nodes.</Lede>
        <div className="relative mt-8 pl-6">
          <span aria-hidden="true" className="absolute top-3 bottom-3 left-[5px] w-px bg-gradient-to-b from-accent via-line-2 to-accent-2" />
          <ol className="space-y-2.5">
          {SCALE_STEPS.map((s) => (
            <motion.li key={s.n} variants={rise} className="relative list-none">
              <span aria-hidden="true" className="absolute top-5 -left-6 size-[11px] rounded-full border border-line-2 bg-bg">
                <span className="absolute inset-[3px] rounded-full bg-accent" />
              </span>
              <Card className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[15.5px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <span className="metric text-[11px] text-fg-4">{s.n}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-3">{s.body}</p>
                <p
                  className="mt-3 flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-lg border border-line px-2.5 py-2 font-mono text-[11.5px] whitespace-nowrap text-fg-2"
                  style={{ background: "var(--code)" }}
                >
                  <IconPrompt size={14} className="shrink-0 text-accent" />
                  {s.cmd}
                </p>
              </Card>
            </motion.li>
          ))}
          </ol>
        </div>
      </Stagger>
    </Station>
  );
}
