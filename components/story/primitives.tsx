"use client";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE, motionTokens } from "@/lib/motion";

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: motionTokens.distance.lg }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: motionTokens.duration.story, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300/80">{eyebrow}</p>
        <h2 id={`${id}-h`} className="mt-3 max-w-4xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      <div className="mt-10 sm:mt-14">{children}</div>
    </section>
  );
}

/** Counts from `from` to `to` when scrolled into view. Reduced motion shows `to` at once. */
export function Counter({ from, to, suffix = "", className = "", testId }: { from: number; to: number; suffix?: string; className?: string; testId?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? to : from);
  useEffect(() => {
    if (reduce) {
      setShown(to);
      return;
    }
    if (!inView) return;
    const c = animate(from, to, { duration: 1.4, ease: EASE, delay: 0.2, onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, from, to]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`} data-testid={testId} data-final={`${to}${suffix}`}>
      {shown}
      {suffix}
    </span>
  );
}

export function Cite({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-slate-300">
      {children}
    </a>
  );
}
