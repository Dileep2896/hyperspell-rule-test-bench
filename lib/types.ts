// Domain types for the Rule Test Bench.
// Vocabulary follows common LLM content-rule systems: filter rules narrow an
// audience, sharing rules widen it, and both are judged on what a document says.

export type RuleKind = "filter" | "sharing";

/** One immutable version of a rule's plain-language description. */
export interface RuleVersion {
  ruleId: string;
  version: number;
  name: string;
  kind: RuleKind;
  description: string;
}

export interface Rule {
  id: string;
  name: string;
  kind: RuleKind;
  /** Oldest first. The last entry is the live version. */
  versions: RuleVersion[];
  /** Admin-written, labeled example snippets. Never real org content. */
  examples: Example[];
  /** Sharing rules only: whether matches share automatically (auto band) or always ask. */
  autoShare?: boolean;
}

export type ConnectionKind = "shared" | "personal";

export interface Member {
  id: string;
  name: string;
}

export interface Connection {
  id: string;
  /** e.g. "Notion", "Granola" */
  tool: string;
  kind: ConnectionKind;
  /** Personal connections belong to one member. */
  ownerId?: string;
}

/** Where a (synthetic) example pretends to come from. Drives the audience explainer. */
export interface SourceContext {
  connectionIds: string[];
}

export type ExampleLabel = "match" | "no-match";

export interface Example {
  id: string;
  title: string;
  text: string;
  label: ExampleLabel;
  source: SourceContext;
  /** Always true in this demo: examples are written by the admin or come from a starter pack. */
  synthetic: true;
}

export interface Judgement {
  matched: boolean;
  /** In [0, 1], rounded to 2 decimals. */
  confidence: number;
  /** The sentence that triggered the match, or null when below the ignore threshold. */
  passage: string | null;
  ruleId: string;
  ruleVersion: number;
}

export type Band = "auto" | "review" | "ignore";

export interface Thresholds {
  /** confidence >= auto → auto band */
  auto: number;
  /** confidence < ignore → ignore band */
  ignore: number;
}

export type JudgementMap = Record<string, Judgement>;
