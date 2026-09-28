/**
 * The interface kit: pointer-lit cards, staggered reveals, section headers,
 * count-ups and buttons. Framer Motion drives every entrance; under reduced
 * motion things simply appear.
 */
import * as React from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { IconArrow, IconArrowUpRight } from "./icons";

const EASE = [0.16, 1, 0.3, 1] as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
};

/** Children marked with `variants={rise}` enter one after another. */
export function Stagger({
  children,
  className,
  delay = 0,
  step = 0.07,
  amount = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  step?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ amount, once: false }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: step, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

/** A frosted card whose border and face light up under the pointer. */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div variants={rise} onPointerMove={onMove} className={`card ${className}`} data-ui>
      {children}
    </motion.div>
  );
}

/** A 28px square that frames a micro-icon. */
export function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line-2 bg-bg/40 text-accent">
      {children}
    </span>
  );
}

/** "02 — Compute": index in accent, label muted. */
export function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <motion.p variants={rise} className="eyebrow flex items-center gap-3">
      <span className="text-accent">{index}</span>
      <span className="h-px w-6 bg-line-2" />
      {children}
    </motion.p>
  );
}

export function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2 variants={rise} className={`display mt-5 text-[clamp(2.1rem,4.2vw,3.9rem)] ${className}`}>
      {children}
    </motion.h2>
  );
}

export function Lede({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.p variants={rise} className={`mt-5 max-w-[46ch] text-[15.5px] leading-[1.65] text-fg-2 ${className}`}>
      {children}
    </motion.p>
  );
}

/** A number that counts up when it scrolls into view. */
export function CountUp({ value, decimals = 0, duration = 1.6 }: { value: number; decimals?: number; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduced = useReducedMotion();
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (!inView || reduced) {
      el.textContent = fmt(inView || reduced ? value : 0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / (duration * 1000));
      el.textContent = fmt(value * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value, decimals, duration]);
  return <span ref={ref}>0</span>;
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} data-ui className="btn btn-primary group">
      {children}
      <IconArrow size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

export function GhostLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="btn btn-ghost" data-ui>
        {children}
      </button>
    );
  return (
    <a href={href} className="btn btn-ghost group" data-ui>
      {children}
      <IconArrowUpRight size={15} className="text-fg-3 transition-colors group-hover:text-fg" />
    </a>
  );
}
