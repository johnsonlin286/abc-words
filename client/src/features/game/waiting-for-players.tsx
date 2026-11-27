"use client";

import { Pause, WifiOff } from "lucide-react";
import { notice } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";
import { useTimeLeft } from "./countdown";

/**
 * Shown while fewer than two players are online: the game stands still (one pause per player per
 * game) or keeps running, and ends when the countdown does.
 */
export default function WaitingForPlayers() {
  const endsAt = useRoomStore((s) => s.waitingEndsAt);
  const paused = useRoomStore((s) => s.room?.state.paused ?? false);
  const left = useTimeLeft(endsAt);
  if (left === null) return null;

  const Icon = paused ? Pause : WifiOff;
  return (
    <div className={`${notice} flex items-center gap-3`}>
      <Icon aria-hidden className="size-7 shrink-0" strokeWidth={2.5} />
      <div className="min-w-0 flex-1">
        <p role="status" className="text-lg font-bold">
          {paused ? "Permainan dijeda" : "Pemain lain terputus"}
        </p>
        <p className="leading-snug">
          Menunggu pemain tersambung lagi.{!paused && " Waktu tetap berjalan."} Permainan berakhir dalam{" "}
          <span className="font-bold tabular-nums">{Math.ceil(left / 1000)} detik</span>.
        </p>
      </div>
    </div>
  );
}
