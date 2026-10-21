"use client";
import { motion, useReducedMotion } from "motion/react";
import { splitOnPassage } from "@/lib/highlight";
import { EASE, motionTokens } from "@/lib/motion";
import type { Outcome, ScoreRow } from "@/lib/score";
import type { Example } from "@/lib/types";

const OUTCOME_STYLE: Record<Outcome, string> = {
  TP: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/40",
  TN: "bg-slate-400/10 text-slate-300 ring-white/15",
  FP: "bg-red-400/15 text-red-300 ring-red-400/50",
  FN: "bg-sky-400/15 text-sky-300 ring-sky-400/50",
};
const OUTCOME_TITLE: Record<Outcome, string> = {
  TP: "Correct match",
  TN: "Correctly ignored",
  FP: "False positive",
  FN: "Missed match",
};
const BAND_COLOR = { auto: "bg-sky-400", review: "bg-sky-200/70", ignore: "bg-slate-500" } as const;

interface Props {
  examples: Example[];
  rows: ScoreRow[];
  errored: Set<string>;
  onExplain: (exampleId: string) => void;
}

export function ResultsGrid({ examples, rows, errored, onExplain }: Props) {
  const reduce = useReducedMotion();
  const byId = new Map(rows.map((r) => [r.exampleId, r]));
  if (examples.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">
        Add a should-match and a should-not-match example to start.
      </div>
    );
  }
  return (
    <section aria-labelledby="results-h" className="rounded-xl border border-white/10 bg-slate-900/60">
      <h2 id="results-h" className="border-b border-white/5 px-4 py-3 text-sm font-semibold">
        Verdicts
      </h2>
      <ul className="divide-y divide-white/5" data-testid="results">
        {examples.map((e) => {
          const r = byId.get(e.id);
          const failed = errored.has(e.id);
          const [pre, hit, post] = splitOnPassage(e.text, r?.passage ?? null);
          return (
            <li key={e.id} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 px-4 py-3 sm:grid-cols-[4.5rem_1fr_9rem]" data-example={e.id}>
              <div className="row-span-2 sm:row-span-1">
                {failed ? (
                  <span className="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-red-400/50 text-red-300">ERR</span>
                ) : r ? (
                  <motion.span
                    key={r.outcome}
                    initial={reduce ? false : { rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ duration: motionTokens.duration.normal, ease: EASE }}
                    title={OUTCOME_TITLE[r.outcome]}
                    data-outcome={r.outcome}
                    className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] ring-1 ${OUTCOME_STYLE[r.outcome]}`}
                  >
                    {r.outcome}
                  </motion.span>
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-300">{e.title}</span> · expected{" "}
                  <span className={e.label === "match" ? "text-sky-300" : "text-slate-400"}>{e.label === "match" ? "match" : "no match"}</span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-200">
                  {pre}
                  {hit && <mark>{hit}</mark>}
                  {post}
                </p>
                {failed && <p className="mt-1 text-xs text-red-300">Judge timed out on this example. Sharing would fail closed.</p>}
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:flex-col sm:items-end">
                {r && (
                  <div className="flex w-full items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
                      <motion.div
                        className={`h-full rounded-full ${BAND_COLOR[r.band]}`}
                        initial={false}
                        animate={{ width: `${Math.round(r.confidence * 100)}%` }}
                        transition={{ duration: reduce ? 0 : motionTokens.duration.normal, ease: EASE }}
                      />
                    </div>
                    <span className="w-9 text-right font-mono text-xs tabular-nums text-slate-300">{r.confidence.toFixed(2)}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onExplain(e.id)}
                  className="whitespace-nowrap text-xs text-sky-300/90 underline-offset-2 hover:underline"
                >
                  Why this audience?
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
