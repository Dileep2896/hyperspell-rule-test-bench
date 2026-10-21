import { describe, expect, it } from "vitest";
import { audienceLabel, computeAudience, type RuleOutcome } from "@/lib/audience";
import type { Connection, Member } from "@/lib/types";

const members: Member[] = [
  { id: "priya", name: "Priya" },
  { id: "marco", name: "Marco" },
];
const drive: Connection = { id: "drive", tool: "Google Drive", kind: "shared" };
const notion: Connection = { id: "notion", tool: "Notion", kind: "shared" };
const granola: Connection = { id: "granola-priya", tool: "Granola", kind: "personal", ownerId: "priya" };
const gmailMarco: Connection = { id: "gmail-marco", tool: "Gmail", kind: "personal", ownerId: "marco" };

const share = (band: RuleOutcome["band"], confidence = 0.9): RuleOutcome => ({
  ruleId: "customer-calls", ruleName: "Customer calls", ruleVersion: 3, kind: "sharing", band, confidence,
});
const filter = (band: RuleOutcome["band"], confidence = 0.9): RuleOutcome => ({
  ruleId: "compensation", ruleName: "Compensation", ruleVersion: 2, kind: "filter", band, confidence,
});

describe("computeAudience — default audiences", () => {
  it("a shared connection gives everyone", () => {
    const { audience } = computeAudience({ connections: [notion] }, [], { sharingOptIn: [] });
    expect(audience).toEqual({ everyone: true, members: [], pendingInbox: [] });
  });

  it("a personal connection gives the owner only", () => {
    const { audience } = computeAudience({ connections: [granola] }, [], { sharingOptIn: [] });
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: [] });
  });

  it("a multi-connection doc (shared drive + personal) keeps the union", () => {
    const { audience } = computeAudience({ connections: [drive, granola] }, [], { sharingOptIn: [] });
    expect(audience.everyone).toBe(true);
    expect(audience.members).toEqual(["priya"]);
  });
});

describe("computeAudience — the docs' 'what changes' rows", () => {
  it("row 1: shared-only doc + filter match → nobody", () => {
    const { audience } = computeAudience({ connections: [notion] }, [filter("review")], { sharingOptIn: [] });
    expect(audience).toEqual({ everyone: false, members: [], pendingInbox: [] });
    expect(audienceLabel(audience, members)).toBe("Nobody");
  });

  it("row 2: personal doc + sharing auto match → everyone", () => {
    const { audience } = computeAudience({ connections: [granola] }, [share("auto")], { sharingOptIn: ["priya"] });
    expect(audience.everyone).toBe(true);
    expect(audience.pendingInbox).toEqual([]);
  });

  it("row 3: personal doc + sharing review match → owner + pending Inbox card", () => {
    const { audience } = computeAudience({ connections: [granola] }, [share("review", 0.6)], { sharingOptIn: ["priya"] });
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: ["priya"] });
    expect(audienceLabel(audience, members)).toBe("Priya only · asks Priya in Inbox");
  });

  it("row 4: sharing + filter both match → owner only, never an Inbox item (filter beats share)", () => {
    const { audience, steps } = computeAudience(
      { connections: [granola] }, [share("auto"), filter("auto")], { sharingOptIn: ["priya"] },
    );
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: [] });
    expect(steps.some((s) => /filter beats share/i.test(s.effect))).toBe(true);
    const r = computeAudience({ connections: [granola] }, [share("review"), filter("review")], { sharingOptIn: ["priya"] });
    expect(r.audience.pendingInbox).toEqual([]);
  });

  it("row 5: purely private doc with no sharing turned on → filters are skipped", () => {
    const { audience, steps } = computeAudience({ connections: [granola] }, [filter("auto")], { sharingOptIn: [] });
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: [] });
    expect(steps.find((s) => s.ref === "compensation")!.effect).toMatch(/skipped/i);
  });

  it("row 6: sharing rules are skipped when no owner turned them on", () => {
    const { audience, steps } = computeAudience({ connections: [granola] }, [share("auto")], { sharingOptIn: ["marco"] });
    expect(audience.everyone).toBe(false);
    expect(steps.find((s) => s.ref === "customer-calls")!.effect).toMatch(/skipped/i);
  });

  it("row 7: shared + personal doc with a filter match falls back to the personal owner", () => {
    const { audience } = computeAudience({ connections: [drive, granola] }, [filter("auto")], { sharingOptIn: [] });
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: [] });
  });

  it("a sharing ignore-band result changes nothing", () => {
    const { audience } = computeAudience({ connections: [granola] }, [share("ignore", 0.1)], { sharingOptIn: ["priya"] });
    expect(audience).toEqual({ everyone: false, members: ["priya"], pendingInbox: [] });
  });

  it("two personal owners keep both owners after a filter", () => {
    const { audience } = computeAudience({ connections: [granola, gmailMarco] }, [filter("auto")], { sharingOptIn: [] });
    expect(audience.members).toEqual(["priya", "marco"]);
    expect(audienceLabel(audience, members)).toBe("Priya, Marco");
  });
});

describe("computeAudience — judge errors", () => {
  it("JudgeError on a sharing rule fails closed: no widening", () => {
    const err: RuleOutcome = { ...share(null, 0), confidence: null, error: "timeout" };
    const { audience, steps } = computeAudience({ connections: [granola] }, [err], { sharingOptIn: ["priya"] });
    expect(audience.everyone).toBe(false);
    expect(audience.pendingInbox).toEqual([]);
    expect(steps.find((s) => s.ref === "customer-calls")!.effect).toMatch(/fail(s|ed)? closed/i);
  });

  it("JudgeError on a filter rule fails open and raises a warning", () => {
    const err: RuleOutcome = { ...filter(null, 0), confidence: null, error: "timeout" };
    const { audience, warnings } = computeAudience({ connections: [notion] }, [err], { sharingOptIn: [] });
    expect(audience.everyone).toBe(true);
    expect(warnings.join(" ")).toMatch(/fail open/i);
  });
});

describe("computeAudience — explain steps", () => {
  it("every rule step names the rule, its version, its confidence and its effect", () => {
    const { steps } = computeAudience(
      { connections: [granola] }, [share("auto", 0.91), filter("ignore", 0.12)], { sharingOptIn: ["priya"] },
    );
    const ruleSteps = steps.filter((s) => s.kind === "sharing" || s.kind === "filter");
    expect(ruleSteps).toHaveLength(2);
    for (const s of ruleSteps) {
      expect(s.ref).toBeTruthy();
      expect(s.version).toBeGreaterThan(0);
      expect(typeof s.confidence).toBe("number");
      expect(s.effect.length).toBeGreaterThan(0);
    }
    expect(steps.at(-1)!.kind).toBe("result");
  });

  it("starts with one connection step per connection", () => {
    const { steps } = computeAudience({ connections: [drive, granola] }, [], { sharingOptIn: [] });
    expect(steps.filter((s) => s.kind === "connection").map((s) => s.ref)).toEqual(["drive", "granola-priya"]);
  });
});

describe("audienceLabel", () => {
  it("names everyone, nobody and members", () => {
    expect(audienceLabel({ everyone: true, members: [], pendingInbox: [] }, members)).toBe("Everyone");
    expect(audienceLabel({ everyone: false, members: [], pendingInbox: [] }, members)).toBe("Nobody");
    expect(audienceLabel({ everyone: false, members: ["marco"], pendingInbox: [] }, members)).toBe("Marco only");
  });
});
