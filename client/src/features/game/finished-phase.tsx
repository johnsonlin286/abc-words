"use client";

import Image from "next/image";
import { useState } from "react";
import bronze from "@/assets/trophies/bronze.webp";
import gold from "@/assets/trophies/gold.webp";
import silver from "@/assets/trophies/silver.webp";
import { buttonPrimary, errorText, hint } from "@/components/ui";
import { finalRanking, formatAnswerTime } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";

/** Trophy stickers for the top three ranks (ties share a rank, so share a trophy). */
const TROPHIES = [gold, silver, bronze];

export default function FinishedPhase({ room, isHost }: { room: GameRoomView; isHost: boolean }) {
  const endGame = useRoomStore((s) => s.endGame);
  const myId = useAuthStore((s) => s.user?.userId);
  const [error, setError] = useState<string | null>(null);

  // Players who left keep their name and score here.
  const { departed, endedReason } = room.state;
  // Only players still here with points are ranked; players who left come last, without a rank.
  const ranking = finalRanking(room.members, departed, room.state.scores, room.state.speed);
  const ranked = ranking.filter((p) => p.rank !== null);
  const topScore = ranked[0]?.score ?? 0;
  // Only players with points win or get a trophy.
  const winners = ranked.filter((p) => p.rank === 1 && p.score > 0);
  // Same score as the winner but ranked lower: the answer time decided it, so say so.
  const outpaced = winners.length > 0 ? ranked.filter((p) => p.score === topScore && p.rank !== 1) : [];
  const hostName = room.members.find((m) => m.userId === room.hostId)?.name;

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Set only when the game stopped before the last round. */}
        {endedReason && (
          <p className="rounded-xl border-2 border-dashed border-ink/40 bg-highlight-soft px-3.5 py-2 text-sm font-medium">
            {endedReason}.
          </p>
        )}
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
            {outpaced.length > 0 && (
              <p className="max-w-sm font-hand text-lg leading-snug text-redpen">
                Poinnya sama dengan {outpaced.map((p) => p.name).join(" & ")}, tapi rata-rata menjawab lebih cepat.
              </p>
            )}
          </>
        ) : (
          <p className="text-3xl font-bold">Tidak ada yang mendapat poin</p>
        )}
      </div>

      <ol aria-label="Peringkat" className="flex flex-col">
        {ranking.map((p) => (
          // Your own row in highlighter, as in the app.
          <li
            key={p.userId}
            className={`flex items-center gap-3 border-b-2 border-paper-line px-2 py-2.5 last:border-0 ${
              p.userId === myId ? "rounded-lg bg-highlight-soft" : ""
            }`}
          >
            {p.rank !== null && p.score > 0 && p.rank <= TROPHIES.length ? (
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
            ) : p.rank !== null ? (
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink/30 bg-white font-bold text-ink-soft tabular-nums">
                {p.rank}
              </span>
            ) : (
              // Left the game, or no accepted answer: no rank, but the names stay lined up.
              <span aria-hidden className="size-9 shrink-0" />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-lg font-semibold break-all">
                {p.name}
                {p.left && <span className="ml-2 text-sm font-medium text-ink-soft">(keluar)</span>}
              </span>
              {p.avgMs !== null && (
                <span className="text-sm font-medium text-ink-soft">
                  Rata-rata jawab: <span className="tabular-nums">{formatAnswerTime(p.avgMs)}</span>
                </span>
              )}
            </span>
            <span className="text-xl font-bold tabular-nums">{p.score}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-ink/20 pt-5 sm:flex-row sm:items-center sm:gap-4">
        {isHost ? (
          <button type="button" onClick={async () => setError(await endGame())} className={`${buttonPrimary} px-6 py-3`}>
            Kembali ke Ruang Tunggu
          </button>
        ) : (
          <p className={hint}>Menunggu {hostName} kembali ke ruang tunggu.</p>
        )}
        {error && <p className={errorText}>{error}</p>}
      </div>
    </div>
  );
}
