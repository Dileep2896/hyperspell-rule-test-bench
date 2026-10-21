import { DEFAULT_THRESHOLDS, bandFor } from "./bands";
import type { Example, JudgementMap, Thresholds } from "./types";
import { outcomeFor } from "./score";

export interface VersionDiff {
  fixedFP: string[];
  fixedFN: string[];
  newFP: string[];
  newFN: string[];
  changed: number;
  summary: string;
}

const n = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

/** Which examples changed outcome between two rule versions. */
export function diffVersions(
  prev: JudgementMap,
  next: JudgementMap,
  examples: readonly Example[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
): VersionDiff {
  const d = { fixedFP: [] as string[], fixedFN: [] as string[], newFP: [] as string[], newFN: [] as string[] };
  for (const e of examples) {
    const a = prev[e.id];
    const b = next[e.id];
    if (!a || !b) continue;
    const before = outcomeFor(e.label, bandFor(a.confidence, thresholds));
    const after = outcomeFor(e.label, bandFor(b.confidence, thresholds));
    if (before === after) continue;
    if (before === "FP" && after === "TN") d.fixedFP.push(e.id);
    else if (before === "FN" && after === "TP") d.fixedFN.push(e.id);
    else if (before === "TN" && after === "FP") d.newFP.push(e.id);
    else if (before === "TP" && after === "FN") d.newFN.push(e.id);
  }
  const changed = d.fixedFP.length + d.fixedFN.length + d.newFP.length + d.newFN.length;
  if (changed === 0) return { ...d, changed, summary: "no outcome changed" };

  const parts: string[] = [];
  const fixed: string[] = [];
  if (d.fixedFP.length) fixed.push(n(d.fixedFP.length, "false positive"));
  if (d.fixedFN.length) fixed.push(n(d.fixedFN.length, "missed match", "missed matches"));
  if (fixed.length) parts.push(`fixed ${fixed.join(" and ")}`);
  if (d.newFP.length) parts.push(`introduced ${n(d.newFP.length, "false positive")}`);
  parts.push(`lost ${n(d.newFN.length, "true positive")}`);
  return { ...d, changed, summary: parts.join(", ") };
}
