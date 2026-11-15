"use client";

import Image from "next/image";
import { useState } from "react";
import bronze from "@/assets/trophies/bronze.webp";
import gold from "@/assets/trophies/gold.webp";
import silver from "@/assets/trophies/silver.webp";
import { buttonPrimary, errorText, hint } from "@/components/ui";
import { rankPlayers } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";

/** Trophy stickers for the top three ranks (ties share a rank, so share a trophy). */
const TROPHIES = [gold, silver, bronze];

export default function FinishedPhase({ room, isHost }: { room: GameRoomView; isHost: boolean }) {
  const endGame = useRoomStore((s) => s.endGame);
  const [error, setError] = useState<string | null>(null);

  const ranking = rankPlayers(room.members, room.state.scores);
  const topScore = ranking[0]?.score ?? 0;
  const winners = topScore > 0 ? ranking.filter((p) => p.score === topScore) : [];
  const hostName = room.members.find((m) => m.userId === room.hostId)?.name;

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center gap-3 text-center">
        {winners.length > 0 ? (
          <>
            <Image src={gold} alt="" sizes="96px" loading="eager" className="letter-stamp h-24 w-auto" />
            <p className="font-hand text-xl text-redpen">{winners.length > 1 ? "Juara bersama!" : "Juaranya!"}</p>
            <p className="text-5xl leading-tight font-bold break-words sm:text-6xl">
              <span className="relative isolate inline-block">
                <span
                  aria-hidden
                  className="absolute -inset-x-2 top-[45%] bottom-1 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
                />
                {winners.map((w) => w.name).join(" & ")}
              </span>
            </p>
            <p className="text-lg font-bold">
              <span className="tabular-nums">{topScore}</span> poin
            </p>
          </>
        ) : (
          <p className="text-3xl font-bold">Tidak ada yang mendapat poin</p>
        )}
      </div>

      <ol aria-label="Peringkat" className="flex flex-col">
        {ranking.map((p) => (
          <li key={p.userId} className="flex items-center gap-3 border-b-2 border-paper-line py-2.5 last:border-0">
            {p.score > 0 && p.rank <= TROPHIES.length ? (
              <span className="flex h-10 w-9 shrink-0 items-end justify-center">
                {/* Silver and bronze are drawn smaller than gold; keep that difference. */}
                <Image
                  src={TROPHIES[p.rank - 1]}
                  alt={`Peringkat ${p.rank}`}
                  sizes="40px"
                  className="w-auto"
                  style={{ height: `${(TROPHIES[p.rank - 1].height / gold.height) * 2.5}rem` }}
                />
              </span>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink/30 bg-white font-bold text-ink-soft tabular-nums">
                {p.rank}
              </span>
            )}
            <span className="min-w-0 flex-1 text-lg font-semibold break-all">{p.name}</span>
            <span className="text-xl font-bold tabular-nums">{p.score}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-ink/20 pt-5 sm:flex-row sm:items-center sm:gap-4">
        {isHost ? (
          <button type="button" onClick={async () => setError(await endGame())} className={`${buttonPrimary} px-6 py-3`}>
            Kembali ke ruang tunggu
          </button>
        ) : (
          <p className={hint}>Menunggu {hostName} kembali ke ruang tunggu.</p>
        )}
        {error && <p className={errorText}>{error}</p>}
      </div>
    </div>
  );
}
