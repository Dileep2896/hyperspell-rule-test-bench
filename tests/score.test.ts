import { describe, expect, it } from "vitest";
import { outcomeFor, scoreRule } from "@/lib/score";
import { ex, j, rv } from "./fixtures";
import type { Example, JudgementMap } from "@/lib/types";

function build(spec: Array<[string, Example["label"], number]>) {
  const examples = spec.map(([id, label]) => ex(id, label));
  const judgements: JudgementMap = Object.fromEntries(spec.map(([id, , c]) => [id, j(c)]));
  return { examples, judgements };
}

describe("outcomeFor", () => {
  it("classifies TP / FP / FN / TN from label and band", () => {
    expect(outcomeFor("match", "review")).toBe("TP");
    expect(outcomeFor("no-match", "auto")).toBe("FP");
    expect(outcomeFor("match", "ignore")).toBe("FN");
    expect(outcomeFor("no-match", "ignore")).toBe("TN");
  });
});

describe("scoreRule", () => {
  it("computes the confusion matrix, precision and recall", () => {
    const { examples, judgements } = build([
      ["a", "match", 0.9], ["b", "match", 0.6], ["c", "match", 0.2],
      ["d", "no-match", 0.8], ["e", "no-match", 0.1], ["f", "no-match", 0.3],
    ]);
    const s = scoreRule(rv("filter"), examples, judgements);
    expect(s.matrix).toEqual({ TP: 2, FP: 1, FN: 1, TN: 2 });
    expect(s.precision).toBeCloseTo(2 / 3);
    expect(s.recall).toBeCloseTo(2 / 3);
    expect(s.bands).toEqual({ auto: 2, review: 1, ignore: 3 });
    expect(s.rows.find((r) => r.exampleId === "d")!.outcome).toBe("FP");
  });

  it("returns null precision when nothing is predicted and null recall without positives", () => {
    const { examples, judgements } = build([["x", "no-match", 0.1]]);
    const s = scoreRule(rv("filter"), examples, judgements);
    expect(s.precision).toBeNull();
    expect(s.recall).toBeNull();
  });

  it("re-bands with custom thresholds", () => {
    const { examples, judgements } = build([["a", "match", 0.6], ["b", "no-match", 0.5]]);
    const s = scoreRule(rv("sharing"), examples, judgements, { auto: 0.55, ignore: 0.52 });
    expect(s.bands).toEqual({ auto: 1, review: 0, ignore: 1 });
  });

  it("skips examples that have no judgement yet", () => {
    const { examples, judgements } = build([["a", "match", 0.9]]);
    const s = scoreRule(rv("filter"), [...examples, ex("pending", "match")], judgements);
    expect(s.rows).toHaveLength(1);
  });

  it("counts judge errors separately", () => {
    const { examples, judgements } = build([["a", "match", 0.9]]);
    const s = scoreRule(rv("filter"), [...examples, ex("err", "match")], judgements, undefined, new Set(["err"]));
    expect(s.errors).toBe(1);
  });
});

