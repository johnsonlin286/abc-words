"use client";

import { useState } from "react";
import {
  LONE_REJECTION_WARNINGS,
  POINTS,
  REJECT_REASONS,
  formatPoints,
  rejectReasonLabel,
  type GameState,
  type RejectReason,
} from "@/shared/game";
import { buttonPrimary, buttonSecondary, errorText } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown from "./countdown";
import { isAfk } from "./afk";
import RoundHeader from "./round-header";
import { WarningIcon, warningText } from "./warning-badge";

type Answer = GameState["answers"][number];

export default function VotingPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const setRejection = useRoomStore((s) => s.setRejection);
  const setVotingDone = useRoomStore((s) => s.setVotingDone);
  const [error, setError] = useState<string | null>(null);
  /** Answer whose reason picker is open before the rejection is sent. */
  const [choosingFor, setChoosingFor] = useState<string | null>(null);

  const { answers, rejectionsLeft, rejectionLimit, votingDone, phaseMs } = room.state;
  const twoPlayers = rejectionLimit === 1;
  // Same rule as the server: online, not AFK, with someone else's answer to judge.
  const judges = room.members.filter(
    (m) => m.isConnected && !isAfk(room.state, m.userId) && answers.some((a) => a.userId !== m.userId),
  );
  const isJudge = judges.some((m) => m.userId === myId);
  const iAmDone = myId !== undefined && votingDone.includes(myId);
  const doneCount = judges.filter((m) => votingDone.includes(m.userId)).length;
  const myLoneRejections = (myId && room.state.loneRejections[myId]) || 0;

  const send = async (answerUserId: string, reason: RejectReason | null) => {
    setChoosingFor(null);
    setError(await setRejection(answerUserId, reason));
  };

  return (
    <div className="space-y-5">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && phaseMs !== null && <Countdown endsAt={endsAt} totalMs={phaseMs} />}

      <div>
        <h3 className="text-lg font-bold">Ada jawaban yang tidak sesuai? Coret!</h3>
        <p className="mt-1 text-sm leading-relaxed font-medium text-ink-soft">
          Jawaban yang gugur {formatPoints(POINTS.rejected)} poin.{" "}
          {twoPlayers
            ? "Main berdua: jatah tolak hanya 1 per permainan dan tidak dikembalikan."
            : `Tolakan yang disetujui pemain lain dikembalikan ke jatahmu. Menolak sendirian jawaban yang tetap lolos, mulai kali ke-${LONE_REJECTION_WARNINGS + 1}: ${formatPoints(POINTS.loneRejection)} poin.`}{" "}
          Sisa jatah tolakmu: <span className="rounded-sm bg-highlight px-1 font-bold text-ink tabular-nums">{rejectionsLeft}</span>.
        </p>
        {!twoPlayers && myLoneRejections >= LONE_REJECTION_WARNINGS && (
          <p className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-redpen">
            <WarningIcon className="mt-0.5 shrink-0" />
            {warningText(myLoneRejections, null)}
          </p>
        )}
      </div>

      <ol className="flex flex-col gap-2.5">
        {answers.map((a) => {
          const isMine = a.userId === myId;
          const myRejection = a.rejectedBy.find((r) => r.userId === myId);
          const showReasons = !isMine && (myRejection !== undefined || choosingFor === a.userId);
          return (
            <li
              key={a.userId}
              className={`rounded-xl border-2 px-3.5 py-2.5 ${a.rejectedBy.length > 0 ? "border-redpen bg-white" : "border-ink/20 bg-white"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold break-words">{a.text}</p>
                  <p className="text-sm font-medium text-ink-soft">{isMine ? "Jawabanmu" : a.name}</p>
                </div>
                {!isMine && (
                  <RejectButton
                    answer={a}
                    rejected={myRejection !== undefined}
                    choosing={choosingFor === a.userId}
                    disabled={myRejection === undefined && rejectionsLeft === 0}
                    onClick={() => {
                      if (myRejection) void send(a.userId, null);
                      else setChoosingFor(choosingFor === a.userId ? null : a.userId);
                    }}
                  />
                )}
              </div>

              {showReasons && (
                <fieldset className="mt-2">
                  <legend className="sr-only">Alasan menolak {a.text}</legend>
                  <div className="flex flex-wrap gap-2">
                    {REJECT_REASONS.map((r) => {
                      const selected = myRejection?.reason === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => !selected && void send(a.userId, r.id)}
                          className={`rounded-full border-2 px-3 py-1 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen ${
                            selected
                              ? "border-redpen bg-redpen text-white"
                              : "border-ink/30 bg-white text-ink-soft hover:border-ink hover:text-ink"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                  {!myRejection && <p className="mt-1.5 text-xs font-medium text-ink-soft">Pilih alasan untuk menolak.</p>}
                </fieldset>
              )}

              <RejectedBy answer={a} />
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft" aria-live="polite">
          {isJudge
            ? `${doneCount} dari ${judges.length} pemain selesai menilai.`
            : "Menunggu pemain lain menilai jawabanmu."}
        </p>
        {isJudge && (
          <button
            type="button"
            aria-pressed={iAmDone}
            onClick={async () => setError(await setVotingDone(!iAmDone))}
            className={iAmDone ? buttonSecondary : buttonPrimary}
          >
            {iAmDone ? "Belum selesai" : "Selesai menilai"}
          </button>
        )}
      </div>

      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

function RejectButton({
  answer,
  rejected,
  choosing,
  disabled,
  onClick,
}: {
  answer: Answer;
  rejected: boolean;
  choosing: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const label = rejected ? "Batal tolak" : choosing ? "Batal" : "Tolak";
  return (
    <button
      type="button"
      aria-expanded={rejected || choosing}
      aria-label={`${label} ${answer.text}`}
      disabled={disabled}
      onClick={onClick}
      className={`shrink-0 rounded-xl border-2 px-3.5 py-1.5 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink-faint ${
        rejected
          ? "border-ink bg-white text-ink hover:bg-highlight-soft"
          : "border-redpen bg-white text-redpen hover:bg-redpen hover:text-white disabled:hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

/** Public votes: who rejected the answer, and why. */
export function RejectedBy({ answer }: { answer: Answer }) {
  if (answer.rejectedBy.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-0.5 font-hand text-base leading-snug text-redpen">
      {answer.rejectedBy.map((r) => (
        <li key={r.userId}>
          Ditolak {r.name}: {rejectReasonLabel(r.reason)}
        </li>
      ))}
    </ul>
  );
}
