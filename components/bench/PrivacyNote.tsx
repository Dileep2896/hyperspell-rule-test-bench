export const PRIVACY_NOTE = "Examples are yours. The bench never reads anyone's documents.";

export function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200/90" role="note">
      <span aria-hidden className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      <span>
        <strong className="font-medium">{PRIVACY_NOTE}</strong>{" "}
        Every snippet here was written by an admin or comes from a synthetic starter pack.
      </span>
    </p>
  );
}
