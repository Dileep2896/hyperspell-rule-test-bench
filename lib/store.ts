// Per-viewer draft persistence. localStorage can be missing or throw (private mode, blocked
// storage), so every access is wrapped and the bench works without it.
import type { Example, RuleVersion, Thresholds } from "./types";

export interface BenchDraft {
  description: string;
  examples: Example[];
  versions: RuleVersion[];
  thresholds: Thresholds;
  autoShare: boolean;
}

const key = (ruleId: string) => `rule-test-bench:draft:${ruleId}`;

export function loadDraft(ruleId: string): BenchDraft | null {
  try {
    const raw = window.localStorage.getItem(key(ruleId));
    return raw ? (JSON.parse(raw) as BenchDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(ruleId: string, draft: BenchDraft): void {
  try {
    window.localStorage.setItem(key(ruleId), JSON.stringify(draft));
  } catch {
    /* storage unavailable: drafts just won't persist */
  }
}

export function clearDraft(ruleId: string): void {
  try {
    window.localStorage.removeItem(key(ruleId));
  } catch {
    /* ignore */
  }
}
