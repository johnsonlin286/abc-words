"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Play } from "lucide-react";
import { buttonPrimary, buttonSecondary, errorText, hint, notice } from "@/components/ui";
import { MIN_PLAYERS, playersNotReady } from "@/shared/game";
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
  // The action bar floats at the bottom of the screen until its own spot scrolls into view;
  // a marker right after it tells whether it is floating, to draw it as a card only then.
  const marker = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const el = marker.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setFloating(!entry!.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        <GameSettingsForm settings={room.settings} isHost={isHost} />
      </div>

      <hr className="border-t-2 border-dashed border-ink/20" />

      {/*
        Sticky: on a phone "Saya siap!" / "Mulai permainan" sit below the seats and the settings,
        so the bar floats at the bottom of the screen until the player scrolls down to it.
        Same padding in both states, so nothing jumps when it settles.
      */}
      <div
        className={`sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 -mx-3 mb-0 flex flex-col gap-2 rounded-2xl border-2 px-3 py-3 transition-[background-color,border-color,box-shadow] sm:flex-row sm:items-center sm:gap-4 ${
          floating ? "border-ink bg-white shadow-[3px_3px_0_var(--color-ink)]" : "border-transparent"
        }`}
      >
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
      {/* mb-0 above and mt-0 here: the marker sits right under the bar, adding no space. */}
      <div ref={marker} aria-hidden className="mt-0 h-px" />
    </div>
  );
}
