"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { Counter, Reveal, Section } from "./primitives";

export interface ImpactNumbers {
  precisionBefore: number;
  precisionAfter: number;
  fpBefore: number;
  fpAfter: number;
  rescoreMs: number;
  readinessBefore: string;
  readinessAfter: string;
}

export function Impact({ n }: { n: ImpactNumbers }) {
  const reduce = useReducedMotion();
  return (
    <Section id="impact" eyebrow="Expected impact" title={<>Trusted rules in minutes, <span className="text-sky-300">not dry runs</span>.</>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Precision, Compensation filter</p>
          <p className="mt-2 font-mono text-5xl font-semibold">
            <Counter from={n.precisionBefore} to={n.precisionAfter} suffix="%" testId="impact-precision" />
          </p>
          <p className="mt-1 text-xs text-slate-500">from {n.precisionBefore}% on v1</p>
        </Reveal>
        <Reveal delay={0.08} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">False positives</p>
          <p className="mt-2 font-mono text-5xl font-semibold">
            <Counter from={n.fpBefore} to={n.fpAfter} testId="impact-fp" />
          </p>
          <p className="mt-1 text-xs text-slate-500">from {n.fpBefore} (fun run, Figma invoice)</p>
        </Reveal>
        <Reveal delay={0.16} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Re-score time</p>
          <p className="mt-2 font-mono text-5xl font-semibold">
            &lt;<Counter from={0} to={Math.max(1, Math.ceil(n.rescoreMs))} />
            <span className="text-2xl">ms</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">vs a corpus dry run per edit</p>
        </Reveal>
        <Reveal delay={0.24} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Customer calls sharing rule</p>
          <div className="relative mt-3 h-16" style={{ perspective: 600 }}>
            <motion.div
              className="absolute inset-0 grid place-items-center rounded-xl bg-red-400/10 text-sm text-red-300 ring-1 ring-red-400/40"
              initial={reduce ? { rotateX: 90, opacity: 0 } : { rotateX: 0, opacity: 1 }}
              whileInView={{ rotateX: 90, opacity: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 1.2, ease: EASE }}
            >
              {n.readinessBefore}
            </motion.div>
            <motion.div
              className="absolute inset-0 grid place-items-center rounded-xl bg-emerald-400/15 px-2 text-center text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/40"
              initial={reduce ? { rotateX: 0, opacity: 1 } : { rotateX: -90, opacity: 0 }}
              whileInView={{ rotateX: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 1.7, ease: EASE }}
              data-testid="impact-readiness"
            >
              {n.readinessAfter}
            </motion.div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.1} className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ["Admins", "First draft to trusted rule without a corpus dry run, and without seeing anyone's private content."],
          ["Members", "Fewer bad Inbox cards, because auto-share only turns on once precision is proven."],
          ["Platform teams", "Faster sharing-rule adoption, and a concrete answer to “how do I know the filter catches comp data?”"],
        ].map(([who, what]) => (
          <div key={who}>
            <p className="text-sm font-semibold text-sky-300">{who}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{what}</p>
          </div>
        ))}
      </Reveal>
      <Reveal delay={0.2} className="mt-12 flex flex-wrap items-center gap-4">
        <Link
          href="/settings/rules/compensation"
          className="rounded-xl bg-sky-400 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300"
        >
          Open the Test Bench →
        </Link>
        <p className="text-xs text-slate-500">
          Numbers computed live from the seed data via <code className="font-mono">lib/score.ts</code>.
        </p>
      </Reveal>
      <p className="mt-16 text-xs leading-relaxed text-slate-500">
        All documents, people and rules on this page are synthetic. The scoring, banding and audience logic are the real code under test.
      </p>
    </Section>
  );
}
