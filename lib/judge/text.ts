// Tiny, dependency-free text pipeline for the LocalJudge: tokenize → stem → drop stopwords.

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can do does for from had has have he her his i if in into is it its " +
    "me my no not of on or our she so than that the their them then there these they this those to up us " +
    "was we were what when where which who will with you your all any just also about over out off per via " +
    // filler words that show up in rule descriptions but carry no topic
    "anything something everything stuff thing content document doc related other named specific " +
    "figure detail info information mention discussion employee people person"
  ).split(/\s+/),
);

/** Light stemmer: strips s / es / ing / ed. Deliberately simple and predictable. */
export function stem(word: string): string {
  let w = word.toLowerCase();
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 4 && /(s|x|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w;
}

export function rawWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function isStopword(word: string): boolean {
  return STOPWORDS.has(word) || STOPWORDS.has(stem(word));
}

export function tokenize(text: string): string[] {
  return rawWords(text)
    .filter((w) => !STOPWORDS.has(w))
    .map(stem)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}
