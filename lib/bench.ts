// Glue used by the Test Bench UI. Pure and synchronous so it runs in the browser on every edit.
import { DEFAULT_THRESHOLDS, bandFor } from "./bands";
import { audienceLabel, computeAudience, type AudienceResult, type RuleOutcome } from "./audience";
import { LocalJudge } from "./judge/LocalJudge";
import { scoreRule, type RuleScore } from "./score";
import { connectionById, members, sharingOptIn } from "./seed/org";
import type { Connection, Example, Judgement, JudgementMap, Rule, RuleVersion, Thresholds } from "./types";

const judge = new LocalJudge();

export interface BenchRun {
  judgements: JudgementMap;
  errored: Set<string>;
  score: RuleScore;
  elapsedMs: number;
}

export interface BenchOptions {
  /** Simulate a judge timeout on every Nth example (FlakyJudge demo). */
  flakyEvery?: number;
}

export function runBench(
  rule: RuleVersion,
  examples: readonly Example[],
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  opts: BenchOptions = {},
): BenchRun {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const judgements: JudgementMap = {};
  const errored = new Set<string>();
  examples.forEach((e, i) => {
    if (opts.flakyEvery && (i + 1) % opts.flakyEvery === 0) errored.add(e.id);
    else judgements[e.id] = judge.judgeSync(rule, e, examples);
  });
  const score = scoreRule(rule, examples, judgements, thresholds, errored);
  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  return { judgements, errored, score, elapsedMs: t1 - t0 };
}

export interface CurrentRuleContext {
  rule: RuleVersion;
  /** null = the judge failed for this example */
  judgement: Judgement | null;
  thresholds: Thresholds;
  /** Sharing rules: whether auto band shares or still asks. Defaults to false (docs: new rules start with auto-share off). */
  autoShare?: boolean;
}

export interface Explanation extends AudienceResult {
  label: string;
  connections: Connection[];
}

function toOutcome(rule: RuleVersion, j: Judgement | null, thresholds: Thresholds, autoShare: boolean): RuleOutcome {
  const base = { ruleId: rule.ruleId, ruleName: rule.name, ruleVersion: rule.version, kind: rule.kind };
  if (!j) return { ...base, band: null, confidence: null, error: "judge timeout" };
  let band = bandFor(j.confidence, thresholds);
  if (rule.kind === "sharing" && band === "auto" && !autoShare) band = "review";
  return { ...base, band, confidence: j.confidence };
}

/** Why does this example end up with this audience? Runs every org rule over it. */
export function explainExample(example: Example, current: CurrentRuleContext, rules: readonly Rule[]): Explanation {
  const outcomes: RuleOutcome[] = rules.map((r) => {
    if (r.id === current.rule.ruleId) {
      return toOutcome(current.rule, current.judgement, current.thresholds, current.autoShare ?? false);
    }
    const live = r.versions[r.versions.length - 1]!;
    return toOutcome(live, judge.judgeSync(live, example, r.examples), DEFAULT_THRESHOLDS, r.autoShare ?? false);
  });
  const connections = example.source.connectionIds
    .map(connectionById)
    .filter((c): c is Connection => Boolean(c));
  const result = computeAudience({ connections }, outcomes, { sharingOptIn });
  return { ...result, connections, label: audienceLabel(result.audience, members) };
}
