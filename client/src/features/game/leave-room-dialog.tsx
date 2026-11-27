"use client";

import { LogOut } from "lucide-react";
import { useRef } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";

/**
 * "Keluar Room" (same as the app): leaves at once in the waiting room, but asks first while a game
 * is running, since a player who leaves can't come back until it is over.
 */
export default function LeaveRoomDialog({ className, playing }: { className?: string; playing: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className={className} onClick={() => (playing ? dialog.current?.showModal() : void leaveRoom())}>
        <LogOut aria-hidden className="size-4" strokeWidth={2.5} />
        Keluar Room
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="leave-room-title"
        aria-describedby="leave-room-desc"
        onClick={(e) => e.target === dialog.current && close()}
        className="paper m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border-2 border-ink p-0 text-ink shadow-[5px_5px_0_var(--color-ink)] backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-4 py-6 pr-5 pl-10 sm:pr-8 sm:pl-14">
          <h2 id="leave-room-title" className="text-2xl font-bold">
            Keluar dari room?
          </h2>
          <p id="leave-room-desc" className="font-medium text-ink-soft">
            Permainan sedang berjalan, jadi kamu tidak bisa masuk lagi sampai selesai.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            {/* First in the DOM so it gets focus: the safe choice is the default. */}
            <button type="button" onClick={close} className={buttonPrimary}>
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                void leaveRoom();
              }}
              className={`${buttonSecondary} border-redpen text-redpen hover:bg-white`}
            >
              Keluar Room
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
