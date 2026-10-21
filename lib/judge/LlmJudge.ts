import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { DEFAULT_THRESHOLDS } from "../bands";
import type { Example, Judgement, RuleVersion } from "../types";
import { JudgeError } from "./FlakyJudge";
import type { RuleJudge } from "./RuleJudge";

const Verdict = z.object({
  confidence: z.number(),
  passage: z.string().nullable(),
});

/**
 * Optional adapter: asks Claude to judge a snippet against a rule description, the way
 * a production classifier would. Off unless RULE_JUDGE=llm and ANTHROPIC_API_KEY
 * are set. Never used by tests. Any failure (API error, refusal, unparseable output) throws
 * JudgeError so sharing fails closed.
 */
export class LlmJudge implements RuleJudge {
  readonly name = "llm";
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 1 });
  }

  async judge(rule: RuleVersion, snippet: Example, neighbors: readonly Example[] = []): Promise<Judgement> {
    const shots = neighbors
      .filter((n) => n.id !== snippet.id)
      .slice(0, 12)
      .map((n) => `- [${n.label === "match" ? "SHOULD MATCH" : "SHOULD NOT MATCH"}] ${n.text}`)
      .join("\n");
    try {
      const response = await this.client.messages.parse({
        model: "claude-opus-5-5",
        max_tokens: 2048,
        output_config: { effort: "low", format: zodOutputFormat(Verdict) },
        system:
          "You judge whether a workspace document matches a content rule. Judge on what the text says, not its title. " +
          "Return confidence in [0,1] and the single sentence that most supports a match (or null).",
        messages: [
          {
            role: "user",
            content:
              `Rule (${rule.kind}): ${rule.description}\n\nLabeled examples written by the admin:\n${shots || "(none)"}\n\n` +
              `Document to judge:\n${snippet.text}`,
          },
        ],
      });
      if (response.stop_reason === "refusal" || !response.parsed_output) throw new JudgeError("LLM judge returned no verdict");
      const confidence = Math.round(Math.min(1, Math.max(0, response.parsed_output.confidence)) * 100) / 100;
      const matched = confidence >= DEFAULT_THRESHOLDS.ignore;
      return {
        matched,
        confidence,
        passage: matched ? response.parsed_output.passage : null,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
      };
    } catch (err) {
      if (err instanceof JudgeError) throw err;
      throw new JudgeError(err instanceof Error ? err.message : "LLM judge failed");
    }
  }
}
