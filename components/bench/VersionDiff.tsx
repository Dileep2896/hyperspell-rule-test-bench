"use client";
import { AnimatePresence, motion } from "motion/react";
import type { VersionDiff as Diff } from "@/lib/diff";
import type { Example } from "@/lib/types";
import { EASE, motionTokens } from "@/lib/motion";

export function VersionDiff({ diff, from, to, examples }: { diff: Diff | null; from: string; to: string; examples: Example[] }) {
  if (!diff) return null;
  const title = (id: string) => examples.find((e) => e.id === id)?.title ?? id;
  const groups: Array<[string, string[], string]> = [
    ["fixed false positive", diff.fixedFP, "text-emerald-300"],
    ["fixed missed match", diff.fixedFN, "text-emerald-300"],
    ["new false positive", diff.newFP, "text-red-300"],
    ["new missed match", diff.newFN, "text-red-300"],
  ];
  return (
    <section aria-labelledby="diff-h" className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <h2 id="diff-h" className="text-sm font-semibold">
        <span className="font-mono text-slate-400">{from}</span> → <span className="font-mono">{to}</span>
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={diff.summary}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: motionTokens.duration.fast, ease: EASE }}
          className="mt-1 text-sm text-slate-200"
          data-testid="diff-summary"
        >
          {to} {diff.summary}
        </motion.p>
      </AnimatePresence>
      {diff.changed > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {groups.flatMap(([label, ids, color]) =>
            ids.map((id) => (
              <li key={`${label}-${id}`} className="flex gap-2">
                <span className={`${color} w-36 shrink-0`}>{label}</span>
                <span className="text-slate-300">{title(id)}</span>
              </li>
            )),
          )}
        </ul>
      )}
    </section>
  );
}
