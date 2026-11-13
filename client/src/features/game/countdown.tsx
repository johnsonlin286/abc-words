"use client";

import { useEffect, useState } from "react";

/** Milliseconds left until `endsAt`, updated every 100 ms until it reaches 0. */
export function useTimeLeft(endsAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [endsAt]);

  return endsAt === null ? null : Math.max(endsAt - now, 0);
}

/**
 * Time left in the current phase. `endsAt` comes from the server's remaining time.
 * With `urgent`, the bar turns pink to warn the player.
 */
export default function Countdown({ endsAt, totalMs, urgent = false }: { endsAt: number; totalMs: number; urgent?: boolean }) {
  const left = useTimeLeft(endsAt) ?? 0;

  return (
    <div role="timer" className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-board-deep">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? "bg-chalk-pink" : "bg-chalk-yellow"}`}
          style={{ width: `${Math.min(left / totalMs, 1) * 100}%` }}
        />
      </div>
      <span
        className={`w-8 text-right text-lg font-medium tabular-nums ${urgent ? "text-chalk-pink" : "text-chalk"}`}
      >
        {Math.ceil(left / 1000)}
      </span>
    </div>
  );
}
