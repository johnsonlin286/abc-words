"use client";

import { useState } from "react";
import type { RevealInfo } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { isAfk } from "./afk";
import Countdown from "./countdown";
import { chalkFont } from "./fonts";

const STEP_MS = 250;

/** "Hurufnya sulit?": players vote to replace the letter; more than half of the active players changes it. */
function LetterVote({ room, delayMs }: { room: GameRoomView; delayMs: number }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const setLetterVote = useRoomStore((s) => s.setLetterVote);
  const [error, setError] = useState<string | null>(null);

  // Same rule as the server: online players who aren't AFK.
  const active = room.members.filter((m) => m.isConnected && !isAfk(room.state, m.userId));
  const votes = room.state.letterVotes.filter((id) => active.some((m) => m.userId === id)).length;
  const needed = Math.floor(active.length / 2) + 1;
  const iVoted = myId !== undefined && room.state.letterVotes.includes(myId);
  const canVote = myId !== undefined && active.some((m) => m.userId === myId);

  return (
    <div className="chalk-appear space-y-2" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-chalk-dim" aria-live="polite">
          Hurufnya sulit? {votes} dari {needed} suara untuk ganti huruf.
        </p>
        {canVote && (
          <button
            type="button"
            aria-pressed={iVoted}
            onClick={async () => setError(await setLetterVote(!iVoted))}
            className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow ${
              iVoted
                ? "border border-chalk-dim/50 text-chalk hover:border-chalk"
                : "border border-chalk-yellow text-chalk-yellow hover:bg-chalk-yellow/10"
            }`}
          >
            {iVoted ? "Batal ganti" : "Ganti huruf"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-chalk-yellow">{error}</p>}
    </div>
  );
}

/** Each player's number appears in turn, then the total, then the letter is written. */
export default function RevealPhase({ room, reveal }: { room: GameRoomView; reveal: RevealInfo }) {
  const totalDelay = reveal.picks.length * STEP_MS;
  const letterDelay = totalDelay + STEP_MS;
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const myAutoPick = reveal.picks.find((p) => p.userId === myId && p.auto);
  const changed = reveal.changedFrom !== null;

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
          {/* Keyed by the letter, so a replacement letter is written again. */}
          <p
            key={reveal.letter}
            aria-label={`Huruf ronde ini: ${reveal.letter}`}
            className={`${chalkFont.className} chalk-write text-[9rem] leading-none text-chalk-yellow`}
            style={{ animationDelay: `${changed ? 0 : letterDelay}ms` }}
          >
            {reveal.letter}
          </p>
          {changed ? (
            <p role="status" className="chalk-appear text-sm text-chalk">
              Huruf {reveal.changedFrom} diganti menjadi {reveal.letter}.
            </p>
          ) : (
            reveal.skippedFrom && (
              <p className="chalk-appear text-sm text-chalk-dim" style={{ animationDelay: `${letterDelay}ms` }}>
                {reveal.skippedFrom} sudah pernah keluar, jadi lompat ke {reveal.letter}.
              </p>
            )
          )}
        </div>
      </div>

      {endsAt !== null && room.state.phaseMs !== null && <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} />}
      {!changed && <LetterVote room={room} delayMs={letterDelay} />}
    </div>
  );
}
