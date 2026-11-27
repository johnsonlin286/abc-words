"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { ChatBody } from "./chat-panel";

/**
 * Chat on phones: a speech-bubble button in the bottom-right corner with the number of new messages
 * from other players, which opens the chat as a sheet from the bottom of the screen. Below the game
 * the inline panel was out of sight on a phone and easy to forget.
 */
export default function ChatDock({ raised = 0 }: { /** Lifts the button over a footer of this height (voting). */ raised?: number }) {
  const me = useAuthStore((s) => s.user);
  const messages = useRoomStore((s) => s.messages);
  const [open, setOpen] = useState(false);
  /** How many messages the player had seen when the sheet was last closed. */
  const [seen, setSeen] = useState(0);

  const seenCount = open ? messages.length : Math.min(seen, messages.length);
  const unread = messages.slice(seenCount).filter((m) => m.userId !== null && m.userId !== me?.userId).length;

  const close = () => {
    setOpen(false);
    setSeen(messages.length);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={unread > 0 ? `Buka obrolan, ${unread} pesan baru` : "Buka obrolan"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={raised ? { bottom: `calc(max(1rem, env(safe-area-inset-bottom)) + ${raised}px)` } : undefined}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full border-2 border-ink bg-highlight text-ink shadow-[3px_3px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)]"
      >
        <MessageCircle aria-hidden className="size-7" strokeWidth={2.5} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 grid min-w-6 place-items-center rounded-full border-2 border-ink bg-redpen px-1 text-xs font-bold text-white tabular-nums"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <button type="button" aria-label="Tutup obrolan" onClick={close} className="absolute inset-0 bg-ink/40" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Obrolan"
            className="note-card relative flex h-[70dvh] flex-col overflow-hidden rounded-b-none pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex shrink-0 items-center justify-between border-b-2 border-ink px-4 py-2">
              <h2 className="font-bold">Obrolan</h2>
              <button
                type="button"
                aria-label="Tutup obrolan"
                onClick={close}
                className="grid size-8 place-items-center rounded-full border-2 border-ink bg-white hover:bg-highlight-soft focus-visible:outline-3 focus-visible:outline-redpen"
              >
                <X aria-hidden className="size-4" strokeWidth={3} />
              </button>
            </div>
            <ChatBody active />
          </section>
        </div>
      )}
    </>
  );
}
