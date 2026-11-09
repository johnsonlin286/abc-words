"use client";

import { useState } from "react";
import { rankPlayers } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { chalkFont } from "./fonts";

export default function FinishedPhase({ room, isHost }: { room: GameRoomView; isHost: boolean }) {
  const endGame = useRoomStore((s) => s.endGame);
  const [error, setError] = useState<string | null>(null);

  const ranking = rankPlayers(room.members, room.state.scores);
  const topScore = ranking[0]?.score ?? 0;
  const winners = topScore > 0 ? ranking.filter((p) => p.score === topScore) : [];
  const hostName = room.members.find((m) => m.userId === room.hostId)?.name;

  return (
    <div className="space-y-6">
      <div className="text-center">
        {winners.length > 0 ? (
          <>
            <p className="text-sm text-chalk-dim">{winners.length > 1 ? "Juara bersama" : "Juaranya"}</p>
            <p
              className={`${chalkFont.className} chalk-write text-6xl leading-tight break-words text-chalk-yellow sm:text-7xl`}
            >
              {winners.map((w) => w.name).join(" & ")}
            </p>
            <p className="text-chalk">{topScore} poin</p>
          </>
        ) : (
          <p className={`${chalkFont.className} text-4xl text-chalk`}>Tidak ada yang mendapat poin</p>
        )}
      </div>

      <ol aria-label="Peringkat" className="space-y-2">
        {ranking.map((p) => (
          <li key={p.userId} className="flex items-center gap-3 rounded-md bg-board-deep px-3 py-2 text-chalk">
            <span className="w-6 text-center font-medium tabular-nums">{p.rank}</span>
            <span className="min-w-0 flex-1 break-all">{p.name}</span>
            <span className="font-medium text-chalk-yellow tabular-nums">{p.score}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {isHost ? (
          <button
            type="button"
            onClick={async () => setError(await endGame())}
            className="rounded-md bg-chalk-yellow px-5 py-2 font-medium text-board-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
          >
            Kembali ke ruang tunggu
          </button>
        ) : (
          <p className="text-sm text-chalk-dim">Menunggu {hostName} kembali ke ruang tunggu.</p>
        )}
        {error && <p className="text-sm text-chalk-yellow">{error}</p>}
      </div>
    </div>
  );
}
