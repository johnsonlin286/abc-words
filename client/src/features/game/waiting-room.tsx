"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";
import { buttonPrimary, buttonSecondary, errorText, hint, notice } from "@/components/ui";
import { MIN_PLAYERS, categoryLabel, playersNotReady, type GameSettings } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import GameSettingsForm from "./game-settings-form";
import PlayerSeats from "./player-seats";

export default function WaitingRoom({ room, myId }: { room: GameRoomView; myId: string }) {
  const isHost = room.hostId === myId;
  const hostName = room.members.find((m) => m.userId === room.hostId)?.name;
  const startGame = useRoomStore((s) => s.startGame);
  const setReady = useRoomStore((s) => s.setReady);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enoughPlayers = room.members.filter((m) => m.isConnected).length >= MIN_PLAYERS;
  const categoryMissing = room.settings.category === "custom" && !room.settings.customCategory;
  // Same rule as the server: every online player other than the host has pressed "Siap".
  const notReady = playersNotReady(room.members, room.hostId, room.state.ready);
  const iAmReady = room.state.ready.includes(myId);
  const canStart = enoughPlayers && !categoryMissing && notReady.length === 0;

  const handleStart = async () => {
    setStarting(true);
    setError(await startGame());
    setStarting(false);
  };

  let status: string | null = null;
  if (!enoughPlayers) status = `Butuh minimal ${MIN_PLAYERS} pemain. Bagikan link undangan ke temanmu.`;
  else if (!isHost) status = iAmReady ? `Kamu sudah siap. Menunggu ${hostName} memulai permainan.` : 'Tekan "Saya siap!" kalau sudah siap bermain.';
  else if (categoryMissing) status = "Tulis nama kategorinya dulu.";
  else if (notReady.length > 0) {
    status = `Menunggu ${notReady.map((m) => m.name).join(", ")} siap. Tekan 🔔 untuk memanggil.`;
  }

  return (
    <div className="space-y-6">
      {room.state.endedReason && (
        <p role="status" className={notice}>
          {room.state.endedReason}.
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
        <PlayerSeats
          members={room.members}
          maxMembers={room.maxMembers}
          hostId={room.hostId}
          myId={myId}
          ready={room.state.ready}
        />
        {/* Only the host can change the rules, so the others just get them in one line. */}
        {isHost ? <GameSettingsForm settings={room.settings} isHost /> : <RulesSummary settings={room.settings} />}
      </div>

      <hr className="border-t-2 border-dashed border-ink/20" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
        {!isHost && (
          <button
            type="button"
            aria-pressed={iAmReady}
            onClick={async () => setError(await setReady(!iAmReady))}
            className={`${iAmReady ? buttonSecondary : buttonPrimary} shrink-0 px-6 py-3 text-lg whitespace-nowrap`}
          >
            {iAmReady ? (
              "Batal siap"
            ) : (
              <>
                <Check aria-hidden className="size-5" strokeWidth={3} />
                Saya siap!
              </>
            )}
          </button>
        )}
        {status && <p className={hint}>{status}</p>}
        {error && <p className={errorText}>{error}</p>}
      </div>
    </div>
  );
}

/** The rules as one line for players who can't change them. */
function RulesSummary({ settings }: { settings: GameSettings }) {
  return (
    <section aria-labelledby="rules-summary-heading">
      <h2 id="rules-summary-heading" className="text-xl font-bold">
        Aturan main
      </h2>
      <p className="mt-2 font-medium text-ink-soft">
        Kategori{" "}
        <span className="rounded-sm bg-highlight-soft px-1.5 font-bold break-words text-ink">
          {categoryLabel(settings) || "belum ditulis"}
        </span>{" "}
        · <span className="font-bold text-ink tabular-nums">{settings.maxRounds}</span> ronde
      </p>
      <p className="mt-1 text-sm text-ink-faint">Diatur oleh host.</p>
    </section>
  );
}
