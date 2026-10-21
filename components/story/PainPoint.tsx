"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { Reveal, Section } from "./primitives";

export function PainPoint() {
  const reduce = useReducedMotion();
  return (
    <Section id="pain" eyebrow="The pain point" title={<>One index. Many audiences. <span className="text-slate-400">Rules decide who sees what.</span></>}>
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <motion.div
              initial={reduce ? false : { x: -80, opacity: 0 }}
              whileInView={reduce ? undefined : { x: [-80, 0, 0, -6, 6, -4, 0], opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.8, times: [0, 0.4, 0.7, 0.76, 0.82, 0.88, 1], ease: EASE }}
              className="relative w-40 shrink-0 rounded-xl border border-white/15 bg-slate-950 p-3 sm:w-52"
            >
              <p className="text-[11px] text-slate-500">Gmail · Priya</p>
              <p className="mt-1 text-sm font-medium">Charity fun run sign-ups</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                <mark>Pay</mark> the $25 registration, all <mark>money</mark> goes to the food bank.
              </p>
              <motion.span
                initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -18 }}
                whileInView={{ scale: 1, opacity: 1, rotate: -12 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: reduce ? 0 : 1.1, ease: EASE }}
                className="absolute -right-3 -top-3 rounded-md border-2 border-red-400 bg-slate-950 px-2 py-0.5 font-mono text-xs font-bold tracking-widest text-red-400"
              >
                FILTERED
              </motion.span>
            </motion.div>
            <div className="min-w-0 flex-1 rounded-xl border border-red-400/40 bg-red-400/5 p-3 sm:p-4">
              <p className="text-[11px] uppercase tracking-wider text-red-300">Compensation filter · v1</p>
              <p className="mt-1 text-sm italic text-slate-200 sm:text-base">“Anything about money or pay”</p>
              <p className="mt-2 text-xs text-slate-400">One matching chunk drops the whole document. Its owner will notice.</p>
            </div>
          </div>
          <blockquote className="mt-8 border-l-2 border-sky-400 pl-4 text-xl font-medium leading-snug sm:text-2xl">
            “Vague descriptions produce vague matches.”
            <footer className="mt-2 text-xs font-normal">
              <span className="text-slate-500">Common guidance for LLM-judged rules</span>
            </footer>
          </blockquote>
        </div>
        <Reveal delay={0.15} className="flex flex-col justify-center gap-5">
          <div className="flex items-center gap-4">
            <motion.div
              aria-hidden
              className="shrink-0 text-sky-300"
              animate={reduce ? undefined : { rotate: [0, 0, 180, 180] }}
              transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}
            >
              <svg width="34" height="40" viewBox="0 0 34 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M5 2h24M5 38h24M8 2c0 10 18 10 18 18S8 28 8 38M26 2c0 10-18 10-18 18s18 8 18 18" />
                <path d="M12 34h10l-5-5z" fill="currentColor" stroke="none" />
              </svg>
            </motion.div>
            <p className="text-lg leading-snug text-slate-200">
              Preview = <span className="text-sky-300">a full dry run per edit</span>.
            </p>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed text-slate-400">
            <li>Admins can&apos;t look at real content while writing a rule. That&apos;s the right privacy call, and it means they write blind.</li>
            <li>Checking a rule means running it over the stored corpus: an estimate, a confirmation, a background job per edit.</li>
            <li>The usual advice is “one good example beats three adjectives”, yet rule editors in this space give you nowhere to write examples.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Users of popular AI workspace tools report over-broad filters hiding harmless documents and slow preview loops while tuning rules.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
