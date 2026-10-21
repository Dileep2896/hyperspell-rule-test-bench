"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_THRESHOLDS } from "@/lib/bands";
import { explainExample, runBench } from "@/lib/bench";
import { diffVersions } from "@/lib/diff";
import { clearDraft, loadDraft, saveDraft } from "@/lib/store";
import type { Connection, Example, Rule, RuleVersion, Thresholds } from "@/lib/types";
import { AudienceExplainer } from "./AudienceExplainer";
import { ExampleList } from "./ExampleList";
import { PrivacyNote } from "./PrivacyNote";
import { ResultsGrid } from "./ResultsGrid";
import { RuleEditor } from "./RuleEditor";
import { ScoreCard } from "./ScoreCard";
import { StarterPacks } from "./StarterPacks";
import { ThresholdBands } from "./ThresholdBands";
import { VersionDiff } from "./VersionDiff";

const DEBOUNCE_MS = 120;
const FLAKY_EVERY = 4;

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

interface Props {
  rule: Rule;
  allRules: Rule[];
  connections: Connection[];
}

export function TestBench({ rule, allRules, connections }: Props) {
  const [versions, setVersions] = useState<RuleVersion[]>(rule.versions);
  const [loaded, setLoaded] = useState<number>(rule.versions[0]!.version);
  const [description, setDescription] = useState(rule.versions[0]!.description);
  const [examples, setExamples] = useState<Example[]>(rule.examples);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [autoShare, setAutoShare] = useState(rule.autoShare ?? false);
  const [flaky, setFlaky] = useState(false);
  const [explainId, setExplainId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore a per-viewer draft after mount (keeps SSR markup = seed state).
  useEffect(() => {
    const d = loadDraft(rule.id);
    if (d) {
      setVersions(d.versions);
      setDescription(d.description);
      setExamples(d.examples);
      setThresholds(d.thresholds);
      setAutoShare(d.autoShare);
      const match = d.versions.find((v) => v.description === d.description);
      setLoaded(match ? match.version : d.versions[d.versions.length - 1]!.version);
    }
    setHydrated(true);
  }, [rule.id]);

  useEffect(() => {
    if (hydrated) saveDraft(rule.id, { description, examples, versions, thresholds, autoShare });
  }, [hydrated, rule.id, description, examples, versions, thresholds, autoShare]);

  const loadedVersion = versions.find((v) => v.version === loaded) ?? versions[0]!;
  const dirty = description !== loadedVersion.description;
  const nextVersion = Math.max(...versions.map((v) => v.version)) + 1;

  const debDescription = useDebounced(description, DEBOUNCE_MS);
  const debExamples = useDebounced(examples, DEBOUNCE_MS);

  const current: RuleVersion = useMemo(
    () => (debDescription === loadedVersion.description ? loadedVersion : { ...loadedVersion, version: nextVersion, description: debDescription }),
    [debDescription, loadedVersion, nextVersion],
  );
  const run = useMemo(
    () => runBench(current, debExamples, thresholds, flaky ? { flakyEvery: FLAKY_EVERY } : {}),
    [current, debExamples, thresholds, flaky],
  );

  const baseline: RuleVersion | null = useMemo(() => {
    if (current.version !== loadedVersion.version) return loadedVersion;
    const idx = versions.findIndex((v) => v.version === loadedVersion.version);
    return idx > 0 ? versions[idx - 1]! : null;
  }, [current.version, loadedVersion, versions]);

  const diff = useMemo(() => {
    if (!baseline) return null;
    const prev = runBench(baseline, debExamples, thresholds);
    return diffVersions(prev.judgements, run.judgements, debExamples, thresholds);
  }, [baseline, debExamples, thresholds, run.judgements]);

  const explainEx = explainId ? debExamples.find((e) => e.id === explainId) ?? null : null;
  const explanation = useMemo(() => {
    if (!explainEx) return null;
    return explainExample(
      explainEx,
      { rule: current, judgement: run.judgements[explainEx.id] ?? null, thresholds, autoShare },
      allRules,
    );
  }, [explainEx, current, run.judgements, thresholds, autoShare, allRules]);

  const onLoadVersion = (v: number) => {
    const ver = versions.find((x) => x.version === v);
    if (!ver) return;
    setLoaded(v);
    setDescription(ver.description);
  };
  const onSaveVersion = () => {
    const v: RuleVersion = { ...loadedVersion, version: nextVersion, description: description.trim() };
    setVersions((vs) => [...vs, v]);
    setLoaded(v.version);
    setDescription(v.description);
  };
  const onReset = () => {
    clearDraft(rule.id);
    setVersions(rule.versions);
    setLoaded(rule.versions[0]!.version);
    setDescription(rule.versions[0]!.description);
    setExamples(rule.examples);
    setThresholds(DEFAULT_THRESHOLDS);
    setAutoShare(rule.autoShare ?? false);
    setFlaky(false);
  };
  const closeExplain = useCallback(() => setExplainId(null), []);

  const currentLabel = current.version === loadedVersion.version ? `v${current.version}` : `draft v${current.version}`;

  return (
    <div className="space-y-4">
      <PrivacyNote />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <RuleEditor
            name={rule.name}
            kind={rule.kind}
            versions={versions}
            loadedVersion={loaded}
            description={description}
            dirty={dirty}
            onDescription={setDescription}
            onLoadVersion={onLoadVersion}
            onSaveVersion={onSaveVersion}
          />
          <StarterPacks existing={examples} onLoad={(more) => setExamples((xs) => [...xs, ...more])} />
          <ResultsGrid examples={debExamples} rows={run.score.rows} errored={run.errored} onExplain={setExplainId} />
        </div>
        <aside className="min-w-0 space-y-4">
          <ScoreCard score={run.score} elapsedMs={run.elapsedMs} kind={rule.kind} />
          {baseline && <VersionDiff diff={diff} from={`v${baseline.version}`} to={currentLabel} examples={debExamples} />}
          <ThresholdBands kind={rule.kind} rows={run.score.rows} thresholds={thresholds} onChange={setThresholds} />
          {rule.kind === "sharing" && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm">
              <span>
                <span className="font-medium">Automatic sharing</span>
                <span className="block text-xs text-slate-500">New sharing rules start with it off, so every match asks the owner first.</span>
              </span>
              <input type="checkbox" checked={autoShare} onChange={(e) => setAutoShare(e.target.checked)} className="h-5 w-5 accent-emerald-400" />
            </label>
          )}
          <ExampleList
            examples={examples}
            connections={connections}
            onAdd={(e) => setExamples((xs) => [...xs, e])}
            onToggleLabel={(id) => setExamples((xs) => xs.map((x) => (x.id === id ? { ...x, label: x.label === "match" ? "no-match" : "match" } : x)))}
            onRemove={(id) => setExamples((xs) => xs.filter((x) => x.id !== id))}
          />
          <details className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm">
            <summary className="cursor-pointer font-medium">Advanced</summary>
            <label className="mt-3 flex items-center justify-between gap-3">
              <span>
                Flaky judge
                <span className="block text-xs text-slate-500">Simulate a timeout on every {FLAKY_EVERY}th example.</span>
              </span>
              <input type="checkbox" checked={flaky} onChange={(e) => setFlaky(e.target.checked)} className="h-5 w-5 accent-sky-400" />
            </label>
            <p className="mt-3 text-xs leading-relaxed text-sky-200/80">
              Heads up: ingest filters <strong>fail open</strong>. If the judge times out, a doc goes through unfiltered, a known
              failure mode of LLM-judged ingest filters. Sharing rules fail closed and share nothing.
            </p>
            <button type="button" onClick={onReset} className="mt-3 rounded-md px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/15 hover:bg-white/5">
              Reset to seed data
            </button>
          </details>
        </aside>
      </div>
      {flaky && run.errored.size > 0 && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-xl border border-red-400/40 bg-slate-950/95 p-3 text-sm text-red-200 shadow-xl">
          {run.errored.size} judge timeout{run.errored.size === 1 ? "" : "s"}.{" "}
          {rule.kind === "sharing" ? "Sharing failed closed: nothing was shared for those examples." : "Filters fail open at ingest: those docs would go through unfiltered."}
        </div>
      )}
      <AudienceExplainer example={explainEx} explanation={explanation} onClose={closeExplain} />
    </div>
  );
}