describe("readiness (sharing rules)", () => {
  const ready: Array<[string, Example["label"], number]> = [
    ["p1", "match", 0.95], ["p2", "match", 0.9], ["p3", "match", 0.85], ["p4", "match", 0.8], ["p5", "match", 0.6],
    ["n1", "no-match", 0.1], ["n2", "no-match", 0.2], ["n3", "no-match", 0.5],
  ];

  it("is ready with auto precision 1.0, >= 5 positives and >= 3 negatives", () => {
    const { examples, judgements } = build(ready);
    const s = scoreRule(rv("sharing"), examples, judgements);
    expect(s.readiness.status).toBe("ready");
    expect(s.autoPrecision).toBe(1);
    expect(s.readiness.reason).toMatch(/4 of 5 positives would auto-share, 1 go to the owner's Inbox, 0 false shares/);
  });

  it("needs examples with fewer than 5 positives", () => {
    const { examples, judgements } = build(ready.filter(([id]) => id !== "p5"));
    const s = scoreRule(rv("sharing"), examples, judgements);
    expect(s.readiness.status).toBe("needs-examples");
    expect(s.readiness.reason).toMatch(/1 more should-match/);
  });

  it("needs examples with fewer than 3 negatives", () => {
    const { examples, judgements } = build(ready.filter(([id]) => id !== "n3"));
    const s = scoreRule(rv("sharing"), examples, judgements);
    expect(s.readiness.status).toBe("needs-examples");
    expect(s.readiness.reason).toMatch(/1 more should-not-match/);
  });

  it("is not ready when a negative lands in the auto band", () => {
    const { examples, judgements } = build([...ready, ["n4", "no-match", 0.8]]);
    const s = scoreRule(rv("sharing"), examples, judgements);
    expect(s.readiness.status).toBe("not-ready");
    expect(s.readiness.reason).toMatch(/1 false share/);
  });

  it("is not ready when no positive reaches the auto band", () => {
    const low: Array<[string, Example["label"], number]> = ready.map(([id, l, c]) => [id, l, l === "match" ? 0.6 : c]);
    const { examples, judgements } = build(low);
    expect(scoreRule(rv("sharing"), examples, judgements).readiness.status).toBe("not-ready");
  });

  it("filter rules only need one example of each label, and are ready with no FP and no FN", () => {
    const { examples, judgements } = build([["p", "match", 0.9], ["n", "no-match", 0.1]]);
    expect(scoreRule(rv("filter"), examples, judgements).readiness.status).toBe("ready");
    const onlyPos = build([["p", "match", 0.9]]);
    const r = scoreRule(rv("filter"), onlyPos.examples, onlyPos.judgements).readiness;
    expect(r.status).toBe("needs-examples");
    expect(r.reason).toBe("Add 1 more should-not-match example to trust this verdict");
  });

  it("filter rules report readiness from precision and recall", () => {
    const { examples, judgements } = build(ready);
    const s = scoreRule(rv("filter"), examples, judgements);
    expect(s.readiness.status).toBe("not-ready");
    expect(s.readiness.reason).toMatch(/false positive/);
  });
});

describe("seed scenario (the demo's spine)", async () => {
  const { compensationRule, customerCallsRule } = await import("@/lib/seed/rules");
  const { LocalJudge } = await import("@/lib/judge/LocalJudge");
  const { judgeAll } = await import("@/lib/judge/judgeAll");
  const judge = new LocalJudge();
  const [v1, v2] = compensationRule.versions;

  it("Compensation v1 has recall 4/4 but precision 4/6 (67%)", () => {
    const s = scoreRule(v1!, compensationRule.examples, judgeAll(judge, v1!, compensationRule.examples));
    expect(s.matrix.TP).toBe(4);
    expect(s.matrix.FP).toBe(2);
    expect(s.matrix.FN).toBe(0);
    expect(s.precision).toBeCloseTo(4 / 6);
    expect(s.recall).toBe(1);
    expect(s.rows.filter((r) => r.outcome === "FP").map((r) => r.exampleId).sort()).toEqual(["figma-invoice", "fun-run"]);
  });

  it("Compensation v2 has precision = recall = 1", () => {
    const s = scoreRule(v2!, compensationRule.examples, judgeAll(judge, v2!, compensationRule.examples));
    expect(s.precision).toBe(1);
    expect(s.recall).toBe(1);
  });

  it("Customer calls (sharing) is ready to enable auto-share at default thresholds", () => {
    const live = customerCallsRule.versions.at(-1)!;
    const s = scoreRule(live, customerCallsRule.examples, judgeAll(judge, live, customerCallsRule.examples));
    expect(s.readiness.status).toBe("ready");
    expect(s.readiness.reason).toMatch(/0 false shares/);
  });
});
