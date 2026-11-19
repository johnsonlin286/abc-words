"use client";

import { BellRing, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonPrimary, errorText } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";

/** How long the call stays on screen. */
const SHOW_MS = 8_000;

/**
 * The host called this player from the waiting room: a sound, a vibration (Android; iPhones don't
 * support it) and a note pinned to the top of the screen with a one-tap "Saya siap!".
 * The sound can play because the player has already tapped the page (joining a room needs a tap).
 */
export default function PingAlert({ isReady }: { isReady: boolean }) {
  const ping = useRoomStore((s) => s.ping);
  const clearPing = useRoomStore((s) => s.clearPing);
  const setReady = useRoomStore((s) => s.setReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ping) return;
    new Audio("/sounds/ping.mp3").play().catch(() => {}); // blocked only if the page was never tapped
    navigator.vibrate?.([200, 100, 200]);
    const timer = setTimeout(clearPing, SHOW_MS);
    return () => clearTimeout(timer);
  }, [ping, clearPing]);

  // Nothing to nag about once the player is ready (e.g. pressed it on the page itself).
  useEffect(() => {
    if (isReady) clearPing();
  }, [isReady, clearPing]);

  if (!ping) return null;
  return (
    <div className="fixed inset-x-3 top-3 z-40 mx-auto max-w-md">
      {/* Keyed by the call, so a second call wiggles again. */}
      <div
        key={ping.at}
        role="alert"
        className="tap-nudge flex items-center gap-3 rounded-2xl border-2 border-ink bg-highlight px-4 py-3 shadow-[4px_4px_0_var(--color-ink)]"
      >
        <BellRing aria-hidden className="size-7 shrink-0" strokeWidth={2.5} />
        <p className="min-w-0 flex-1 leading-snug font-semibold">
          <span className="font-bold break-all">{ping.from}</span> memanggilmu!
        </p>
        <button
          type="button"
          onClick={async () => {
            // Send first, close after: closing unmounts this note, so do it only once "Siap" is in.
            const message = await setReady(true);
            setError(message);
            if (!message) clearPing();
          }}
          className={`${buttonPrimary} shrink-0 bg-white px-3 py-1.5 text-sm`}
        >
          Saya siap!
        </button>
        <button type="button" aria-label="Tutup" onClick={clearPing} className="shrink-0 rounded-full p-1 hover:bg-white/60">
          <X aria-hidden className="size-4" strokeWidth={3} />
        </button>
      </div>
      {error && <p className={`${errorText} mt-1 rounded-lg bg-white px-3 py-1`}>{error}</p>}
    </div>
  );
}
