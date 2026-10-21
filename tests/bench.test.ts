import { describe, expect, it } from "vitest";
import { explainExample, runBench } from "@/lib/bench";
import { compensationRule, customerCallsRule, seedRules } from "@/lib/seed/rules";
import { DEFAULT_THRESHOLDS } from "@/lib/bands";

describe("runBench", () => {
  it("judges all examples and scores them in one pass", () => {
    const r = runBench(compensationRule.versions[0]!, compensationRule.examples, DEFAULT_THRESHOLDS);
    expect(Object.keys(r.judgements)).toHaveLength(compensationRule.examples.length);
    expect(r.score.precision).toBeCloseTo(4 / 6);
    expect(r.errored.size).toBe(0);
  });

  it("flaky mode errors every Nth example deterministically and excludes them from the score", () => {
    const r = runBench(compensationRule.versions[1]!, compensationRule.examples, DEFAULT_THRESHOLDS, { flakyEvery: 4 });
    expect([...r.errored]).toEqual([compensationRule.examples[3]!.id, compensationRule.examples[7]!.id]);
    expect(r.score.rows).toHaveLength(compensationRule.examples.length - 2);
    expect(r.score.errors).toBe(2);
  });

  it("is fast enough for live re-scoring (< 100ms for the seed set)", () => {
    const t0 = performance.now();
    runBench(customerCallsRule.versions[1]!, customerCallsRule.examples, DEFAULT_THRESHOLDS);
    expect(performance.now() - t0).toBeLessThan(100);
  });
});

describe("explainExample", () => {
  const funRun = compensationRule.examples.find((e) => e.id === "fun-run")!;

  it("fun-run under Compensation v2 resolves to Priya only (the user story)", () => {
    const v2 = compensationRule.versions[1]!;
    const bench = runBench(v2, compensationRule.examples, DEFAULT_THRESHOLDS);
    const r = explainExample(funRun, { rule: v2, judgement: bench.judgements["fun-run"]!, thresholds: DEFAULT_THRESHOLDS }, seedRules);
    expect(r.label).toBe("Priya only");
    expect(r.steps[0]!.label).toMatch(/Gmail \(personal: priya\)/);
    expect(r.steps.some((s) => s.ref === "customer-calls")).toBe(true);
    expect(r.steps.some((s) => s.ref === "compensation" && s.version === 2)).toBe(true);
  });

  it("fun-run under v1 is also Priya only, because the filter removes nothing from a private doc", () => {
    const v1 = compensationRule.versions[0]!;
    const bench = runBench(v1, compensationRule.examples, DEFAULT_THRESHOLDS);
    const r = explainExample(funRun, { rule: v1, judgement: bench.judgements["fun-run"]!, thresholds: DEFAULT_THRESHOLDS }, seedRules);
    expect(r.label).toBe("Priya only");
  });

  it("a shared Notion comp doc becomes Nobody under the compensation filter", () => {
    const v2 = compensationRule.versions[1]!;
    const q3 = compensationRule.examples.find((e) => e.id === "comp-q3")!;
    const bench = runBench(v2, compensationRule.examples, DEFAULT_THRESHOLDS);
    const r = explainExample(q3, { rule: v2, judgement: bench.judgements["comp-q3"]!, thresholds: DEFAULT_THRESHOLDS }, seedRules);
    expect(r.label).toBe("Nobody");
  });

  it("a customer call with auto-share off asks the owner instead of sharing", () => {
    const v2 = customerCallsRule.versions[1]!;
    const acme = customerCallsRule.examples.find((e) => e.id === "call-acme")!;
    const bench = runBench(v2, customerCallsRule.examples, DEFAULT_THRESHOLDS);
    const ctx = { rule: v2, judgement: bench.judgements["call-acme"]!, thresholds: DEFAULT_THRESHOLDS };
    expect(explainExample(acme, { ...ctx, autoShare: false }, seedRules).label).toBe("Priya only · asks Priya in Inbox");
    expect(explainExample(acme, { ...ctx, autoShare: true }, seedRules).label).toBe("Everyone");
  });

  it("a judge error on the rule under test fails the sharing closed", () => {
    const v2 = customerCallsRule.versions[1]!;
    const acme = customerCallsRule.examples.find((e) => e.id === "call-acme")!;
    const r = explainExample(acme, { rule: v2, judgement: null, thresholds: DEFAULT_THRESHOLDS, autoShare: true }, seedRules);
    expect(r.label).toBe("Priya only");
    expect(r.warnings.join(" ")).toMatch(/failed closed/);
  });
});
