"use client";

import { useState } from "react";
import { REJECT_REASONS, rejectReasonLabel, type GameState, type RejectReason } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown from "./countdown";
import RoundHeader from "./round-header";

type Answer = GameState["answers"][number];

export default function VotingPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const setRejection = useRoomStore((s) => s.setRejection);
  const [error, setError] = useState<string | null>(null);
  /** Answer whose reason picker is open before the rejection is sent. */
  const [choosingFor, setChoosingFor] = useState<string | null>(null);

  const { answers, rejectionsLeft, phaseMs } = room.state;

  const send = async (answerUserId: string, reason: RejectReason | null) => {
    setChoosingFor(null);
    setError(await setRejection(answerUserId, reason));
  };

  return (
    <div className="space-y-4">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && phaseMs !== null && <Countdown endsAt={endsAt} totalMs={phaseMs} />}

      <div>
        <h3 className="font-medium text-chalk">Ada jawaban yang tidak sesuai?</h3>
        <p className="text-sm text-chalk-dim">
          Jawaban yang gugur kehilangan 1 poin. Tolakan yang terbukti benar dikembalikan ke jatahmu. Sisa jatah
          tolakmu: {rejectionsLeft}.
        </p>
      </div>

      <ol className="space-y-2">
        {answers.map((a) => {
          const isMine = a.userId === myId;
          const myRejection = a.rejectedBy.find((r) => r.userId === myId);
          const showReasons = !isMine && (myRejection !== undefined || choosingFor === a.userId);
          return (
            <li key={a.userId} className="rounded-md bg-board-deep px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium break-words text-chalk">{a.text}</p>
                  <p className="text-xs text-chalk-dim">{isMine ? "Jawabanmu" : a.name}</p>
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
                          className={`rounded-full border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow ${
                            selected
                              ? "border-chalk-yellow bg-chalk-yellow/15 text-chalk-yellow"
                              : "border-chalk-dim/50 text-chalk hover:border-chalk"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                  {!myRejection && <p className="mt-1 text-xs text-chalk-dim">Pilih alasan untuk menolak.</p>}
                </fieldset>
              )}

              <RejectedBy answer={a} />
            </li>
          );
        })}
      </ol>

      {error && <p className="text-sm text-chalk-yellow">{error}</p>}
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
      className={`shrink-0 rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow disabled:opacity-40 ${
        rejected
          ? "border-chalk-yellow bg-chalk-yellow font-medium text-board-deep"
          : "border-chalk-dim/50 text-chalk hover:border-chalk disabled:hover:border-chalk-dim/50"
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
    <ul className="mt-1 space-y-0.5 text-xs text-chalk-yellow">
      {answer.rejectedBy.map((r) => (
        <li key={r.userId}>
          Ditolak {r.name}: {rejectReasonLabel(r.reason)}
        </li>
      ))}
    </ul>
  );
}
