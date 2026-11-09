"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown from "./countdown";
import RoundHeader from "./round-header";

export default function VotingPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const setRejection = useRoomStore((s) => s.setRejection);
  const [error, setError] = useState<string | null>(null);

  const { answers, rejectionsLeft, phaseMs } = room.state;

  return (
    <div className="space-y-4">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && phaseMs !== null && <Countdown endsAt={endsAt} totalMs={phaseMs} />}

      <div>
        <h3 className="font-medium text-chalk">Ada jawaban yang tidak sesuai?</h3>
        <p className="text-sm text-chalk-dim">
          Tolak yang tidak sesuai kategori. Sisa jatah tolakmu: {rejectionsLeft}.
        </p>
      </div>

      <ol className="space-y-2">
        {answers.map((a) => {
          const isMine = a.userId === myId;
          const rejectedByMe = a.rejectedBy.some((r) => r.userId === myId);
          return (
            <li key={a.userId} className="rounded-md bg-board-deep px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium break-words text-chalk">{a.text}</p>
                  <p className="text-xs text-chalk-dim">{isMine ? "Jawabanmu" : a.name}</p>
                </div>
                {!isMine && (
                  <button
                    type="button"
                    aria-pressed={rejectedByMe}
                    aria-label={`${rejectedByMe ? "Batal tolak" : "Tolak"} ${a.text}`}
                    disabled={!rejectedByMe && rejectionsLeft === 0}
                    onClick={async () => setError(await setRejection(a.userId, !rejectedByMe))}
                    className={`shrink-0 rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow disabled:opacity-40 ${
                      rejectedByMe
                        ? "border-chalk-yellow bg-chalk-yellow font-medium text-board-deep"
                        : "border-chalk-dim/50 text-chalk hover:border-chalk disabled:hover:border-chalk-dim/50"
                    }`}
                  >
                    {rejectedByMe ? "Batal tolak" : "Tolak"}
                  </button>
                )}
              </div>
              {a.rejectedBy.length > 0 && (
                <p className="mt-1 text-xs text-chalk-yellow">
                  Ditolak oleh {a.rejectedBy.map((r) => r.name).join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && <p className="text-sm text-chalk-yellow">{error}</p>}
    </div>
  );
}
