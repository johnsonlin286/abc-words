"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { ChatBody } from "./chat-panel";

/**
 * Chat on phones: a bookmark tab on the right edge of the page, like a marker sticking out of a
 * notebook (owner's choice, 2026-11-28, same as the app; the round button in the corner covered
 * Tolak buttons). It stays in the page margin, shows the number of new messages from other players,
 * and opens the chat as a sheet from the bottom. Below the game the inline panel was out of sight on
 * a phone and easy to forget.
 */
export default function ChatDock() {
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
      {/* 30px wide, a little over the card's edge (same as the app), and the tap area reaches further left. */}
      <button
        type="button"
        aria-label={unread > 0 ? `Buka obrolan, ${unread} pesan baru` : "Buka obrolan"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed top-[58%] right-0 z-30 flex w-[30px] flex-col items-center gap-1 rounded-l-lg border-2 border-r-0 border-ink bg-highlight py-3 text-ink shadow-[0_3px_0_var(--color-ink)] before:absolute before:inset-y-0 before:-left-4 before:w-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen active:translate-x-[2px] active:shadow-[0_1px_0_var(--color-ink)]"
      >
        <MessageCircle aria-hidden className="size-[18px]" strokeWidth={2.5} />
        {unread > 0 && (
          <span
            aria-hidden
            className="grid min-w-4 place-items-center rounded-full bg-redpen px-0.5 text-[11px] font-bold text-white tabular-nums"
          >
            {unread > 99 ? "99+" : unread}
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
