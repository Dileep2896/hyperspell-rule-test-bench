// Small concept lexicon the LocalJudge uses to expand description terms.
// Each group is one concept. A description term pulls in every group that contains it.
//
// Deliberately, "money" and "pay" map ONLY to themselves. A description like
// "Anything about money or pay" therefore matches any text that says "pay" or "money"
// (charity fun runs, vendor invoices), which is exactly the vague-description failure the
// rule-writing guides warn about.

import { tokenize } from "./text";

const RAW_GROUPS: Record<string, string[]> = {
  money: ["money"],
  pay: ["pay"],
  salary: ["salary", "comp", "compensation", "pay band", "wage", "base salary", "offer letter", "raise"],
  band: ["band", "pay band", "level", "ladder"],
  bonus: ["bonus", "commission"],
  equity: ["equity", "option", "rsu", "vesting", "vest", "stock grant"],
  customer: ["customer", "prospect", "client", "account", "buyer", "champion"],
  call: ["call", "meeting", "demo", "discovery", "recording", "transcript"],
  legal: ["legal", "counsel", "attorney", "lawyer", "privileged", "litigation"],
  contract: ["contract", "nda", "redline", "msa", "agreement", "clause"],
  secret: ["secret", "password", "credential", "token", "api key", "private key", "akia"],
  product: ["product", "roadmap", "spec", "feature", "launch"],
  planning: ["planning", "plan", "review", "prioritization", "sprint"],
};

export interface ConceptGroup {
  id: string;
  /** Each term is a list of stemmed tokens. A term matches when all its tokens appear. */
  terms: string[][];
}

const toTerm = (phrase: string) => tokenize(phrase);

export const LEXICON: ConceptGroup[] = Object.entries(RAW_GROUPS).map(([id, phrases]) => ({
  id,
  terms: phrases.map(toTerm),
}));

/**
 * Concept groups for a list of description tokens. A token that appears in no group becomes
 * its own single-term group, so unknown words still count literally.
 */
export function groupsFor(tokens: string[]): ConceptGroup[] {
  const out = new Map<string, ConceptGroup>();
  for (const t of tokens) {
    const hits = LEXICON.filter((g) => g.terms.some((term) => term.length === 1 && term[0] === t));
    if (hits.length === 0) out.set(`lit:${t}`, { id: `lit:${t}`, terms: [[t]] });
    for (const g of hits) out.set(g.id, g);
  }
  return [...out.values()];
}

export function groupMatches(group: ConceptGroup, tokens: ReadonlySet<string>): boolean {
  return group.terms.some((term) => term.every((t) => tokens.has(t)));
}
