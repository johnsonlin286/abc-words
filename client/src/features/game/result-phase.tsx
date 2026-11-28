import { Check, X } from "lucide-react";
import { POINTS, formatPoints, type Penalty } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";
import RoundHeader from "./round-header";
import VerifiedBadge from "./verified-badge";
import OtherCategoryNote from "./other-category-note";
import { RejectedBy } from "./voting-phase";

const PENALTY_POINTS: Record<Penalty["reason"], number> = {
  "no-answer": POINTS.noAnswer,
};

type Answer = GameRoomView["state"]["answers"][number];

/** The points the rules give this answer. */
function answerRule(a: Answer): number {
  return a.accepted ? POINTS.accepted : a.judgedByOne ? POINTS.rejectedByOne : POINTS.rejected;
}

function penaltyText(p: Penalty): string {
  return `${p.name} tidak menjawab`;
}

/** The rule's points, so a penalty never looks like "0"; see `FloorNote`. */
function Points({ rule, className }: { rule: number; className: string }) {
  return <span className={`shrink-0 text-right text-lg font-bold tabular-nums ${className}`}>{formatPoints(rule)}</span>;
}

/**
 * Why the score changed less than the points shown: scores never go below 0. It sits under the name,
 * not beside the points, where it squeezed a failed answer into breaking mid-word on a phone.
 */
function FloorNote() {
  return <span className="block text-xs font-medium text-ink-soft">Skor tidak bisa minus.</span>;
}

export default function ResultPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const { answers, penalties } = room.state;

  return (
    <div className="space-y-5">
      <RoundHeader room={room} letter={letter} />

      {answers.length === 0 ? (
        <p className="font-medium text-ink-soft">Tidak ada yang menjawab di ronde ini.</p>
      ) : (
        <ol className="flex flex-col">
          {answers.map((a) => (
            <li key={a.userId} className="ink-appear border-b-2 border-paper-line py-2.5 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {/* Rejected answers are crossed out in red pen. */}
                  <p
                    className={`text-lg font-bold break-words ${a.accepted ? "" : "text-ink-faint line-through decoration-redpen decoration-[3px]"}`}
                  >
                    {a.text}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink-soft">
                    {a.name}
                    {a.verified && <VerifiedBadge compact />}
                  </p>
                  {a.otherCategory && <OtherCategoryNote category={a.otherCategory} />}
                  {(a.points ?? 0) !== answerRule(a) && <FloorNote />}
                </div>
                <span className="flex shrink-0 items-center gap-2 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 font-bold ${
                      a.accepted ? "border-success text-success" : "border-redpen text-redpen"
                    }`}
                  >
                    {a.accepted ? (
                      <Check aria-hidden className="size-3.5" strokeWidth={3.5} />
                    ) : (
                      <X aria-hidden className="size-3.5" strokeWidth={3.5} />
                    )}
                    {a.accepted ? "Lolos" : "Gugur"}
                  </span>
                  <Points rule={answerRule(a)} className={a.accepted ? "text-success" : "text-redpen"} />
                </span>
              </div>
              <RejectedBy answer={a} />
            </li>
          ))}
        </ol>
      )}

      {penalties.length > 0 && (
        <div>
          <h3 className="mb-2 font-bold">Hukuman</h3>
          <ul className="flex flex-col gap-2">
            {penalties.map((p) => (
              <li
                key={`${p.reason}-${p.userId}`}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-redpen/50 bg-white px-3.5 py-2 text-sm"
              >
                <span className="min-w-0 font-semibold break-words">
                  {penaltyText(p)}
                  {p.points !== PENALTY_POINTS[p.reason] && <FloorNote />}
                </span>
                <Points rule={PENALTY_POINTS[p.reason]} className="text-redpen" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
