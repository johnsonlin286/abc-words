import { BadgeCheck } from "lucide-react";

/**
 * An answer found in the category's word list: it passes without a vote and can't be rejected.
 * `compact` is the small inline version next to a player's name.
 */
export default function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-success">
        <BadgeCheck aria-hidden className="size-3.5" strokeWidth={2.75} />
        Terverifikasi
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-success bg-white px-2.5 py-1 text-sm font-bold text-success">
      <BadgeCheck aria-hidden className="size-4" strokeWidth={2.75} />
      Terverifikasi
    </span>
  );
}
