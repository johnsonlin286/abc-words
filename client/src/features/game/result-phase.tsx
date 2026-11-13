import { POINTS, formatPoints, type Penalty } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";
import RoundHeader from "./round-header";
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
      <span className="font-medium">{formatPoints(rule)}</span>
      {actual !== rule && <span className="block text-xs font-normal text-chalk-dim">skor tidak bisa minus</span>}
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
    <span className="mt-0.5 block text-xs text-chalk-dim/80">
      <span aria-hidden>ⓘ </span>
      {text}
    </span>
  );
}

export default function ResultPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const { answers, penalties } = room.state;

  return (
    <div className="space-y-4">
      <RoundHeader room={room} letter={letter} />

      {answers.length === 0 ? (
        <p className="text-chalk">Tidak ada yang menjawab di ronde ini.</p>
      ) : (
        <ol className="space-y-2">
          {answers.map((a) => (
            <li key={a.userId} className="rounded-md bg-board-deep px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-medium break-words ${a.accepted ? "text-chalk" : "text-chalk-dim line-through"}`}>
                    {a.text}
                  </p>
                  <p className="text-xs text-chalk-dim">{a.name}</p>
                </div>
                <span className="flex shrink-0 items-baseline gap-1.5 text-sm">
                  <span className={a.accepted ? "text-chalk-yellow" : "text-chalk-pink"}>
                    {a.accepted ? "Lolos" : "Gugur"}
                  </span>
                  <Points
                    rule={a.accepted ? POINTS.accepted : POINTS.rejected}
                    actual={a.points ?? 0}
                    className={a.accepted ? "text-chalk-yellow" : "text-chalk-pink"}
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
          <h3 className="mb-1 text-sm font-medium text-chalk">Hukuman</h3>
          <ul className="space-y-1">
            {penalties.map((p) => (
              <li
                key={`${p.reason}-${p.userId}-${p.answerText ?? ""}`}
                className="flex items-center justify-between gap-3 rounded-md bg-board-deep px-3 py-1.5 text-sm"
              >
                <span className="min-w-0 break-words text-chalk-dim">
                  {penaltyText(p)}
                  {p.reason === "lone-rejection" && <StrikeNote penalty={p} />}
                </span>
                {p.warning ? (
                  <span className="flex shrink-0 items-center gap-1.5 font-medium text-chalk-yellow tabular-nums">
                    <WarningIcon />
                    Peringatan {strikeLabel(p.strike ?? 0)}
                  </span>
                ) : (
                  <Points rule={PENALTY_POINTS[p.reason]} actual={p.points} className="text-chalk-pink" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
