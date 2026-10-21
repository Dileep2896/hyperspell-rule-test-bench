"use client";
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { RuleScore } from "@/lib/score";

function AnimatedPercent({ value, label }: { value: number | null; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<number>(value ?? 0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value === null) {
      el.textContent = "–";
      return;
    }
    const to = Math.round(value * 100);
    if (reduce) {
      el.textContent = `${to}%`;
      prev.current = value;
      return;
    }
    const controls = animate(Math.round(prev.current * 100), to, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}%`),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce]);
  return (
    <div className="rounded-lg bg-white/[0.03] p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <span ref={ref} data-testid={label.toLowerCase()} className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
        {value === null ? "–" : `${Math.round(value * 100)}%`}
      </span>
    </div>
  );
}

const READY_STYLE = {
  ready: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/40",
  "not-ready": "bg-red-400/10 text-red-300 ring-red-400/40",
  "needs-examples": "bg-sky-400/10 text-sky-300 ring-sky-400/40",
} as const;
const READY_LABEL = { ready: "Ready", "not-ready": "Not ready", "needs-examples": "Needs examples" } as const;

export function ScoreCard({ score, elapsedMs, kind }: { score: RuleScore; elapsedMs: number; kind: "filter" | "sharing" }) {
  return (
    <section aria-labelledby="score-h" className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-baseline justify-between">
        <h2 id="score-h" className="text-sm font-semibold">
          Score
        </h2>
        <span className="font-mono text-[11px] text-slate-500" data-testid="elapsed">
          re-scored in {elapsedMs < 1 ? "<1" : elapsedMs.toFixed(0)} ms · local judge
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <AnimatedPercent value={score.precision} label="Precision" />
        <AnimatedPercent value={score.recall} label="Recall" />
      </div>
      <p className="mt-2 font-mono text-xs text-slate-400">
        TP {score.matrix.TP} · FP <span className={score.matrix.FP ? "text-red-300" : ""}>{score.matrix.FP}</span> · FN{" "}
        <span className={score.matrix.FN ? "text-sky-300" : ""}>{score.matrix.FN}</span> · TN {score.matrix.TN}
        {score.errors > 0 && <span className="text-red-300"> · {score.errors} judge errors</span>}
      </p>
      <div className="mt-3 rounded-lg border border-white/5 p-3" data-testid="readiness">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${READY_STYLE[score.readiness.status]}`}>
            {READY_LABEL[score.readiness.status]}
          </span>
          <span className="text-xs text-slate-400">{kind === "sharing" ? "Ready to auto-share?" : "Ready to enforce?"}</span>
        </div>
        <p className="mt-1.5 text-sm text-slate-200">{score.readiness.reason}</p>
      </div>
    </section>
  );
}
