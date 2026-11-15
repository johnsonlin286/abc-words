"use client";

import Image from "next/image";
import { useState } from "react";
import { errorText } from "@/components/ui";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown, { useTimeLeft } from "./countdown";
import { HANDS } from "./hands";
import { RoundTitle } from "./round-header";

const NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
/** Warn a player who hasn't picked once this little time is left. */
const HURRY_MS = 3_000;

export default function PickingPhase({ room }: { room: GameRoomView }) {
  const pickNumber = useRoomStore((s) => s.pickNumber);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const [error, setError] = useState<string | null>(null);

  const { myPick } = room.state;
  const handlePick = async (value: number) => setError(await pickNumber(value));
  const left = useTimeLeft(endsAt);
  const hurry = myPick === null && left !== null && left <= HURRY_MS;

  return (
    <div className="space-y-5">
      <RoundTitle room={room} />

      {endsAt !== null && room.state.phaseMs !== null && (
        <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} urgent={hurry} />
      )}
      <p role="status" className={`text-sm font-bold text-redpen ${hurry ? "" : "sr-only"}`}>
        {hurry ? "Cepat pilih! Kalau tidak, angkamu dipilihkan acak." : ""}
      </p>

      <div>
        <p className="mb-3 text-lg font-bold">Tunjukkan angkamu</p>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {NUMBERS.map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Pilih angka ${n}`}
              aria-pressed={myPick === n}
              onClick={() => handlePick(n)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 border-ink px-1 pt-2.5 pb-2 text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[transform,box-shadow,background-color] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen ${
                myPick === n ? "bg-highlight" : "bg-white hover:bg-highlight-soft"
              }`}
            >
              {/*
                One scale for every hand: each picture is as tall as the widest one (10, two open
                hands) can be in this button, so 1–5 are drawn exactly as big as the hands in 6–10.
                69cqw = button width × 160/232 (height/width of the 10 picture).
              */}
              <span className="@container flex w-full justify-center">
                <Image
                  src={HANDS[n - 1]}
                  alt=""
                  sizes="80px"
                  className="h-[min(5rem,69cqw)] w-auto"
                />
              </span>
              <span className="text-2xl leading-none font-bold tabular-nums sm:text-3xl">{n}</span>
            </button>
          ))}
        </div>
        {error && <p className={`${errorText} mt-2`}>{error}</p>}
      </div>

    </div>
  );
}
