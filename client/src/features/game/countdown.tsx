"use client";

import { useEffect, useState } from "react";

/** Time left in the current phase. `endsAt` comes from the server's remaining time. */
export default function Countdown({ endsAt, totalMs }: { endsAt: number; totalMs: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  const left = Math.max(endsAt - now, 0);

  return (
    <div role="timer" className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-board-deep">
        <div
          className="h-full rounded-full bg-chalk-yellow transition-[width] duration-100 ease-linear"
          style={{ width: `${Math.min(left / totalMs, 1) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right text-lg font-medium text-chalk tabular-nums">{Math.ceil(left / 1000)}</span>
    </div>
  );
}
