import type { Example, Judgement, RuleVersion } from "../types";
import type { RuleJudge } from "./RuleJudge";

export class JudgeError extends Error {
  constructor(message = "Judge timed out") {
    super(message);
    this.name = "JudgeError";
  }
}

/** Demo/test wrapper: fails on every Nth call, deterministically, to show fail-closed sharing. */
export class FlakyJudge implements RuleJudge {
  readonly name: string;
  private calls = 0;

  constructor(private readonly inner: RuleJudge, private readonly everyN: number) {
    if (!Number.isInteger(everyN) || everyN < 1) throw new RangeError("everyN must be an integer >= 1");
    this.name = `flaky(${inner.name}, 1/${everyN})`;
  }

  async judge(rule: RuleVersion, snippet: Example, neighbors?: readonly Example[]): Promise<Judgement> {
    this.calls += 1;
    if (this.calls % this.everyN === 0) throw new JudgeError(`Simulated judge timeout on call ${this.calls}`);
    return this.inner.judge(rule, snippet, neighbors);
  }
}
