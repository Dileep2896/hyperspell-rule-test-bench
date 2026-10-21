import type { Example, JudgementMap, RuleVersion } from "../types";
import type { LocalJudge } from "./LocalJudge";

/** Judge every example against one rule version, using the others as neighbors. Synchronous. */
export function judgeAll(judge: LocalJudge, rule: RuleVersion, examples: readonly Example[]): JudgementMap {
  const out: JudgementMap = {};
  for (const e of examples) out[e.id] = judge.judgeSync(rule, e, examples);
  return out;
}
