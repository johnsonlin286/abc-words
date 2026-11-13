"use client";

import type { RevealInfo } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import type { GameRoomView } from "@/stores/room-store";
import { chalkFont } from "./fonts";

const STEP_MS = 250;

/** Each player's number appears in turn, then the total, then the letter is written. */
export default function RevealPhase({ room, reveal }: { room: GameRoomView; reveal: RevealInfo }) {
  const totalDelay = reveal.picks.length * STEP_MS;
  const letterDelay = totalDelay + STEP_MS;
  const myId = useAuthStore((s) => s.user?.userId);
  const myAutoPick = reveal.picks.find((p) => p.userId === myId && p.auto);

  return (
    <div className="space-y-3">
      <h2 className={`${chalkFont.className} text-3xl text-chalk`}>
        Ronde {room.state.round} dari {room.settings.maxRounds}
      </h2>

      {myAutoPick && (
        <p role="status" className="rounded-md border border-chalk-pink/60 px-3 py-2 text-sm text-chalk">
          <span aria-hidden>🎲 </span>
          Kamu tidak memilih angka, jadi server memilihkan{" "}
          <span className="font-medium text-chalk-yellow tabular-nums">{myAutoPick.value}</span> untukmu.
        </p>
      )}

      <div className="grid items-center gap-4 sm:grid-cols-2">
        <div>
          <ul className="space-y-1">
            {reveal.picks.map((p, i) => (
              <li
                key={p.userId}
                className="chalk-appear flex items-baseline justify-between gap-3 text-chalk"
                style={{ animationDelay: `${i * STEP_MS}ms` }}
              >
                <span className="truncate">
                  {p.name}
                  {p.auto && (
                    <span className="ml-1.5 text-sm text-chalk-yellow">
                      <span aria-hidden>🎲 </span>acak
                    </span>
                  )}
                </span>
                <span className="text-lg font-medium tabular-nums">{p.value}</span>
              </li>
            ))}
          </ul>
          <p
            className="chalk-appear mt-2 flex items-baseline justify-between border-t border-chalk-dim/40 pt-2 text-chalk"
            style={{ animationDelay: `${totalDelay}ms` }}
          >
            <span>Jumlah</span>
            <span className="text-lg font-medium tabular-nums">{reveal.total}</span>
          </p>
        </div>

        <div className="text-center">
          <p
            aria-label={`Huruf ronde ini: ${reveal.letter}`}
            className={`${chalkFont.className} chalk-write text-[9rem] leading-none text-chalk-yellow`}
            style={{ animationDelay: `${letterDelay}ms` }}
          >
            {reveal.letter}
          </p>
          {reveal.skippedFrom && (
            <p className="chalk-appear text-sm text-chalk-dim" style={{ animationDelay: `${letterDelay}ms` }}>
              {reveal.skippedFrom} sudah pernah keluar, jadi lompat ke {reveal.letter}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
