import type { Band, RuleKind, Thresholds } from "./types";

/** Defaults mirror the auto / review / ignore thresholds described for content rules. */
export const DEFAULT_THRESHOLDS: Thresholds = Object.freeze({ auto: 0.75, ignore: 0.45 });

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

export type ThresholdCheck =
  | { ok: true; thresholds: Thresholds }
  | { ok: false; error: string };

export function validateThresholds(t: Thresholds): ThresholdCheck {
  const thresholds = { auto: clamp01(t.auto), ignore: clamp01(t.ignore) };
  if (!(thresholds.ignore < thresholds.auto)) {
    return { ok: false, error: `ignore (${thresholds.ignore}) must be below auto (${thresholds.auto})` };
  }
  return { ok: true, thresholds };
}

export function bandFor(confidence: number, thresholds: Thresholds = DEFAULT_THRESHOLDS): Band {
  const check = validateThresholds(thresholds);
  if (!check.ok) throw new RangeError(check.error);
  const c = clamp01(confidence);
  if (c >= check.thresholds.auto) return "auto";
  if (c < check.thresholds.ignore) return "ignore";
  return "review";
}

/**
 * Whether a rule does something in this band. Filters act on any match ("Filter rules act on
 * any match"); sharing rules share in auto and ask the owner in review.
 */
export function actsOn(_kind: RuleKind, band: Band): boolean {
  return band !== "ignore";
}
