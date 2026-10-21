"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { Reveal, Section } from "./primitives";

function MiniGrid() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-1.5" aria-hidden>
      {[
        ["Offer letter", "TP", "text-emerald-300 ring-emerald-400/40"],
        ["Fun run", "FP→TN", "text-slate-300 ring-white/20"],
        ["Q3 planning", "TP", "text-emerald-300 ring-emerald-400/40"],
      ].map(([t, o, c], i) => (
        <div key={t} className="flex items-center justify-between rounded-md bg-white/[0.03] px-2 py-1.5 text-xs">
          <span className="text-slate-300">{t}</span>
          <motion.span
            className={`rounded px-1.5 font-mono text-[10px] ring-1 ${c}`}
            animate={reduce ? undefined : { rotateX: [0, 90, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.2, delay: i * 0.15, ease: EASE }}
          >
            {o}
          </motion.span>
        </div>
      ))}
    </div>
  );
}

function MiniBands() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="relative h-14">
      <div className="absolute inset-x-0 top-5 flex h-3 overflow-hidden rounded-full">
        <div className="w-[45%] bg-slate-700/70" />
        <div className="w-[30%] bg-sky-200/25" />
        <div className="flex-1 bg-sky-400/40" />
      </div>
      <motion.span
        className="absolute top-3 h-7 w-3 -translate-x-1/2 rounded bg-slate-100"
        animate={reduce ? { left: "75%" } : { left: ["75%", "62%", "82%", "75%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: EASE }}
      />
      {[0.12, 0.3, 0.55, 0.81, 0.9, 0.95].map((c, i) => (
        <span key={i} className="absolute top-[22px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-300 ring-2 ring-slate-950" style={{ left: `${c * 100}%` }} />
      ))}
    </div>
  );
}

function MiniTrace() {
  const reduce = useReducedMotion();
  const steps: Array<[string, string, string]> = [
    ["∪", "Gmail (Priya)", "text-emerald-300"],
    ["∪", "Customer calls: no match", "text-emerald-300"],
    ["∩", "Compensation v2: no match", "text-red-300"],
    ["=", "Priya only", "text-sky-300"],
  ];
  return (
    <ol aria-hidden className="space-y-1">
      {steps.map(([op, t, c], i) => (
        <motion.li
          key={t}
          className="flex gap-2 text-xs"
          animate={reduce ? undefined : { opacity: [0.25, 1, 1, 0.25] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.35, times: [0, 0.15, 0.85, 1] }}
        >
          <span className={`w-4 font-mono ${c}`}>{op}</span>
          <span className="text-slate-300">{t}</span>
        </motion.li>
      ))}
    </ol>
  );
}

export function Steps() {
  const steps = [
    { n: "01", t: "Write the rule", d: "Plain-language description, with a nudge when it's vague.", el: <MiniGrid /> },
    { n: "02", t: "Add examples", d: "Should match / should not match. Yours, or a synthetic starter pack.", el: <MiniBands /> },
    { n: "03", t: "Read the verdict", d: "Precision, recall, bands, the audience trace, and readiness.", el: <MiniTrace /> },
  ];
  return (
    <Section id="feature" eyebrow="The feature" title={<>Three steps, <span className="text-slate-400">zero dry runs.</span></>}>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08} className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-5">
            <span className="font-mono text-sm text-sky-300">{s.n}</span>
            <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-slate-400">{s.d}</p>
            <div className="mt-5 rounded-xl border border-white/5 bg-slate-950/70 p-3">{s.el}</div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
