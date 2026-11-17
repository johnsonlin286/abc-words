"use client";

import Image from "next/image";
import { useState } from "react";
import PenCircle from "@/components/pen-circle";
import { buttonSecondary, errorText, notice } from "@/components/ui";
import type { RevealInfo } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { isAfk } from "./afk";
import Countdown from "./countdown";
import { HANDS } from "./hands";
import { RoundTitle } from "./round-header";

const STEP_MS = 250;

/**
 * "Hurufnya sulit?": each player picks "Ganti huruf" or "Tetap". More than half of the active
 * players wanting a change replaces the letter; half or more keeping it starts answering at once.
 */
function LetterVote({ room, delayMs }: { room: GameRoomView; delayMs: number }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const setLetterVote = useRoomStore((s) => s.setLetterVote);
  const [error, setError] = useState<string | null>(null);

  // Same rule as the server: online players who aren't AFK.
  const active = room.members.filter((m) => m.isConnected && !isAfk(room.state, m.userId));
  const votes = room.state.letterVotes.filter((id) => active.some((m) => m.userId === id)).length;
  const needed = Math.floor(active.length / 2) + 1;
  const mine =
    myId === undefined
      ? null
      : room.state.letterVotes.includes(myId)
        ? "change"
        : room.state.letterKeeps.includes(myId)
          ? "keep"
          : null;
  const canVote = myId !== undefined && active.some((m) => m.userId === myId);
  const choose = async (choice: "change" | "keep") => setError(await setLetterVote(mine === choice ? null : choice));
  const option = (selected: boolean) => `${buttonSecondary} px-4 py-2 text-sm ${selected ? "bg-highlight-soft" : ""}`;

  return (
    <div className="ink-appear space-y-2" style={{ animationDelay: `${delayMs}ms` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft" aria-live="polite">
          Hurufnya sulit?{" "}
          <span className="font-bold text-ink tabular-nums">
            {votes} dari {needed}
          </span>{" "}
          suara untuk ganti huruf.
        </p>
        {canVote && (
          <div role="group" aria-label="Pilihan huruf" className="flex gap-2">
            <button type="button" aria-pressed={mine === "change"} onClick={() => choose("change")} className={option(mine === "change")}>
              Ganti huruf
            </button>
            <button type="button" aria-pressed={mine === "keep"} onClick={() => choose("keep")} className={option(mine === "keep")}>
              Tetap
            </button>
          </div>
        )}
      </div>
      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

/** Each player's number appears in turn, then the total, then the letter is stamped and circled. */
export default function RevealPhase({ room, reveal }: { room: GameRoomView; reveal: RevealInfo }) {
  const totalDelay = reveal.picks.length * STEP_MS;
  const letterDelay = totalDelay + STEP_MS;
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const myAutoPick = reveal.picks.find((p) => p.userId === myId && p.auto);
  const changed = reveal.changedFrom !== null;
  const stampDelay = changed ? 0 : letterDelay;

  return (
    <div className="space-y-5">
      <RoundTitle room={room} />

      {myAutoPick && (
        <p role="status" className={notice}>
          <span aria-hidden>🎲 </span>
          Kamu tidak memilih angka, jadi server memilihkan <span className="font-bold tabular-nums">{myAutoPick.value}</span>{" "}
          untukmu.
        </p>
      )}

      <div className="grid items-center gap-6 sm:grid-cols-2">
        <div>
          <ul className="flex flex-col">
            {reveal.picks.map((p, i) => (
              <li
                key={p.userId}
                className="ink-appear flex items-center justify-between gap-3 border-b-2 border-paper-line py-1.5"
                style={{ animationDelay: `${i * STEP_MS}ms` }}
              >
                <span className="min-w-0 truncate font-semibold">
                  {p.name}
                  {p.auto && (
                    <span className="ml-1.5 text-sm font-medium text-ink-soft">
                      <span aria-hidden>🎲 </span>acak
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Image src={HANDS[p.value - 1]} alt="" sizes="40px" className="h-7 w-auto" />
                  <span className="w-7 text-right text-xl font-bold tabular-nums">{p.value}</span>
                </span>
              </li>
            ))}
          </ul>
          <p
            className="ink-appear mt-1 flex items-baseline justify-between pt-1"
            style={{ animationDelay: `${totalDelay}ms` }}
          >
            <span className="font-bold">Jumlah</span>
            <span className="text-2xl font-bold tabular-nums">{reveal.total}</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* Keyed by the letter, so a replacement letter is stamped and circled again. */}
          <p
            key={reveal.letter}
            aria-label={`Huruf ronde ini: ${reveal.letter}`}
            className="letter-stamp relative px-3 text-[7.5rem] leading-none font-bold text-redpen"
            style={{ animationDelay: `${stampDelay}ms` }}
          >
            {reveal.letter}
            <PenCircle
              key={reveal.letter}
              draw
              delayMs={stampDelay + 350}
              className="-inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)]"
            />
          </p>
          {changed ? (
            <p role="status" className="ink-appear text-center font-semibold">
              Huruf <s className="text-ink-faint decoration-redpen decoration-[3px]">{reveal.changedFrom}</s> diganti
              menjadi {reveal.letter}.
            </p>
          ) : (
            reveal.skippedFrom && (
              <p className="ink-appear text-center text-sm font-medium text-ink-soft" style={{ animationDelay: `${letterDelay}ms` }}>
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
