// POST { ruleVersion, examples } → { judge, judgements, errors }
// Judges ONLY the examples in the request body (the admin's own labeled snippets).
// It never loads org documents. The bench UI judges locally in the browser; this endpoint is
// the seam for a server-side judge (LlmJudge, or a production classifier service).
import { NextResponse } from "next/server";
import { z } from "zod";
import { createJudge } from "@/lib/judge/RuleJudge";
import type { Example, JudgementMap, RuleVersion } from "@/lib/types";

const RuleVersionSchema = z.object({
  ruleId: z.string().min(1).max(80),
  version: z.number().int().positive(),
  name: z.string().max(120),
  kind: z.enum(["filter", "sharing"]),
  description: z.string().max(1000),
});

const ExampleSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().max(200),
  text: z.string().max(4000),
  label: z.enum(["match", "no-match"]),
  source: z.object({ connectionIds: z.array(z.string().max(80)).max(10) }),
  synthetic: z.literal(true),
});

const BodySchema = z.object({
  ruleVersion: RuleVersionSchema,
  examples: z.array(ExampleSchema).max(200),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }

  const judge = createJudge({ RULE_JUDGE: process.env.RULE_JUDGE, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY });
  const rule = parsed.data.ruleVersion as RuleVersion;
  const examples = parsed.data.examples as Example[];
  const judgements: JudgementMap = {};
  const errors: Record<string, string> = {};
  await Promise.all(
    examples.map(async (e) => {
      try {
        judgements[e.id] = await judge.judge(rule, e, examples);
      } catch (err) {
        errors[e.id] = err instanceof Error ? err.message : "judge failed";
      }
    }),
  );
  return NextResponse.json({ judge: judge.name, judgements, errors });
}
