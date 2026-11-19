"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import PenCircle from "@/components/pen-circle";
import { errorText, notice } from "@/components/ui";
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
 * One line above the buttons counts both choices against what they need, so a "Tetap" tap visibly counts.
 */
function LetterVote({ room, delayMs }: { room: GameRoomView; delayMs: number }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const setLetterVote = useRoomStore((s) => s.setLetterVote);
  const [error, setError] = useState<string | null>(null);

  // Same rule as the server: online players who aren't AFK.
  const active = room.members.filter((m) => m.isConnected && !isAfk(room.state, m.userId));
  const isActive = (id: string) => active.some((m) => m.userId === id);
  const changes = room.state.letterVotes.filter(isActive).length;
  const keeps = room.state.letterKeeps.filter(isActive).length;
  const changeNeeded = Math.floor(active.length / 2) + 1;
  const keepNeeded = Math.ceil(active.length / 2);
  const mine =
    myId === undefined
      ? null
      : room.state.letterVotes.includes(myId)
        ? "change"
        : room.state.letterKeeps.includes(myId)
          ? "keep"
          : null;
  const canVote = myId !== undefined && isActive(myId);
  const waiting = active.filter(
    (m) => m.userId !== myId && !room.state.letterVotes.includes(m.userId) && !room.state.letterKeeps.includes(m.userId),
  ).length;
  const choose = async (choice: "change" | "keep") => setError(await setLetterVote(mine === choice ? null : choice));

  const options = [
    { id: "change" as const, label: "Ganti huruf", count: changes, needed: changeNeeded },
    { id: "keep" as const, label: "Tetap", count: keeps, needed: keepNeeded },
  ];

  return (
    <div className="ink-appear space-y-3" style={{ animationDelay: `${delayMs}ms` }}>
      <div>
        <h3 className="text-xl font-bold">Hurufnya sulit?</h3>
        <p className="mt-0.5 leading-snug text-ink-soft">
          Pilih ganti huruf atau tetap. Hurufnya diganti kalau {changeNeeded} pemain memilih ganti.
        </p>
      </div>

      <p className="font-semibold tabular-nums" aria-live="polite">
        {options.map((o, i) => (
          <span key={o.id}>
            {i > 0 && <span className="px-2 text-ink-faint">·</span>}
            {o.label}{" "}
            <span className="rounded-sm bg-highlight-soft px-1 font-bold">
              {o.count}/{o.needed}
            </span>
          </span>
        ))}
      </p>

      <div role="group" aria-label="Pilihan huruf" className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const picked = mine === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={picked}
              disabled={!canVote}
              onClick={() => choose(o.id)}
              className={`relative flex items-center justify-center rounded-2xl border-2 border-ink px-3 py-3 text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[transform,box-shadow,background-color] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:cursor-not-allowed disabled:opacity-60 ${
                // The chosen option stays pressed in, so it reads as chosen without relying on colour.
                picked
                  ? "translate-x-[2px] translate-y-[2px] bg-highlight shadow-[1px_1px_0_var(--color-ink)]"
                  : "bg-highlight-soft hover:bg-highlight"
              }`}
            >
              {picked && (
                <span
                  aria-hidden
                  className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-white"
                >
                  <Check className="size-3.5" strokeWidth={3.5} />
                </span>
              )}
              <span className="text-lg font-bold">{o.label}</span>
            </button>
          );
        })}
      </div>

      <p role="status" className={mine === null ? "sr-only" : "font-semibold leading-snug"}>
        {mine !== null &&
          `Kamu memilih ${mine === "change" ? "ganti huruf" : "tetap"}. ${
            waiting > 0 ? `Menunggu ${waiting} pemain lain… (masih bisa diubah)` : "Semua sudah memilih."
          }`}
      </p>
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
