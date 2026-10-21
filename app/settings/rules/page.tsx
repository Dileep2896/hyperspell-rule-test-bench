import Link from "next/link";
import { runBench } from "@/lib/bench";
import { DEFAULT_THRESHOLDS } from "@/lib/bands";
import { seedRules } from "@/lib/seed/rules";
import type { Rule } from "@/lib/types";
import { PrivacyNote } from "@/components/bench/PrivacyNote";

export const metadata = { title: "Content rules · Rule Test Bench" };

const READY = {
  ready: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/40",
  "not-ready": "bg-red-400/10 text-red-300 ring-red-400/40",
  "needs-examples": "bg-sky-400/10 text-sky-300 ring-sky-400/40",
} as const;
const READY_LABEL = { ready: "Ready", "not-ready": "Not ready", "needs-examples": "Needs examples" } as const;

function RuleRow({ rule }: { rule: Rule }) {
  const live = rule.versions[rule.versions.length - 1]!;
  const { score } = runBench(live, rule.examples, DEFAULT_THRESHOLDS);
  const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);
  return (
    <li>
      <Link
        href={`/settings/rules/${rule.id}`}
        className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-sky-400/40 hover:bg-slate-900 sm:flex-row sm:items-center"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{rule.name}</span>
            <span className="font-mono text-xs text-slate-500">v{live.version}</span>
            {rule.kind === "sharing" && (
              <span className="rounded-full px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-white/10">auto-share {rule.autoShare ? "on" : "off"}</span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-400">{live.description}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-slate-400">
            P {pct(score.precision)} · R {pct(score.recall)} · {rule.examples.length} examples
          </span>
          <span className={`rounded-full px-2 py-0.5 ring-1 ${READY[score.readiness.status]}`}>{READY_LABEL[score.readiness.status]}</span>
          <span aria-hidden className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-300">
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function RulesPage() {
  const filters = seedRules.filter((r) => r.kind === "filter");
  const sharing = seedRules.filter((r) => r.kind === "sharing");
  return (
    <main className="mx-auto max-w-screen-xl space-y-8 px-4 py-6 sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Content rules</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Filter rules narrow who can see a document. Sharing rules widen it, with the owner&apos;s consent. Open a rule to test it against
          labeled examples before it touches real content.
        </p>
      </div>
      <PrivacyNote />
      <section aria-labelledby="filters-h">
        <h2 id="filters-h" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden /> Filter rules
        </h2>
        <ul className="space-y-2">
          {filters.map((r) => (
            <RuleRow key={r.id} rule={r} />
          ))}
        </ul>
      </section>
      <section aria-labelledby="sharing-h">
        <h2 id="sharing-h" className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Sharing rules
        </h2>
        <ul className="space-y-2">
          {sharing.map((r) => (
            <RuleRow key={r.id} rule={r} />
          ))}
        </ul>
      </section>
    </main>
  );
}
