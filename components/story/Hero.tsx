"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

const TOOLS = [
  { name: "Slack", x: 70, y: 60 },
  { name: "Gmail", x: 330, y: 50 },
  { name: "Notion", x: 40, y: 200 },
  { name: "Linear", x: 360, y: 200 },
  { name: "Granola", x: 200, y: 22 },
  { name: "Drive", x: 120, y: 270 },
  { name: "HubSpot", x: 290, y: 272 },
];
const CX = 200;
const CY = 160;

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="hero-h" className="mx-auto grid max-w-screen-xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
      <div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-wrap gap-2 text-xs"
        >
          {["LLM-judged rules", "Filter + share", "No documents read"].map((c) => (
            <span key={c} className="rounded-full px-2.5 py-1 text-slate-300 ring-1 ring-white/15">
              {c}
            </span>
          ))}
        </motion.div>
        <motion.h1
          id="hero-h"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
          className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl"
        >
          One shared index. <span className="text-sky-300">Rules decide who sees what</span>.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="mt-6 font-mono text-lg text-slate-300 sm:text-xl"
        >
          Describe → Test → Trust
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-slate-400"
        >
          AI workspaces pull Slack, Gmail, Notion, Drive and more into one searchable index for people and agents. Plain-language rules,
          judged by an LLM, decide which documents stay private and which get shared. This is a test bench for writing those rules
          with evidence instead of guesswork.
        </motion.p>
      </div>
      <div className="relative mx-auto w-full max-w-md" aria-hidden>
        <svg viewBox="0 0 400 300" className="w-full">
          {TOOLS.map((t, i) => (
            <motion.path
              key={t.name}
              d={`M${t.x},${t.y} Q${(t.x + CX) / 2 + (i % 2 ? 30 : -30)},${(t.y + CY) / 2} ${CX},${CY}`}
              fill="none"
              stroke="rgba(56,189,248,0.45)"
              strokeWidth={1.2}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.4 + i * 0.08 }}
            />
          ))}
          <motion.circle
            cx={CX}
            cy={CY}
            r={34}
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={1.5}
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          {!reduce && (
            <motion.circle
              cx={CX}
              cy={CY}
              r={34}
              fill="none"
              stroke="#38bdf8"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 2.4, repeat: Infinity, delay: 1.6 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
          )}
          <text x={CX} y={CY + 4} textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="600">
            index
          </text>
          {TOOLS.map((t, i) => (
            <motion.g
              key={`chip-${t.name}`}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
            >
              <rect x={t.x - 30} y={t.y - 11} width={60} height={22} rx={11} fill="#020617" stroke="rgba(255,255,255,0.2)" />
              <text x={t.x} y={t.y + 4} textAnchor="middle" fill="#cbd5e1" fontSize="10.5">
                {t.name}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </section>
  );
}
