import { DEFAULT_THRESHOLDS, bandFor } from "./bands";
import type { Band, Example, ExampleLabel, JudgementMap, RuleVersion, Thresholds } from "./types";

export type Outcome = "TP" | "FP" | "FN" | "TN";

export interface ScoreRow {
  exampleId: string;
  label: ExampleLabel;
  confidence: number;
  band: Band;
  outcome: Outcome;
  passage: string | null;
}

export type Readiness =
  | { status: "ready"; reason: string }
  | { status: "needs-examples"; reason: string }
  | { status: "not-ready"; reason: string };

export interface RuleScore {
  rows: ScoreRow[];
  matrix: Record<Outcome, number>;
  /** null when nothing was predicted */
  precision: number | null;
  /** null when there are no positive examples */
  recall: number | null;
  bands: Record<Band, number>;
  /** Precision among examples that land in the auto band (what would act without asking). */
  autoPrecision: number | null;
  errors: number;
  readiness: Readiness;
}

export const MIN_POSITIVES = 5;
export const MIN_NEGATIVES = 3;

/** An example is "predicted" when its band is anything but ignore. */
export function outcomeFor(label: ExampleLabel, band: Band): Outcome {
  const predicted = band !== "ignore";
  if (label === "match") return predicted ? "TP" : "FN";
  return predicted ? "FP" : "TN";
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function scoreRule(
  rule: RuleVersion,
  examples: readonly Example[],
  judgements: JudgementMap,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  errored: ReadonlySet<string> = new Set(),
): RuleScore {
  const rows: ScoreRow[] = [];
  for (const e of examples) {
    const j = judgements[e.id];
    if (!j || errored.has(e.id)) continue;
    const band = bandFor(j.confidence, thresholds);
    rows.push({ exampleId: e.id, label: e.label, confidence: j.confidence, band, outcome: outcomeFor(e.label, band), passage: j.passage });
  }

  const matrix: Record<Outcome, number> = { TP: 0, FP: 0, FN: 0, TN: 0 };
  const bands: Record<Band, number> = { auto: 0, review: 0, ignore: 0 };
  for (const r of rows) {
    matrix[r.outcome]++;
    bands[r.band]++;
  }
  const predicted = matrix.TP + matrix.FP;
  const positives = matrix.TP + matrix.FN;
  const precision = predicted ? matrix.TP / predicted : null;
  const recall = positives ? matrix.TP / positives : null;

  const autoRows = rows.filter((r) => r.band === "auto");
  const autoTP = autoRows.filter((r) => r.label === "match").length;
  const autoFP = autoRows.length - autoTP;
  const autoPrecision = autoRows.length ? autoTP / autoRows.length : null;
  const negatives = matrix.FP + matrix.TN;

  let readiness: Readiness;
  // Sharing rules need real evidence before auto-share; filters need at least one of each label.
  const minPos = rule.kind === "sharing" ? MIN_POSITIVES : 1;
  const minNeg = rule.kind === "sharing" ? MIN_NEGATIVES : 1;
  if (positives < minPos || negatives < minNeg) {
    const needs: string[] = [];
    if (positives < minPos) needs.push(`${minPos - positives} more should-match`);
    if (negatives < minNeg) needs.push(`${minNeg - negatives} more should-not-match`);
    const total = Math.max(0, minPos - positives) + Math.max(0, minNeg - negatives);
    readiness = { status: "needs-examples", reason: `Add ${needs.join(" and ")} example${total > 1 ? "s" : ""} to trust this verdict` };
  } else if (rule.kind === "sharing") {
    const reviewTP = rows.filter((r) => r.band === "review" && r.label === "match").length;
    const tally = `${autoTP} of ${positives} positives would auto-share, ${reviewTP} go to the owner's Inbox, ${plural(autoFP, "false share")}`;
    if (autoFP === 0 && autoTP > 0) readiness = { status: "ready", reason: `${tally} → Ready to enable auto-share` };
    else if (autoTP === 0) readiness = { status: "not-ready", reason: `${tally}. Nothing reaches the auto band yet` };
    else readiness = { status: "not-ready", reason: `${tally}. Keep auto-share off` };
  } else {
    if (matrix.FP === 0 && matrix.FN === 0) readiness = { status: "ready", reason: "No false positives and no misses on your examples" };
    else
      readiness = {
        status: "not-ready",
        reason: `${plural(matrix.FP, "false positive")} and ${plural(matrix.FN, "miss", "misses")} on your examples`,
      };
  }

  return { rows, matrix, precision, recall, bands, autoPrecision, errors: examples.filter((e) => errored.has(e.id)).length, readiness };
}
