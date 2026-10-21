import { BeforeAfter, type StoryDot } from "@/components/story/BeforeAfter";
import { Decision } from "@/components/story/Decision";
import { Hero } from "@/components/story/Hero";
import { Impact } from "@/components/story/Impact";
import { PainPoint } from "@/components/story/PainPoint";
import { Steps } from "@/components/story/Steps";
import { runBench } from "@/lib/bench";
import { compensationRule, customerCallsRule } from "@/lib/seed/rules";

export const metadata = { title: "The story · Rule Test Bench" };

export default function StoryPage() {
  const [v1, v2] = compensationRule.versions;
  const a = runBench(v1!, compensationRule.examples);
  const b = runBench(v2!, compensationRule.examples);
  const [c1, c2] = customerCallsRule.versions;
  const callsBefore = runBench(c1!, customerCallsRule.examples).score.readiness;
  const callsAfter = runBench(c2!, customerCallsRule.examples).score.readiness;

  const dots: StoryDot[] = compensationRule.examples.map((e) => ({
    id: e.id,
    title: e.title,
    label: e.label,
    v1: a.judgements[e.id]!.confidence,
    v2: b.judgements[e.id]!.confidence,
  }));

  const pct = (n: number | null) => Math.round((n ?? 0) * 100);

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <PainPoint />
      <BeforeAfter dots={dots} v1Text={v1!.description} v2Text={v2!.description} />
      <Decision />
      <Steps />
      <Impact
        n={{
          precisionBefore: pct(a.score.precision),
          precisionAfter: pct(b.score.precision),
          fpBefore: a.score.matrix.FP,
          fpAfter: b.score.matrix.FP,
          rescoreMs: Math.max(a.elapsedMs, b.elapsedMs),
          readinessBefore: callsBefore.status === "ready" ? "Ready" : "Not ready: keep auto-share off",
          readinessAfter: callsAfter.status === "ready" ? "Ready to enable auto-share" : "Not ready",
        }}
      />
    </main>
  );
}
