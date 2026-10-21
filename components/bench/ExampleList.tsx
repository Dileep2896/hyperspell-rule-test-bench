"use client";
import { useState } from "react";
import type { Connection, Example, ExampleLabel } from "@/lib/types";

interface Props {
  examples: Example[];
  connections: Connection[];
  onAdd: (e: Example) => void;
  onToggleLabel: (id: string) => void;
  onRemove: (id: string) => void;
}

let counter = 0;

export function ExampleList({ examples, connections, onAdd, onToggleLabel, onRemove }: Props) {
  const [text, setText] = useState("");
  const [label, setLabel] = useState<ExampleLabel>("no-match");
  const [conn, setConn] = useState(connections[3]?.id ?? connections[0]!.id);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    counter += 1;
    onAdd({
      id: `mine-${Date.now().toString(36)}-${counter}`,
      title: t.slice(0, 48),
      text: t,
      label,
      source: { connectionIds: [conn] },
      synthetic: true,
    });
    setText("");
  };

  return (
    <section aria-labelledby="examples-h" className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-baseline justify-between">
        <h2 id="examples-h" className="text-sm font-semibold">
          Labeled examples <span className="font-normal text-slate-500">({examples.length})</span>
        </h2>
        <span className="text-xs text-slate-500">
          {examples.filter((e) => e.label === "match").length} should match · {examples.filter((e) => e.label === "no-match").length} should not
        </span>
      </div>
      <form
        className="mt-3 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="new-example" className="sr-only">
          New example snippet
        </label>
        <textarea
          id="new-example"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Write a snippet you'd expect to see, e.g. “I'll pay for lunch today, you get the next one.”"
          className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm placeholder:text-slate-600 focus:border-sky-400/60 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Expected label" className="flex overflow-hidden rounded-md ring-1 ring-white/15">
            {(["match", "no-match"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={label === l}
                onClick={() => setLabel(l)}
                className={`px-2.5 py-1 text-xs ${label === l ? "bg-slate-100 text-slate-950" : "text-slate-300 hover:bg-white/5"}`}
              >
                {l === "match" ? "Should match" : "Should not match"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            from
            <select
              value={conn}
              onChange={(e) => setConn(e.target.value)}
              className="rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tool} {c.kind === "personal" ? `(${c.ownerId})` : "(shared)"}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={!text.trim()} className="ml-auto rounded-md bg-sky-400 px-3 py-1 text-xs font-medium text-slate-950 disabled:opacity-40">
            Add example
          </button>
        </div>
      </form>
      <ul className="mt-3 max-h-[26rem] space-y-1.5 overflow-y-auto pr-1">
        {examples.map((e) => (
          <li key={e.id} className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => onToggleLabel(e.id)}
              title="Toggle expected label"
              className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ring-1 ${
                e.label === "match" ? "text-sky-300 ring-sky-400/40" : "text-slate-400 ring-white/15"
              }`}
            >
              {e.label === "match" ? "match" : "no"}
            </button>
            <span className="min-w-0 flex-1 text-xs leading-relaxed text-slate-300">
              <span className="font-medium text-slate-100">{e.title}</span> · {e.text}
            </span>
            <button
              type="button"
              onClick={() => onRemove(e.id)}
              aria-label={`Remove example ${e.title}`}
              className="shrink-0 rounded px-1 text-slate-600 opacity-0 transition group-hover:opacity-100 hover:text-red-300 focus:opacity-100"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
