"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE, motionTokens } from "@/lib/motion";
import { Reveal, Section } from "./primitives";

const REASONS = [
  "Vague descriptions produce vague matches, and today’s rule editors have no place to test a description before it runs on real data.",
  "It keeps the guarantee that nobody sees anyone's private content: examples are written by the admin.",
  "New sharing rules start with auto-share off. Admins need evidence, not a hunch, before they turn it on.",
];

export function Decision() {
  const reduce = useReducedMotion();
  return (
    <Section id="decision" eyebrow="The decision" title={<>Two ideas. <span className="text-sky-300">One shipped.</span></>}>
      <div className="grid gap-5 md:grid-cols-2">
        <Reveal className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 opacity-60">
          <p className="text-xs uppercase tracking-wider text-slate-500">Option A</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-300">Query Provenance Inspector</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Visualize why a source was missing from an answer. Useful, but it helps developers debug retrieval, while the access decisions that
            break trust are owned by admins writing rules.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="relative rounded-2xl border border-sky-400/50 bg-sky-400/[0.05] p-6">
          <motion.span
            aria-hidden
            initial={reduce ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.4 }}
            className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-sky-400 text-lg font-bold text-slate-950"
          >
            ✓
          </motion.span>
          <p className="text-xs uppercase tracking-wider text-sky-300">Option B</p>
          <h3 className="mt-2 text-xl font-semibold">Rule Test Bench</h3>
          <ul className="mt-4 space-y-3">
            {REASONS.map((r, i) => (
              <motion.li
                key={r}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: motionTokens.duration.slow, ease: EASE, delay: 0.3 + i * 0.25 }}
                className="flex gap-3 text-sm leading-relaxed text-slate-200"
              >
                <span className="font-mono text-sky-300">0{i + 1}</span>
                {r}
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
