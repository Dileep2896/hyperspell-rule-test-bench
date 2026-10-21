import { describe, expect, it } from "vitest";
import { LocalJudge } from "@/lib/judge/LocalJudge";
import { FlakyJudge, JudgeError } from "@/lib/judge/FlakyJudge";
import { createJudge } from "@/lib/judge/RuleJudge";
import { stem, tokenize, sentences } from "@/lib/judge/text";
import { compensationRule, customerCallsRule, seedRules } from "@/lib/seed/rules";
import { judgeAll } from "@/lib/judge/judgeAll";
import { bandFor } from "@/lib/bands";

const judge = new LocalJudge();
const [compV1, compV2] = compensationRule.versions;

describe("text utilities", () => {
  it("stems plurals and -ing/-ed without mangling short words", () => {
    expect(stem("bands")).toBe("band");
    expect(stem("vesting")).toBe("vest");
    expect(stem("redlines")).toBe("redline");
    expect(stem("boxes")).toBe("box");
    expect(stem("pays")).toBe("pay");
    expect(stem("is")).toBe("is");
    expect(stem("class")).toBe("class");
  });

  it("tokenizes, lowercases and drops stopwords", () => {
    expect(tokenize("Anything about the MONEY or pay")).toEqual(["money", "pay"]);
  });

  it("splits sentences on punctuation and newlines", () => {
    expect(sentences("One. Two!\nThree? four")).toEqual(["One.", "Two!", "Three?", "four"]);
  });
});

describe("LocalJudge", () => {
  it("is deterministic: the same input gives the same output", async () => {
    const snippet = compensationRule.examples[0]!;
    const a = await judge.judge(compV1!, snippet, compensationRule.examples);
    const b = await judge.judge(compV1!, snippet, compensationRule.examples);
    expect(a).toEqual(b);
  });

  it("returns the documented shape with confidence in [0,1] rounded to 2 decimals", async () => {
    for (const e of compensationRule.examples) {
      const r = await judge.judge(compV2!, e, compensationRule.examples);
      expect(r.ruleId).toBe("compensation");
      expect(r.ruleVersion).toBe(2);
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
      expect(Math.round(r.confidence * 100) / 100).toBe(r.confidence);
    }
  });

  it("matches the seed snapshot (stable confidences)", () => {
    const map = judgeAll(judge, compV1!, compensationRule.examples);
    const flat = Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.confidence]));
    expect(flat).toMatchSnapshot();
  });

  it("v1 'money or pay' over-matches the fun-run and the Figma invoice with pay/money passages", () => {
    const map = judgeAll(judge, compV1!, compensationRule.examples);
    expect(map["fun-run"]!.matched).toBe(true);
    expect(map["figma-invoice"]!.matched).toBe(true);
    expect(map["fun-run"]!.passage).toMatch(/pay|money/i);
    expect(map["figma-invoice"]!.passage).toMatch(/pay|money/i);
  });

  it("v2 does not match the fun-run or the invoice", () => {
    const map = judgeAll(judge, compV2!, compensationRule.examples);
    expect(map["fun-run"]!.matched).toBe(false);
    expect(map["figma-invoice"]!.matched).toBe(false);
  });

  it("passage is null when confidence is below the ignore threshold", () => {
    const map = judgeAll(judge, compV2!, compensationRule.examples);
    for (const r of Object.values(map)) {
      if (bandFor(r.confidence) === "ignore") expect(r.passage).toBeNull();
      else expect(r.passage).not.toBeNull();
    }
  });

  it("excludes the snippet under test from its own neighbors", () => {
    const e = compensationRule.examples[0]!;
    const withSelf = judge.judgeSync(compV2!, e, compensationRule.examples);
    const withoutSelf = judge.judgeSync(compV2!, e, compensationRule.examples.filter((x) => x.id !== e.id));
    expect(withSelf).toEqual(withoutSelf);
  });

  it("judges on content, not titles", () => {
    const e = { ...compensationRule.examples[0]!, title: "Anything about money or pay" , text: "Team offsite agenda and dinner plans." };
    const r = judge.judgeSync(compV1!, e, []);
    expect(r.matched).toBe(false);
  });

  it("returns a zero-confidence judgement for an empty description", () => {
    const r = judge.judgeSync({ ...compV2!, description: "   " }, compensationRule.examples[0]!, []);
    expect(r).toMatchObject({ matched: false, confidence: 0, passage: null });
  });

  it("every seed rule's live version reaches recall 1 on its own examples", () => {
    for (const rule of seedRules) {
      const live = rule.versions[rule.versions.length - 1]!;
      const map = judgeAll(judge, live, rule.examples);
      for (const e of rule.examples.filter((x) => x.label === "match")) {
        expect(map[e.id]!.matched, `${rule.id}/${e.id}`).toBe(true);
      }
    }
  });

  it("sharing seed: customer-calls puts most positives in auto and some in review", () => {
    const live = customerCallsRule.versions.at(-1)!;
    const map = judgeAll(judge, live, customerCallsRule.examples);
    const pos = customerCallsRule.examples.filter((e) => e.label === "match");
    const auto = pos.filter((e) => bandFor(map[e.id]!.confidence) === "auto").length;
    const review = pos.filter((e) => bandFor(map[e.id]!.confidence) === "review").length;
    expect(auto).toBeGreaterThanOrEqual(5);
    expect(review).toBeGreaterThanOrEqual(1);
  });
});

describe("FlakyJudge", () => {
  it("throws JudgeError on every Nth call and delegates otherwise", async () => {
    const flaky = new FlakyJudge(new LocalJudge(), 3);
    const e = compensationRule.examples[0]!;
    await expect(flaky.judge(compV2!, e, [])).resolves.toBeDefined();
    await expect(flaky.judge(compV2!, e, [])).resolves.toBeDefined();
    await expect(flaky.judge(compV2!, e, [])).rejects.toBeInstanceOf(JudgeError);
    await expect(flaky.judge(compV2!, e, [])).resolves.toBeDefined();
  });

  it("rejects N < 1", () => {
    expect(() => new FlakyJudge(new LocalJudge(), 0)).toThrow();
  });
});

describe("createJudge", () => {
  it("defaults to LocalJudge without an API key", () => {
    expect(createJudge({}).name).toBe("local");
  });

  it("stays local when llm is requested but no key is set", () => {
    expect(createJudge({ RULE_JUDGE: "llm" }).name).toBe("local");
  });

  it("selects the LLM judge only with RULE_JUDGE=llm and a key", () => {
    expect(createJudge({ RULE_JUDGE: "llm", ANTHROPIC_API_KEY: "test-key" }).name).toBe("llm");
  });
});
