"use client";

import { useState } from "react";
import { MIN_PLAYERS } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import GameSettingsForm from "./game-settings-form";
import PlayerSeats from "./player-seats";

export default function WaitingRoom({ room, myId }: { room: GameRoomView; myId: string }) {
  const isHost = room.hostId === myId;
  const hostName = room.members.find((m) => m.userId === room.hostId)?.name;
  const startGame = useRoomStore((s) => s.startGame);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enoughPlayers = room.members.filter((m) => m.isConnected).length >= MIN_PLAYERS;
  const categoryMissing = room.settings.category === "custom" && !room.settings.customCategory;
  const canStart = enoughPlayers && !categoryMissing;

  const handleStart = async () => {
    setStarting(true);
    setError(await startGame());
    setStarting(false);
  };

  let status: string | null = null;
  if (!enoughPlayers) status = `Butuh minimal ${MIN_PLAYERS} pemain. Bagikan link undangan ke temanmu.`;
  else if (!isHost) status = `Menunggu ${hostName} memulai permainan.`;
  else if (categoryMissing) status = "Tulis nama kategorinya dulu.";

  return (
    <div className="space-y-6">
      {room.state.endedReason && (
        <p role="status" className="rounded-md border border-chalk-yellow px-3 py-2 text-sm text-chalk">
          {room.state.endedReason}.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <PlayerSeats members={room.members} maxMembers={room.maxMembers} hostId={room.hostId} myId={myId} />
        <GameSettingsForm settings={room.settings} isHost={isHost} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {isHost && (
          <button
            type="button"
            disabled={!canStart || starting}
            onClick={handleStart}
            className="rounded-md bg-chalk-yellow px-5 py-2 font-medium text-board-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk disabled:opacity-50"
          >
            {starting ? "Memulai…" : "Mulai permainan"}
          </button>
        )}
        {status && <p className="text-sm text-chalk-dim">{status}</p>}
        {error && <p className="text-sm text-chalk-yellow">{error}</p>}
      </div>
    </div>
  );
}
