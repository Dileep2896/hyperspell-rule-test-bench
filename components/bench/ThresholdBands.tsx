"use client";
import { motion, useReducedMotion } from "motion/react";
import { springs } from "@/lib/motion";
import type { ScoreRow } from "@/lib/score";
import type { RuleKind, Thresholds } from "@/lib/types";

interface Props {
  kind: RuleKind;
  rows: ScoreRow[];
  thresholds: Thresholds;
  onChange: (t: Thresholds) => void;
}

const GAP = 0.02;

export function ThresholdBands({ kind, rows, thresholds, onChange }: Props) {
  const reduce = useReducedMotion();
  const counts = { auto: 0, review: 0, ignore: 0 };
  for (const r of rows) counts[r.band]++;
  const posAuto = rows.filter((r) => r.band === "auto" && r.label === "match").length;
  const posReview = rows.filter((r) => r.band === "review" && r.label === "match").length;
  const negAuto = rows.filter((r) => r.band === "auto" && r.label === "no-match").length;
  const negActing = rows.filter((r) => r.band !== "ignore" && r.label === "no-match").length;
  const pct = (n: number) => `${n * 100}%`;

  return (
    <section aria-labelledby="bands-h" className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="bands-h" className="text-sm font-semibold">
          Confidence bands
        </h2>
        <p className="font-mono text-xs text-slate-400">
          ignore &lt; {thresholds.ignore.toFixed(2)} ≤ review &lt; {thresholds.auto.toFixed(2)} ≤ auto
        </p>
      </div>
      <div className="relative mt-4 h-14 select-none">
        <div className="absolute inset-x-0 top-5 h-4 overflow-hidden rounded-full ring-1 ring-white/10">
          <div className="absolute inset-y-0 left-0 bg-slate-700/70" style={{ width: pct(thresholds.ignore) }} />
          <div className="absolute inset-y-0 bg-sky-200/25" style={{ left: pct(thresholds.ignore), width: pct(thresholds.auto - thresholds.ignore) }} />
          <div className="absolute inset-y-0 right-0 bg-sky-400/40" style={{ left: pct(thresholds.auto) }} />
        </div>
        {rows.map((r, i) => (
          <motion.span
            key={r.exampleId}
            title={`${r.exampleId}: ${r.confidence.toFixed(2)}`}
            className={`absolute top-[22px] h-3 w-3 -translate-x-1/2 rounded-full ring-2 ring-slate-950 ${
              r.label === "match" ? "bg-sky-300" : r.band === "ignore" ? "bg-slate-400" : "bg-red-400"
            }`}
            initial={reduce ? false : { y: -24, opacity: 0 }}
            animate={{ left: pct(r.confidence), y: (i % 3) * 4 - 4, opacity: 1 }}
            transition={reduce ? { duration: 0 } : springs.gentle}
          />
        ))}
        <input
          type="range"
          aria-label="Ignore threshold"
          min={0}
          max={1}
          step={0.01}
          value={thresholds.ignore}
          onChange={(e) => onChange({ ...thresholds, ignore: Math.min(Number(e.target.value), thresholds.auto - GAP) })}
          className="band-thumb absolute inset-x-0 top-[13px] h-7 w-full"
        />
        <input
          type="range"
          aria-label="Auto threshold"
          min={0}
          max={1}
          step={0.01}
          value={thresholds.auto}
          onChange={(e) => onChange({ ...thresholds, auto: Math.max(Number(e.target.value), thresholds.ignore + GAP) })}
          className="band-thumb absolute inset-x-0 top-[13px] h-7 w-full"
        />
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white/[0.03] p-2">
          <dt className="text-slate-500">ignore</dt>
          <dd className="font-mono text-lg tabular-nums">{counts.ignore}</dd>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2">
          <dt className="text-slate-500">review</dt>
          <dd className="font-mono text-lg tabular-nums">{counts.review}</dd>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-2">
          <dt className="text-slate-500">auto</dt>
          <dd className="font-mono text-lg tabular-nums">{counts.auto}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-slate-400" data-testid="band-summary">
        {kind === "sharing" ? (
          <>
            {posAuto} of {posAuto + posReview} matched positives would auto-share, {posReview} would ask the owner in their Inbox,{" "}
            <span className={negAuto ? "text-red-300" : "text-emerald-300"}>
              {negAuto} false share{negAuto === 1 ? "" : "s"}
            </span>
            .
          </>
        ) : (
          <>
            Filters act on any match: {posAuto + posReview} positive{posAuto + posReview === 1 ? "" : "s"} filtered,{" "}
            <span className={negActing ? "text-red-300" : "text-emerald-300"}>
              {negActing} innocent doc{negActing === 1 ? "" : "s"} filtered
            </span>
            .
          </>
        )}
      </p>
    </section>
  );
}
