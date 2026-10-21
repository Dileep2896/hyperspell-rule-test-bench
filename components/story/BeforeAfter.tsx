"use client";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE, springs } from "@/lib/motion";
import { Section } from "./primitives";

export interface StoryDot {
  id: string;
  title: string;
  label: "match" | "no-match";
  v1: number;
  v2: number;
}

const IGNORE = 0.45;
const AUTO = 0.75;

export function BeforeAfter({ dots, v1Text, v2Text }: { dots: StoryDot[]; v1Text: string; v2Text: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [version, setVersion] = useState<1 | 2>(reduce ? 2 : 1);

  useEffect(() => {
    if (reduce) {
      setVersion(2);
      return;
    }
    if (!inView) return;
    const t = setInterval(() => setVersion((v) => (v === 1 ? 2 : 1)), 2800);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <Section id="before-after" eyebrow="Before → after" title={<>From a dry run per edit to <span className="text-sky-300">instant verdicts</span>.</>}>
      <div ref={ref} className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">Before</p>
          <ol className="mt-4 space-y-4 text-sm text-slate-300">
            <li>1. Edit the rule description</li>
            <li>
              2. Run it over the stored corpus
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-slate-400"
                  initial={reduce ? false : { width: "0%" }}
                  whileInView={{ width: reduce ? "100%" : ["0%", "38%", "41%", "63%", "100%"] }}
                  viewport={{ once: false }}
                  transition={{ duration: 6, ease: "linear", repeat: reduce ? 0 : Infinity, repeatDelay: 0.8 }}
                />
              </div>
              <p className="mt-1 font-mono text-[11px] text-slate-500">dry_run: true · estimating… asks for confirmation</p>
            </li>
            <li>3. Read identity-only results. Guess why. Edit again.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-sky-400/30 bg-sky-400/[0.04] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-sky-300">After · Rule Test Bench</p>
            <span className="rounded-md bg-slate-950 px-2 py-0.5 font-mono text-xs ring-1 ring-white/15" data-testid="story-version">
              v{version}
            </span>
          </div>
          <motion.p key={version} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-3 text-sm italic text-slate-200">
            “{version === 1 ? v1Text : v2Text}”
          </motion.p>
          <div className="relative mt-6 h-24">
            <div className="absolute inset-x-0 top-10 flex h-4 overflow-hidden rounded-full ring-1 ring-white/10">
              <div className="bg-slate-700/70" style={{ width: `${IGNORE * 100}%` }} />
              <div className="bg-sky-200/25" style={{ width: `${(AUTO - IGNORE) * 100}%` }} />
              <div className="flex-1 bg-sky-400/40" />
            </div>
            <div className="absolute inset-x-0 top-[3.75rem] flex text-[10px] uppercase tracking-wider text-slate-500">
              <span style={{ width: `${IGNORE * 100}%` }}>ignore</span>
              <span style={{ width: `${(AUTO - IGNORE) * 100}%` }}>review</span>
              <span>auto</span>
            </div>
            {dots.map((d, i) => {
              const c = version === 1 ? d.v1 : d.v2;
              const fp = d.label === "no-match" && c >= IGNORE;
              return (
                <motion.span
                  key={d.id}
                  title={d.title}
                  className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-2 ring-slate-950 ${
                    d.label === "match" ? "bg-sky-300" : fp ? "bg-red-400" : "bg-slate-500"
                  }`}
                  initial={reduce ? false : { top: -10, opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ left: `${Math.min(97, Math.max(3, c * 100))}%`, top: 38 + (i % 3) * 3 - 3 }}
                  transition={reduce ? { duration: 0 } : { ...springs.gentle, delay: 0.02 * i }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" /> should match</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> false positive</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> correctly ignored</span>
          </div>
          <motion.p key={`cap-${version}`} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-4 text-sm text-slate-200">
            {version === 1 ? "The fun run and the Figma invoice land in the match zone." : "v2: both false positives slide out. No real document was read."}
          </motion.p>
        </div>
      </div>
    </Section>
  );
}
