"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { buttonPrimary, errorText, hint, notice } from "@/components/ui";
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
        <p role="status" className={notice}>
          {room.state.endedReason}.
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
        <PlayerSeats members={room.members} maxMembers={room.maxMembers} hostId={room.hostId} myId={myId} />
        <GameSettingsForm settings={room.settings} isHost={isHost} />
      </div>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-ink/20 pt-5 sm:flex-row sm:items-center sm:gap-4">
        {isHost && (
          <button
            type="button"
            disabled={!canStart || starting}
            onClick={handleStart}
            className={`${buttonPrimary} shrink-0 px-6 py-3 text-lg whitespace-nowrap`}
          >
            <Play aria-hidden className="size-5 fill-current" strokeWidth={2.5} />
            {starting ? "Memulai…" : "Mulai permainan"}
          </button>
        )}
        {status && <p className={hint}>{status}</p>}
        {error && <p className={errorText}>{error}</p>}
      </div>
    </div>
  );
}
