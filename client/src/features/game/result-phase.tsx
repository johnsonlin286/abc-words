import { Check, X } from "lucide-react";
import { POINTS, formatPoints, type Penalty } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";
import RoundHeader from "./round-header";
import VerifiedBadge from "./verified-badge";
import { WarningIcon, strikeLabel } from "./warning-badge";
import { RejectedBy } from "./voting-phase";

const PENALTY_POINTS: Record<Penalty["reason"], number> = {
  "no-answer": POINTS.noAnswer,
  "lone-rejection": POINTS.loneRejection,
};

function penaltyText(p: Penalty): string {
  return p.reason === "no-answer" ? `${p.name} tidak menjawab` : `${p.name} menolak "${p.answerText}" sendirian`;
}

/**
 * The rule's points, so a penalty never looks like "0". When the score could not drop that far
 * (scores never go below 0), a note explains why the score changed less.
 */
function Points({ rule, actual, className }: { rule: number; actual: number; className: string }) {
  return (
    <span className={`shrink-0 text-right ${className}`}>
      <span className="text-lg font-bold tabular-nums">{formatPoints(rule)}</span>
      {actual !== rule && <span className="block text-xs font-medium text-ink-soft">skor tidak bisa minus</span>}
    </span>
  );
}

/** What a lone rejection means for the player, so a warning is never a surprise. */
function StrikeNote({ penalty }: { penalty: Penalty }) {
  const strike = penalty.strike ?? 0;
  const text = penalty.warning
    ? `Belum ada potongan poin. Sekali lagi menolak sendirian dianggap sengaja: ${formatPoints(POINTS.loneRejection)} poin.`
    : `Sudah ${strike}× menolak sendirian, dianggap sengaja (${strikeLabel(strike)}).`;
  return (
    <span className="mt-0.5 block text-xs font-medium text-ink-soft">
      <span aria-hidden>ⓘ </span>
      {text}
    </span>
  );
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
                  <Points
                    rule={a.accepted ? POINTS.accepted : POINTS.rejected}
                    actual={a.points ?? 0}
                    className={a.accepted ? "text-success" : "text-redpen"}
                  />
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
                key={`${p.reason}-${p.userId}-${p.answerText ?? ""}`}
                className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-redpen/50 bg-white px-3.5 py-2 text-sm"
              >
                <span className="min-w-0 font-semibold break-words">
                  {penaltyText(p)}
                  {p.reason === "lone-rejection" && <StrikeNote penalty={p} />}
                </span>
                {p.warning ? (
                  <span className="flex shrink-0 items-center gap-1.5 font-bold tabular-nums">
                    <WarningIcon />
                    Peringatan {strikeLabel(p.strike ?? 0)}
                  </span>
                ) : (
                  <Points rule={PENALTY_POINTS[p.reason]} actual={p.points} className="text-redpen" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
