"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Explanation } from "@/lib/bench";
import type { Example } from "@/lib/types";
import { EASE, motionTokens } from "@/lib/motion";

const OP_COLOR: Record<string, string> = { "∪": "text-emerald-300", "∩": "text-red-300", "=": "text-sky-300", "·": "text-slate-400" };

export function AudienceExplainer({ example, explanation, onClose }: { example: Example | null; explanation: Explanation | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(example && explanation);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && example && explanation && (
        <motion.div key="audience" className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="audience-h"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-slate-950 p-5"
            initial={reduce ? false : { x: motionTokens.distance.xl }}
            animate={{ x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: motionTokens.distance.xl, opacity: 0 }}
            transition={{ duration: motionTokens.duration.normal, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Why this audience?</p>
                <h2 id="audience-h" className="mt-1 text-base font-semibold">
                  {example.title}
                </h2>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-white/5" aria-label="Close">
                Esc
              </button>
            </div>
            <ol className="mt-5 space-y-2">
              {explanation.steps.map((s, i) => (
                <motion.li
                  key={`${s.ref}-${i}`}
                  initial={reduce ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : i * motionTokens.stagger, duration: motionTokens.duration.normal, ease: EASE }}
                  className={`flex gap-3 rounded-lg border p-3 ${s.kind === "result" ? "border-sky-400/40 bg-sky-400/5" : "border-white/5 bg-white/[0.02]"}`}
                >
                  <span className={`w-5 shrink-0 text-center font-mono text-lg leading-6 ${OP_COLOR[s.op]}`}>{s.op}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">
                      {s.label}
                      {s.version !== null && <span className="ml-1.5 font-mono text-xs text-slate-500">v{s.version}</span>}
                      {s.confidence !== null && <span className="ml-1.5 font-mono text-xs text-slate-500">{s.confidence.toFixed(2)}</span>}
                    </p>
                    <p className={`text-xs ${s.kind === "result" ? "text-lg font-semibold text-sky-300" : "text-slate-400"}`}>
                      {s.kind === "result" ? explanation.label : s.effect}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
            {explanation.warnings.length > 0 && (
              <div className="mt-4 space-y-1 rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-xs text-red-200">
                {explanation.warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            )}
            <p className="mt-auto pt-6 text-[11px] leading-relaxed text-slate-500">
              Audience algebra: connection defaults are unioned, sharing rules widen (only if an owner opted in), filter
              rules narrow and beat sharing. Sharing fails closed on judge errors; ingest filters fail open.
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
