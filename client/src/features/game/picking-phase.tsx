"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Sparks } from "@/components/home/doodles";
import { errorText } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { isAfk } from "./afk";
import Countdown, { useTimeLeft } from "./countdown";
import { HANDS } from "./hands";
import { RoundTitle } from "./round-header";

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
/** Warn a player who hasn't picked once this little time is left. */
const HURRY_MS = 3_000;

/** Three players in highlighter yellow and ink: "the others", in the waiting note. */
function PlayersIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 40" className={className}>
      <g fill="var(--color-highlight)" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round">
        <circle cx="11" cy="14" r="5" />
        <path d="M2 36a9 9 0 0 1 18 0z" />
        <circle cx="37" cy="14" r="5" />
        <path d="M28 36a9 9 0 0 1 18 0z" />
        <circle cx="24" cy="12" r="6.5" />
        <path d="M12 38a12 11 0 0 1 24 0z" />
      </g>
    </svg>
  );
}

export default function PickingPhase({ room }: { room: GameRoomView }) {
  const pickNumber = useRoomStore((s) => s.pickNumber);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const myId = useAuthStore((s) => s.user?.userId);
  const [error, setError] = useState<string | null>(null);

  const { myPick, pickedBy, round } = room.state;
  const handlePick = async (value: number) => setError(await pickNumber(value));
  const left = useTimeLeft(endsAt);
  const hurry = myPick === null && left !== null && left <= HURRY_MS;
  // Same players the server waits for: online and not AFK.
  const waitingFor = room.members.filter(
    (m) => m.userId !== myId && m.isConnected && !isAfk(room.state, m.userId) && !pickedBy.includes(m.userId),
  ).length;
  // First round only: the buttons wiggle once, to say "tap me" to someone new to the game.
  const nudge = round === 1 && myPick === null;

  return (
    <div className="space-y-5">
      <RoundTitle room={room} />

      {endsAt !== null && room.state.phaseMs !== null && (
        <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} urgent={hurry} />
      )}
      <p role="status" className={`text-sm font-bold text-redpen ${hurry ? "" : "sr-only"}`}>
        {hurry ? "Cepat pilih! Kalau tidak, angkamu dipilihkan acak." : ""}
      </p>

      <hr className="border-t-2 border-paper-line" />

      <div>
        <h3 className="relative pl-4 text-3xl font-bold">
          <Sparks className="-top-1.5 -left-1.5 size-6" color="var(--color-highlight)" />
          Pilih{" "}
          <span className="relative inline-block">
            angkamu!
            <span aria-hidden className="absolute inset-x-0 -bottom-1 h-1.5 -rotate-1 rounded-full bg-highlight" />
          </span>
        </h3>
        <p className="mt-3 mb-5 leading-snug text-ink-soft">
          Ketuk satu angka. Angka semua pemain dijumlahkan dan diubah menjadi huruf untuk ronde ini.
        </p>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {NUMBERS.map((n, i) => {
            const picked = myPick === n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`Pilih angka ${n}`}
                aria-pressed={picked}
                onClick={() => handlePick(n)}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 border-ink px-1 pt-3 pb-2 text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[transform,box-shadow,background-color] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen ${
                  // The chosen number stays pressed in, so it reads as chosen without relying on colour.
                  picked
                    ? "translate-x-[2px] translate-y-[2px] bg-highlight shadow-[1px_1px_0_var(--color-ink)]"
                    : "bg-highlight-soft hover:bg-highlight"
                } ${nudge ? "tap-nudge" : ""}`}
                style={nudge ? { animationDelay: `${300 + i * 40}ms` } : undefined}
              >
                {picked && (
                  <span
                    aria-hidden
                    className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border-2 border-ink bg-white"
                  >
                    <Check className="size-3.5" strokeWidth={3.5} />
                  </span>
                )}
                {/*
                  One scale for every hand: each picture is as tall as the widest one (10, two open
                  hands) can be in this button, so 1–5 are drawn exactly as big as the hands in 6–10.
                  69cqw = button width × 160/232 (height/width of the 10 picture).
                */}
                <span className="@container flex w-full justify-center">
                  <Image src={HANDS[n - 1]} alt="" sizes="80px" className="h-[min(5rem,69cqw)] w-auto" />
                </span>
                <span className="text-[2rem] leading-none font-bold tabular-nums sm:text-4xl">{n}</span>
              </button>
            );
          })}
        </div>
        {error && <p className={`${errorText} mt-2`}>{error}</p>}
        <div
          role="status"
          className={
            myPick === null
              ? "sr-only"
              : "mt-5 flex items-center gap-3 rounded-2xl bg-paper-line px-4 py-3"
          }
        >
          {myPick !== null && (
            <>
              <span aria-hidden className="relative shrink-0 pt-2">
                {/* Amber rather than highlighter yellow: the light blue panel washes the lighter yellow out. */}
                <Sparks className="-top-3 left-1/2 size-6 -translate-x-1/2 rotate-45" color="#e0a21b" />
                <PlayersIcon className="h-9 w-11" />
              </span>
              <span aria-hidden className="h-10 w-0.5 shrink-0 rounded-full bg-ink/20" />
              <p className="leading-snug">
                <span className="font-bold">Kamu memilih {myPick}.</span>{" "}
                {waitingFor > 0 ? `Menunggu ${waitingFor} pemain lain… (masih bisa diganti)` : "Semua sudah memilih."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
