import { Check } from "lucide-react";
import { CATEGORIES } from "@/shared/game";

/** Three short pen strokes fanning out from a corner: the "look here!" mark from a kid's notebook. */
export function Sparks({ className, color = "var(--color-redpen)" }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`pointer-events-none absolute size-6 ${className ?? ""}`}>
      <g data-anim="spark" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M4 14 1 13" />
        <path d="M7 8 4 4" />
        <path d="M13 6 14 1" />
      </g>
    </svg>
  );
}

/** A yellow pencil lying across the corner of the category note. */
function Pencil({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 120" className={className}>
      <g stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="8" y="2" width="24" height="16" rx="5" fill="#f4a3b4" />
        <rect x="8" y="16" width="24" height="8" fill="#c9ced9" />
        <path d="M8 24h24v66H8z" fill="var(--color-highlight)" />
        <path d="M20 24v66" fill="none" />
        <path d="M8 90 20 116 32 90z" fill="#f6dcb0" />
        <path d="m16.5 108.5 3.5 7.5 3.5-7.5z" fill="var(--color-ink)" />
      </g>
    </svg>
  );
}

const LISTED = ["hewan", "negara", "merek", "kota", "bebas"] as const;

/**
 * A torn-off note of the categories a room can play, ticked in red pen with a pencil on it.
 * Decoration on wider screens; the categories themselves are chosen in the room settings.
 */
export function CategoryNote({ className }: { className?: string }) {
  const labels = LISTED.map((id) => CATEGORIES.find((c) => c.id === id)!.label);
  return (
    <div data-anim="note-card" aria-hidden className={className ?? "relative"}>
      <div className="note-card relative w-52 rotate-3 px-5 pt-6 pb-5">
        {/* Spiral holes along the top */}
        <span className="absolute inset-x-4 -top-1.5 flex justify-between">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="h-3 w-1.5 rounded-full border-2 border-ink bg-paper" />
          ))}
        </span>
        <p className="mb-3 inline-block rounded-sm bg-highlight px-2 text-xl font-bold">Kategori</p>
        <ul className="space-y-2">
          {labels.map((label, i) => (
            <li key={label} className={`${i >= 3 ? "hidden sm:flex" : "flex"} items-center gap-2.5 border-b border-paper-line pb-1 font-hand text-lg`}>
              <span className="relative grid size-5 shrink-0 place-items-center rounded-[4px] border-2 border-ink">
                <Check data-anim="tick" className="absolute -top-1 -right-1 size-5 text-redpen" strokeWidth={3.5} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <Pencil className="absolute -right-5 -bottom-6 h-28 rotate-[28deg]" />
    </div>
  );
}
