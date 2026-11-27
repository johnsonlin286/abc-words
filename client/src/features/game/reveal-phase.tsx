"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import PenCircle from "@/components/pen-circle";
import { errorText, notice } from "@/components/ui";
import type { RevealInfo } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { isAfk } from "./afk";
import Countdown from "./countdown";
import { HANDS } from "./hands";
import { RoundTitle } from "./round-header";

/** Each player's number appears this long after the one before; then the total, then the letter. */
const STEP_MS = 250;
/** Length of the `letter-stamp` animation (globals.css). */
const STAMP_MS = 450;

type ShowVote = (buttons: HTMLElement | null) => void;

/**
 * "Hurufnya sulit?": each player picks "Ganti huruf" or "Tetap". More than half of the active
 * players wanting a change replaces the letter; half or more keeping it starts answering at once.
 * One line above the buttons counts both choices against what they need, so a "Tetap" tap visibly counts.
 */
function LetterVote({ room, delayMs, onShown }: { room: GameRoomView; delayMs: number; onShown?: ShowVote }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const setLetterVote = useRoomStore((s) => s.setLetterVote);
  const [error, setError] = useState<string | null>(null);

  // On a small phone, or with many players, the buttons may still be below the fold once the letter lands.
  const buttons = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onShown) return;
    const timer = setTimeout(() => onShown(buttons.current), delayMs);
    return () => clearTimeout(timer);
  }, [onShown, delayMs]);

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
    { id: "change" as const, label: "Ganti Huruf", count: changes, needed: changeNeeded },
    { id: "keep" as const, label: "Tetap", count: keeps, needed: keepNeeded },
  ];

  return (
    <div className="ink-appear space-y-2" style={{ animationDelay: `${delayMs}ms` }}>
      <div>
        <h3 className="text-lg font-bold">Hurufnya sulit?</h3>
        {/* One line in one place (as in the app): the rule before voting, who is still deciding after. */}
        <p role="status" className="text-sm leading-snug font-medium text-ink-soft">
          {mine === null
            ? `Diganti kalau ${changeNeeded} pemain memilih ganti.`
            : waiting > 0
              ? `Menunggu ${waiting} pemain lain, masih bisa diubah.`
              : "Semua sudah memilih."}
        </p>
      </div>

      <p className="text-sm font-semibold tabular-nums" aria-live="polite">
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

      <div ref={buttons} role="group" aria-label="Pilihan huruf" className="grid grid-cols-2 gap-3">
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

      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

/**
 * Each player's number appears in turn, then the total, then the letter is stamped and circled.
 * Kept short like the app (two columns of players, the letter beside the total), so the vote buttons
 * under it fit on a small phone without scrolling.
 */
export default function RevealPhase({
  room,
  reveal,
  onVoteShown,
}: {
  room: GameRoomView;
  reveal: RevealInfo;
  /** Called once the stamped letter has landed, so the page can make sure the vote buttons show. */
  onVoteShown?: ShowVote;
}) {
  const totalDelay = reveal.picks.length * STEP_MS;
  const letterDelay = totalDelay + STEP_MS;
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const myAutoPick = reveal.picks.find((p) => p.userId === myId && p.auto);
  const changed = reveal.changedFrom !== null;
  const stampDelay = changed ? 0 : letterDelay;

  return (
    <div className="space-y-3">
      <RoundTitle room={room} />

      {myAutoPick && (
        <p role="status" className={`${notice} py-1 text-sm`}>
          <span aria-hidden>🎲 </span>
          Angkamu dipilihkan acak: <span className="font-bold tabular-nums">{myAutoPick.value}</span>
        </p>
      )}

      <ul className="grid grid-cols-2 gap-x-[6%]">
        {reveal.picks.map((p, i) => (
          <li
            key={p.userId}
            aria-label={`${p.name}: ${p.value}${p.auto ? ", acak" : ""}`}
            className="ink-appear flex items-center gap-1.5 border-b-2 border-paper-line py-1"
            style={{ animationDelay: `${i * STEP_MS}ms` }}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {p.auto && <span aria-hidden>🎲 </span>}
              {p.name}
            </span>
            <Image src={HANDS[p.value - 1]} alt="" sizes="32px" className="h-[22px] w-auto" />
            <span className="w-5 text-right font-bold tabular-nums">{p.value}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center">
        <div className="ink-appear flex flex-1 flex-col items-center text-center" style={{ animationDelay: `${totalDelay}ms` }}>
          <span className="text-sm font-bold">Jumlah</span>
          <span className="text-3xl font-bold tabular-nums">{reveal.total}</span>
          {changed ? (
            <span role="status" className="text-sm font-medium text-ink-soft">
              Huruf <s className="font-bold text-ink-faint decoration-redpen decoration-[3px]">{reveal.changedFrom}</s> diganti
            </span>
          ) : (
            reveal.skippedFrom && (
              <span className="text-sm font-medium text-ink-soft">
                {reveal.skippedFrom} sudah keluar, lompat ke {reveal.letter}.
              </span>
            )
          )}
        </div>
        <div className="flex flex-1 justify-center py-3">
          {/* Keyed by the letter, so a replacement letter is stamped and circled again. Fixed width keeps the loop round around narrow letters like I. */}
          <p
            key={reveal.letter}
            aria-label={`Huruf ronde ini: ${reveal.letter}`}
            className="letter-stamp relative w-20 text-center text-[4rem] leading-[4.5rem] font-bold text-redpen"
            style={{ animationDelay: `${stampDelay}ms` }}
          >
            {reveal.letter}
            <PenCircle key={reveal.letter} draw delayMs={stampDelay + 350} />
          </p>
        </div>
      </div>

      {endsAt !== null && room.state.phaseMs !== null && <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} />}
      {!changed && <LetterVote room={room} delayMs={letterDelay + STAMP_MS} onShown={onVoteShown} />}
    </div>
  );
}
