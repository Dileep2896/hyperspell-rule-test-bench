import { DEFAULT_THRESHOLDS } from "../bands";
import type { Example, Judgement, RuleVersion } from "../types";
import { groupMatches, groupsFor } from "./lexicon";
import type { RuleJudge } from "./RuleJudge";
import { jaccard, sentences, tokenize } from "./text";

/** How many concept hits saturate the description overlap. */
const SATURATION = 2;
const W_DESC = 0.6;
const W_NEIGHBORS = 0.4;
const LOGISTIC_K = 10;
const LOGISTIC_MID = 0.3;

const round2 = (n: number) => Math.round(n * 100) / 100;
const logistic = (s: number) => 1 / (1 + Math.exp(-LOGISTIC_K * (s - LOGISTIC_MID)));

/**
 * Deterministic lexical judge.
 *   s = 0.6 · descOverlap + 0.4 · (maxSimPositive − maxSimNegative)   per sentence
 *   confidence = logistic(best s), rounded to 2 decimals
 * descOverlap counts how many of the description's concept groups the sentence hits.
 * The neighbor term is Jaccard similarity to the rule's other labeled examples.
 */
export class LocalJudge implements RuleJudge {
  readonly name = "local";

  async judge(rule: RuleVersion, snippet: Example, neighbors: readonly Example[] = []): Promise<Judgement> {
    return this.judgeSync(rule, snippet, neighbors);
  }

  judgeSync(rule: RuleVersion, snippet: Example, neighbors: readonly Example[] = []): Judgement {
    const base = { ruleId: rule.ruleId, ruleVersion: rule.version };
    const groups = groupsFor(tokenize(rule.description));
    if (groups.length === 0) return { ...base, matched: false, confidence: 0, passage: null };

    const others = neighbors.filter((n) => n.id !== snippet.id);
    const pos = others.filter((n) => n.label === "match").map((n) => new Set(tokenize(n.text)));
    const neg = others.filter((n) => n.label === "no-match").map((n) => new Set(tokenize(n.text)));
    const maxSim = (t: Set<string>, pool: Set<string>[]) => pool.reduce((m, p) => Math.max(m, jaccard(t, p)), 0);
    const denom = Math.min(groups.length, SATURATION);

    let best = { confidence: 0, passage: "" };
    for (const sentence of sentences(snippet.text)) {
      const toks = new Set(tokenize(sentence));
      if (toks.size === 0) continue;
      const hits = groups.filter((g) => groupMatches(g, toks)).length;
      const overlap = Math.min(1, hits / denom);
      const s = W_DESC * overlap + W_NEIGHBORS * (maxSim(toks, pos) - maxSim(toks, neg));
      const confidence = round2(logistic(s));
      if (confidence > best.confidence) best = { confidence, passage: sentence };
    }

    const matched = best.confidence >= DEFAULT_THRESHOLDS.ignore;
    return { ...base, matched, confidence: best.confidence, passage: matched ? best.passage : null };
  }
}
