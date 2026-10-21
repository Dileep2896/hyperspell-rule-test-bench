import Link from "next/link";
import { notFound } from "next/navigation";
import { TestBench } from "@/components/bench/TestBench";
import { connections } from "@/lib/seed/org";
import { ruleById, seedRules } from "@/lib/seed/rules";

export function generateStaticParams() {
  return seedRules.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rule = ruleById(id);
  return { title: rule ? `${rule.name} · Rule Test Bench` : "Rule Test Bench" };
}

export default async function BenchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rule = ruleById(id);
  if (!rule) notFound();
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
        <Link href="/settings/rules" className="hover:text-slate-300">
          Settings
        </Link>{" "}
        / <Link href="/settings/rules" className="hover:text-slate-300">Content rules</Link> /{" "}
        <span className="text-slate-300">{rule.name}</span>
      </nav>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Rule Test Bench</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Edit the description, label a few examples, and read the verdict. Every edit re-judges instantly, in your browser, with no corpus
          dry run.
        </p>
      </div>
      <TestBench rule={rule} allRules={seedRules} connections={connections} />
    </main>
  );
}
