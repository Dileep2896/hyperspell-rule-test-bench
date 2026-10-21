import { describe, expect, it } from "vitest";
import { diffVersions } from "@/lib/diff";
import { ex, j } from "./fixtures";
import { compensationRule } from "@/lib/seed/rules";
import { LocalJudge } from "@/lib/judge/LocalJudge";
import { judgeAll } from "@/lib/judge/judgeAll";

describe("diffVersions", () => {
  const examples = [ex("fp", "no-match"), ex("fn", "match"), ex("newfp", "no-match"), ex("newfn", "match"), ex("same", "match")];
  const prev = { fp: j(0.9), fn: j(0.1), newfp: j(0.1), newfn: j(0.9), same: j(0.9) };
  const next = { fp: j(0.1), fn: j(0.9), newfp: j(0.9), newfn: j(0.1), same: j(0.95) };

  it("classifies fixed FP, fixed FN, new FP and new FN", () => {
    const d = diffVersions(prev, next, examples);
    expect(d.fixedFP).toEqual(["fp"]);
    expect(d.fixedFN).toEqual(["fn"]);
    expect(d.newFP).toEqual(["newfp"]);
    expect(d.newFN).toEqual(["newfn"]);
    expect(d.changed).toBe(4);
  });

  it("summarises the change in one sentence", () => {
    const d = diffVersions(prev, next, examples);
    expect(d.summary).toBe("fixed 1 false positive and 1 missed match, introduced 1 false positive, lost 1 true positive");
  });

  it("ignores examples missing from either side", () => {
    const d = diffVersions({ fp: j(0.9) }, {}, [ex("fp", "no-match")]);
    expect(d.changed).toBe(0);
    expect(d.summary).toBe("no outcome changed");
  });

  it("seed: v1 → v2 fixes the fun-run and Figma false positives and loses nothing", () => {
    const judge = new LocalJudge();
    const [v1, v2] = compensationRule.versions;
    const d = diffVersions(
      judgeAll(judge, v1!, compensationRule.examples),
      judgeAll(judge, v2!, compensationRule.examples),
      compensationRule.examples,
    );
    expect(d.fixedFP.sort()).toEqual(["figma-invoice", "fun-run"]);
    expect(d.newFN).toEqual([]);
    expect(d.newFP).toEqual([]);
    expect(d.summary).toBe("fixed 2 false positives, lost 0 true positives");
  });
});
