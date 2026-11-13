"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { useTimeLeft } from "./countdown";

/** "1:42" for a mute countdown. */
function clock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type PanelSize = "max" | "small" | "closed";

const SIZE_CLASS: Record<Exclude<PanelSize, "closed">, string> = { max: "h-80", small: "h-48" };

export default function ChatPanel() {
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
  const [size, setSize] = useState<PanelSize>("max");
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, size]);

  if (!me) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending || muted) return;
    setSending(true);
    if (await sendMessage(value)) setText("");
    setSending(false);
  };

  if (size === "closed") {
    return (
      <div className="bg-white px-4 py-3 dark:bg-zinc-950">
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:underline"
          onClick={() => {
            setSize("small");
            setReopened(true);
          }}
        >
          Buka obrolan
        </button>
      </div>
    );
  }

  // One button walks max -> small -> closed. Reopening lands on small, where it then grows back to max.
  const stepLabel = size === "max" ? "Kecilkan" : reopened ? "Besarkan" : "Tutup";
  const nextStep = () => {
    if (size === "max") {
      setSize("small");
    } else if (reopened) {
      setSize("max");
      setReopened(false);
    } else {
      setSize("closed");
    }
  };

  return (
    <section aria-label="Obrolan" className={`flex min-h-0 flex-col bg-white dark:bg-zinc-950 ${SIZE_CLASS[size]}`}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <h2 className="text-sm font-medium">Obrolan</h2>
        <button type="button" className="text-xs text-blue-600 hover:underline" onClick={nextStep}>
          {stepLabel}
        </button>
      </div>

      <ul ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) =>
          m.userId === null ? (
            <li key={m.id} className="text-center text-xs text-zinc-400">
              {m.text}
            </li>
          ) : (
            <li key={m.id} className={`flex flex-col ${m.userId === me.userId ? "items-end" : "items-start"}`}>
              <span className="text-xs text-zinc-500">
                {m.userId === me.userId ? "Kamu" : m.name} ·{" "}
                {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span
                className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm break-words ${
                  m.userId === me.userId
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {m.text}
              </span>
            </li>
          ),
        )}
      </ul>

      {connection === "reconnecting" && (
        <p className="px-4 text-xs text-amber-600">Koneksi terputus, menghubungkan ulang…</p>
      )}
      {error && <p className="px-4 text-xs text-red-600">{error}</p>}
      {muted && (
        <p role="status" className="px-4 text-xs text-amber-600">
          Kamu dibisukan karena melanggar aturan chat. Bisa mengirim pesan lagi dalam {clock(mutedMs)}.
        </p>
      )}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <input
          aria-label="Tulis pesan"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={LIMITS.message}
          placeholder={muted ? `Dibisukan · ${clock(mutedMs)}` : "Tulis pesan…"}
          disabled={muted}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || muted}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </section>
  );
}
