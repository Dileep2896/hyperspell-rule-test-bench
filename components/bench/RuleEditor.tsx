"use client";
import type { RuleKind, RuleVersion } from "@/lib/types";
import { vaguenessHint } from "@/lib/highlight";

interface Props {
  name: string;
  kind: RuleKind;
  versions: RuleVersion[];
  loadedVersion: number;
  description: string;
  dirty: boolean;
  onDescription: (v: string) => void;
  onLoadVersion: (version: number) => void;
  onSaveVersion: () => void;
}

export function RuleEditor(p: Props) {
  const hint = vaguenessHint(p.description);
  const kindColor = p.kind === "filter" ? "text-red-300 bg-red-400/10 ring-red-400/30" : "text-emerald-300 bg-emerald-400/10 ring-emerald-400/30";
  return (
    <section aria-labelledby="rule-editor-h" className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="rule-editor-h" className="text-lg font-semibold tracking-tight">
          {p.name}
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${kindColor}`}>{p.kind === "filter" ? "Filter rule" : "Sharing rule"}</span>
        <div className="ml-auto flex flex-wrap items-center gap-1" role="group" aria-label="Rule versions">
          {p.versions.map((v) => {
            const active = !p.dirty && v.version === p.loadedVersion;
            return (
              <button
                key={v.version}
                type="button"
                onClick={() => p.onLoadVersion(v.version)}
                aria-pressed={active}
                className={`rounded-md px-2 py-1 font-mono text-xs ring-1 transition ${
                  active ? "bg-sky-400 text-slate-950 ring-sky-400" : "text-slate-300 ring-white/15 hover:bg-white/5"
                }`}
              >
                v{v.version}
              </button>
            );
          })}
          {p.dirty && <span className="rounded-md bg-sky-400/15 px-2 py-1 font-mono text-xs text-sky-300 ring-1 ring-sky-400/40">draft</span>}
        </div>
      </div>
      <label htmlFor="rule-description" className="mt-4 block text-xs font-medium uppercase tracking-wider text-slate-400">
        Description (what the LLM judges content against)
      </label>
      <textarea
        id="rule-description"
        value={p.description}
        onChange={(e) => p.onDescription(e.target.value)}
        rows={3}
        className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-sky-400/60 focus:outline-none"
        placeholder="e.g. Salary figures, compensation bands, bonus and equity for named employees"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {hint ? (
          <p className="text-xs text-sky-300/90">
            <span aria-hidden>⚑ </span>
            {hint}
          </p>
        ) : (
          <p className="text-xs text-slate-500">Concrete description. Back it with examples below.</p>
        )}
        <button
          type="button"
          onClick={p.onSaveVersion}
          disabled={!p.dirty || !p.description.trim()}
          className="ml-auto rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save as v{Math.max(...p.versions.map((v) => v.version)) + 1}
        </button>
      </div>
    </section>
  );
}
