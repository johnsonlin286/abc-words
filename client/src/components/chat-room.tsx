"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { LIMITS } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { VisibilityBadge } from "./room-list";

export default function ChatRoom() {
  const room = useRoomStore((s) => s.room);
  const me = useAuthStore((s) => s.user);
  const messages = useRoomStore((s) => s.messages);
  const error = useRoomStore((s) => s.error);
  const sendMessage = useRoomStore((s) => s.sendMessage);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const connection = useRoomStore((s) => s.connection);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!room || !me) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    if (await sendMessage(value)) setText("");
    setSending(false);
  };

  return (
    <div className="flex h-[min(640px,calc(100dvh-3rem))] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm sm:flex-row dark:border-zinc-800 dark:bg-zinc-950">
      {/* Sidebar: room info + members */}
      <aside className="space-y-4 border-b border-zinc-200 p-4 sm:w-56 sm:border-r sm:border-b-0 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500">Kode room</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-semibold tracking-widest">{room.id}</span>
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => copyText(room.id)}
            >
              salin
            </button>
          </div>
          <div className="mt-1">
            <VisibilityBadge isPrivate={room.hasPassword} />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-zinc-500">Pemain ({room.members.length})</p>
          <ul className="space-y-1 text-sm">
            {room.members.map((m) => (
              <li key={m.userId} className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${m.isConnected ? "bg-emerald-500" : "bg-zinc-400"}`}
                  title={m.isConnected ? "online" : "terputus — menunggu sambung ulang"}
                />
                <span className={`truncate ${m.isConnected ? "" : "text-zinc-400"}`}>{m.name}</span>
                {m.userId === me.userId && <span className="text-xs text-zinc-400">(kamu)</span>}
                {m.userId === room.hostId && <span title="Host">👑</span>}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={leaveRoom}
        >
          Keluar room
        </button>
      </aside>

      {/* Chat */}
      <section className="flex min-h-0 flex-1 flex-col">
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

        <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
          <input
            className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={LIMITS.message}
            placeholder="Tulis pesan…"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Kirim
          </button>
        </form>
      </section>
    </div>
  );
}
