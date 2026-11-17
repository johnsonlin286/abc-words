"use client";

import { Flag } from "lucide-react";
import { useRef, useState } from "react";
import { buttonPrimary, buttonSecondary, errorText } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";

/**
 * Host-only "Akhiri permainan": sits in the room bar, away from the phase buttons and the chat,
 * and asks for confirmation because ending sends everyone to the final scores.
 */
export default function EndGameDialog({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const endGame = useRoomStore((s) => s.endGame);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => dialog.current?.close();
  const confirm = async () => {
    setBusy(true);
    const message = await endGame();
    setBusy(false);
    setError(message);
    if (!message) close();
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setError(null);
          dialog.current?.showModal();
        }}
      >
        <Flag aria-hidden className="size-4" strokeWidth={2.5} />
        Akhiri permainan
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="end-game-title"
        aria-describedby="end-game-desc"
        onClick={(e) => e.target === dialog.current && close()}
        className="paper m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border-2 border-ink p-0 text-ink shadow-[5px_5px_0_var(--color-ink)] backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-4 py-6 pr-5 pl-10 sm:pr-8 sm:pl-14">
          <h2 id="end-game-title" className="text-2xl font-bold">
            Akhiri permainan?
          </h2>
          <p id="end-game-desc" className="font-medium text-ink-soft">
            Semua pemain langsung melihat skor akhir. Skor dihitung sampai ronde ini.
          </p>
          {error && <p className={errorText}>{error}</p>}
          <div className="flex flex-wrap gap-3 pt-1">
            {/* First in the DOM so it gets focus: the safe choice is the default. */}
            <button type="button" onClick={close} className={buttonPrimary}>
              Lanjut main
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className={`${buttonSecondary} border-redpen text-redpen hover:bg-white`}
            >
              Ya, akhiri
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
