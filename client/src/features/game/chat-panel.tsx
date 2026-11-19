"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { buttonPrimary, input } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";
import { useTimeLeft } from "./countdown";

/** "1:42" for a mute countdown. */
function clock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type PanelSize = "max" | "small" | "closed";

const toggleClass =
  "rounded-sm text-sm font-semibold text-ink underline decoration-highlight decoration-2 underline-offset-4 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen";

/** Heights the panel slides between; "closed" leaves only the header bar. */
const SIZE_CLASS: Record<PanelSize, string> = { max: "h-80", small: "h-48", closed: "h-[2.875rem]" };

/** Inline chat card for wider screens; phones get `ChatDock` instead. */
export default function ChatPanel() {
  const [size, setSize] = useState<PanelSize>("max");
  const [reopened, setReopened] = useState(false);

  // One button walks max -> small -> closed. Reopening lands on small, where it then grows back to max.
  const closed = size === "closed";
  const stepLabel = closed ? "Buka obrolan" : size === "max" ? "Kecilkan" : reopened ? "Besarkan" : "Tutup";
  const nextStep = () => {
    if (closed) {
      setSize("small");
      setReopened(true);
    } else if (size === "max") {
      setSize("small");
    } else if (reopened) {
      setSize("max");
      setReopened(false);
    } else {
      setSize("closed");
    }
  };

  return (
    // The height slides between sizes (instantly with reduced motion). When closed, the body
    // stays mounted (so the draft and scroll position survive) but is inert and clipped away.
    <section
      aria-label="Obrolan"
      className={`note-card flex min-h-0 flex-col overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none ${SIZE_CLASS[size]}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b-2 border-ink px-4 py-2">
        <h2 className="font-bold">Obrolan</h2>
        <button type="button" aria-expanded={!closed} className={toggleClass} onClick={nextStep}>
          {stepLabel}
        </button>
      </div>

      <div inert={closed} className="flex min-h-0 flex-1 flex-col">
        <ChatBody active={!closed} />
      </div>
    </section>
  );
}

/** The messages, status lines and the message form. `active` re-scrolls to the newest message when shown. */
export function ChatBody({ active }: { active: boolean }) {
  const me = useAuthStore((s) => s.user);
  const messages = useRoomStore((s) => s.messages);
  const error = useRoomStore((s) => s.error);
  const sendMessage = useRoomStore((s) => s.sendMessage);
  const connection = useRoomStore((s) => s.connection);
  const mutedMs = useTimeLeft(useRoomStore((s) => s.chatMutedUntil)) ?? 0;
  const muted = mutedMs > 0;

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, active]);

  if (!me) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending || muted) return;
    setSending(true);
    if (await sendMessage(value)) setText("");
    setSending(false);
  };

  return (
    <>
      <ul ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) =>
          m.userId === null ? (
            <li key={m.id} className="text-center text-xs font-medium text-ink-faint">
              {m.text}
            </li>
          ) : (
            <li key={m.id} className={`flex flex-col ${m.userId === me.userId ? "items-end" : "items-start"}`}>
              <span className="text-xs font-medium text-ink-soft">
                {m.userId === me.userId ? "Kamu" : m.name} ·{" "}
                {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span
                className={`max-w-[80%] rounded-2xl border-2 border-ink px-3 py-1.5 text-sm font-medium break-words ${
                  m.userId === me.userId ? "rounded-br-sm bg-highlight-soft" : "rounded-bl-sm bg-white"
                }`}
              >
                {m.text}
              </span>
            </li>
          ),
        )}
      </ul>

      {connection === "reconnecting" && (
        <p className="px-4 text-xs font-semibold text-ink-soft">Koneksi terputus, menghubungkan ulang…</p>
      )}
      {error && <p className="px-4 text-xs font-semibold text-redpen">{error}</p>}
      {muted && (
        <p role="status" className="px-4 text-xs font-semibold text-redpen">
          Kamu dibisukan karena melanggar aturan chat. Bisa mengirim pesan lagi dalam {clock(mutedMs)}.
        </p>
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t-2 border-ink/15 p-3">
        <input
          aria-label="Tulis pesan"
          className={`${input} min-w-0 flex-1 py-2 text-sm disabled:bg-paper`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={LIMITS.message}
          placeholder={muted ? `Dibisukan · ${clock(mutedMs)}` : "Tulis pesan…"}
          disabled={muted}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || muted}
          className={`${buttonPrimary} px-4 py-2 text-sm`}
        >
          Kirim
        </button>
      </form>
    </>
  );
}
