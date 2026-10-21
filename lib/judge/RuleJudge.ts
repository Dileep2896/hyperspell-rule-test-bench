import type { Example, Judgement, RuleVersion } from "../types";
import { LocalJudge } from "./LocalJudge";
import { LlmJudge } from "./LlmJudge";

/**
 * The seam where a production classifier (e.g. a Python/FastAPI service) would plug in.
 * `neighbors` are the rule's other labeled examples, used as few-shot context.
 */
export interface RuleJudge {
  readonly name: string;
  judge(rule: RuleVersion, snippet: Example, neighbors?: readonly Example[]): Promise<Judgement>;
}

export interface JudgeEnv {
  RULE_JUDGE?: string;
  ANTHROPIC_API_KEY?: string;
}

/** LocalJudge unless RULE_JUDGE=llm and a key is present. The LLM judge is never required. */
export function createJudge(env: JudgeEnv): RuleJudge {
  if (env.RULE_JUDGE === "llm" && env.ANTHROPIC_API_KEY) return new LlmJudge(env.ANTHROPIC_API_KEY);
  return new LocalJudge();
}
