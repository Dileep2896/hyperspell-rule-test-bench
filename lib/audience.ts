// Audience algebra for one document, following the common permission model for
// LLM-judged content rules:
//   final = (∪ default audience of every connection that brought the doc in)
//           ∪ (sharing rules that matched, if an owner turned sharing on)
//           ∩ (filter rules that matched, which remove "everyone"; filter beats share)
import type { Band, Connection, Member, RuleKind } from "./types";

export interface Audience {
  everyone: boolean;
  /** Members who can see the doc individually (owners of personal connections). */
  members: string[];
  /** Owners who will get an Inbox card asking to share (review band). Not shared yet. */
  pendingInbox: string[];
}

export interface RuleOutcome {
  ruleId: string;
  ruleName: string;
  ruleVersion: number;
  kind: RuleKind;
  /** null when the judge failed */
  band: Band | null;
  confidence: number | null;
  /** Set when the judge threw or timed out. */
  error?: string;
}

export type StepKind = "connection" | "sharing" | "filter" | "result";

export interface ExplainStep {
  kind: StepKind;
  /** connection id or rule id */
  ref: string;
  label: string;
  version: number | null;
  confidence: number | null;
  op: "∪" | "∩" | "=" | "·";
  effect: string;
}

export interface AudienceContext {
  /** Member ids who turned sharing rules on for their personal content. */
  sharingOptIn: string[];
}

export interface AudienceResult {
  audience: Audience;
  steps: ExplainStep[];
  warnings: string[];
}

const uniq = (xs: string[]) => [...new Set(xs)];

export function computeAudience(
  doc: { connections: Connection[] },
  outcomes: RuleOutcome[],
  ctx: AudienceContext,
): AudienceResult {
  const steps: ExplainStep[] = [];
  const warnings: string[] = [];
  let everyone = false;
  let members: string[] = [];
  let pendingInbox: string[] = [];

  // 1. Default audience per connection, unioned.
  for (const c of doc.connections) {
    if (c.kind === "shared") {
      everyone = true;
      steps.push({ kind: "connection", ref: c.id, label: `${c.tool} (shared connection)`, version: null, confidence: null, op: "∪", effect: "adds Everyone" });
    } else {
      if (c.ownerId) members = uniq([...members, c.ownerId]);
      steps.push({ kind: "connection", ref: c.id, label: `${c.tool} (personal: ${c.ownerId ?? "unknown"})`, version: null, confidence: null, op: "∪", effect: `adds ${c.ownerId ?? "owner"}` });
    }
  }

  const owners = members;
  const sharingOn = owners.some((o) => ctx.sharingOptIn.includes(o));
  let sharedByRule = false;

  // 2. Sharing rules widen, only if an owner turned them on.
  for (const o of outcomes.filter((x) => x.kind === "sharing")) {
    const base = { kind: "sharing" as const, ref: o.ruleId, label: `Sharing: ${o.ruleName}`, version: o.ruleVersion, confidence: o.confidence, op: "∪" as const };
    if (!sharingOn) {
      steps.push({ ...base, effect: "skipped: no owner of this doc turned sharing rules on" });
    } else if (o.error) {
      steps.push({ ...base, effect: `judge error (${o.error}): sharing fails closed, no widening` });
      warnings.push(`Sharing rule "${o.ruleName}" could not be judged, so it failed closed and shared nothing.`);
    } else if (o.band === "auto") {
      if (!everyone) sharedByRule = true;
      everyone = true;
      steps.push({ ...base, effect: "auto match: adds Everyone" });
    } else if (o.band === "review") {
      pendingInbox = uniq([...pendingInbox, ...owners.filter((m) => ctx.sharingOptIn.includes(m))]);
      steps.push({ ...base, effect: "review match: asks the owner in their Inbox (not shared yet)" });
    } else {
      steps.push({ ...base, effect: "no match: no change" });
    }
  }

  // 3. Filter rules narrow, only if the audience could be wider than one owner.
  const couldBeWider = everyone || members.length > 1 || sharingOn;
  for (const o of outcomes.filter((x) => x.kind === "filter")) {
    const base = { kind: "filter" as const, ref: o.ruleId, label: `Filter: ${o.ruleName}`, version: o.ruleVersion, confidence: o.confidence, op: "∩" as const };
    if (!couldBeWider) {
      steps.push({ ...base, effect: "skipped: the doc is private to one owner and no sharing rule is on" });
    } else if (o.error) {
      steps.push({ ...base, effect: `judge error (${o.error}): ingest filters fail open, no restriction applied` });
      warnings.push(`Filter "${o.ruleName}" could not be judged. Ingest filters fail open, so this doc was not restricted.`);
    } else if (o.band && o.band !== "ignore") {
      const hadShare = sharedByRule || pendingInbox.length > 0;
      everyone = false;
      pendingInbox = [];
      sharedByRule = false;
      const fallback = members.length ? `falls back to ${members.join(", ")}` : "shared-only doc: nobody";
      steps.push({ ...base, effect: `match: removes Everyone, ${fallback}${hadShare ? " (filter beats share, no Inbox card)" : ""}` });
    } else {
      steps.push({ ...base, effect: "no match: no change" });
    }
  }

  const audience: Audience = { everyone, members, pendingInbox };
  steps.push({ kind: "result", ref: "final", label: "Final audience", version: null, confidence: null, op: "=", effect: describe(audience) });
  return { audience, steps, warnings };
}

function describe(a: Audience, names: (id: string) => string = (x) => x): string {
  if (a.everyone) return "Everyone";
  if (a.members.length === 0) return "Nobody";
  const who = a.members.map(names);
  const base = who.length === 1 ? `${who[0]} only` : who.join(", ");
  return a.pendingInbox.length ? `${base} · asks ${a.pendingInbox.map(names).join(", ")} in Inbox` : base;
}

export function audienceLabel(a: Audience, members: Member[]): string {
  const byId = new Map(members.map((m) => [m.id, m.name]));
  return describe(a, (id) => byId.get(id) ?? id);
}
