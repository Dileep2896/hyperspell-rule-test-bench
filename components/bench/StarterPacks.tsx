"use client";
import { starterPacks } from "@/lib/seed/starterPacks";
import type { Example } from "@/lib/types";

export function StarterPacks({ existing, onLoad }: { existing: Example[]; onLoad: (examples: Example[]) => void }) {
  const have = new Set(existing.map((e) => e.id));
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-slate-500">Synthetic starter packs:</span>
      {starterPacks.map((p) => {
        const fresh = p.examples.filter((e) => !have.has(e.id));
        return (
          <button
            key={p.id}
            type="button"
            disabled={fresh.length === 0}
            onClick={() => onLoad(fresh)}
            className="rounded-full px-2.5 py-1 text-slate-300 ring-1 ring-white/10 transition hover:bg-white/5 disabled:opacity-35"
          >
            + {p.label} {fresh.length > 0 && <span className="text-slate-500">({fresh.length})</span>}
          </button>
        );
      })}
    </div>
  );
}
