"use client";

import { useState } from "react";
import { categoryLabel } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown from "./countdown";
import { chalkFont } from "./fonts";

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
const FINGER_HEIGHTS = [9, 13, 15, 13, 8];

/** Up to two small chalk hands, one stroke per raised finger. */
function Fingers({ count }: { count: number }) {
  return (
    <span aria-hidden className="flex h-4 items-end justify-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`w-0.5 rounded-full bg-current ${i === 5 ? "ml-1" : ""}`}
          style={{ height: FINGER_HEIGHTS[i % 5] }}
        />
      ))}
    </span>
  );
}

export default function PickingPhase({ room }: { room: GameRoomView }) {
  const pickNumber = useRoomStore((s) => s.pickNumber);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const [error, setError] = useState<string | null>(null);

  const { myPick, pickedBy, round } = room.state;
  const handlePick = async (value: number) => setError(await pickNumber(value));

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`${chalkFont.className} text-3xl text-chalk`}>
          Ronde {round} dari {room.settings.maxRounds}
        </h2>
        <p className="text-sm text-chalk-dim">Kategori: {categoryLabel(room.settings)}</p>
      </div>

      {endsAt !== null && room.state.phaseMs !== null && <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} />}

      <div>
        <p className="mb-2 text-sm text-chalk">Tunjukkan angkamu</p>
        <div className="grid grid-cols-5 gap-2">
          {NUMBERS.map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Pilih angka ${n}`}
              aria-pressed={myPick === n}
              onClick={() => handlePick(n)}
              className={`flex flex-col items-center gap-1 rounded-md border py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow ${
                myPick === n
                  ? "border-chalk-yellow bg-chalk-yellow text-board-deep"
                  : "border-chalk-dim/50 bg-board-deep text-chalk hover:border-chalk"
              }`}
            >
              <span className="text-xl font-medium tabular-nums">{n}</span>
              <Fingers count={n} />
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-chalk-yellow">{error}</p>}
      </div>

      <ul aria-label="Status pemain" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {room.members.map((m) => {
          const picked = pickedBy.includes(m.userId);
          return (
            <li key={m.userId} className={picked ? "text-chalk" : "text-chalk-dim"}>
              {m.name}: {!m.isConnected ? "terputus" : picked ? "sudah memilih" : "belum memilih"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
