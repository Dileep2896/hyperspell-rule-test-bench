/** Split text into [before, passage, after] so the UI can <mark> the triggering sentence. */
export function splitOnPassage(text: string, passage: string | null): [string, string, string] {
  if (!passage) return [text, "", ""];
  const i = text.indexOf(passage);
  if (i < 0) return [text, "", ""];
  return [text.slice(0, i), passage, text.slice(i + passage.length)];
}

/** Words a description is vague about. Drives the "weak → better" hint. */
const VAGUE = /\b(anything|stuff|things?|related|sensitive|misc|general|money|pay)\b/i;

export function vaguenessHint(description: string): string | null {
  const words = description.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Describe what the rule should catch.";
  if (VAGUE.test(description))
    return "Vague descriptions produce vague matches. Name concrete things, e.g. \"salary figures, compensation bands, bonus and equity for named employees\".";
  if (words.length < 3) return "Short descriptions over-match. Add the concrete things you mean, and back them with examples.";
  return null;
}
