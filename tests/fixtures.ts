import type { Example, Judgement, RuleVersion } from "@/lib/types";

export function ex(id: string, label: Example["label"], text = id, connectionIds = ["notion"]): Example {
  return { id, title: id, text, label, source: { connectionIds }, synthetic: true };
}

export function j(confidence: number, ruleId = "r", ruleVersion = 1): Judgement {
  return { matched: confidence >= 0.45, confidence, passage: confidence >= 0.45 ? "p" : null, ruleId, ruleVersion };
}

export function rv(kind: RuleVersion["kind"], description = "d", version = 1, ruleId = "r"): RuleVersion {
  return { ruleId, version, name: ruleId, kind, description };
}
