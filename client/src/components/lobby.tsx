"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { RoomSummary } from "@/shared/contract";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import CreateRoomForm from "./create-room-form";
import JoinRoomForm from "./join-room-form";
import RoomList from "./room-list";

type Tab = "create" | "join";

const TABS: { id: Tab; label: string }[] = [
  { id: "create", label: "Buat room" },
  { id: "join", label: "Gabung room" },
];

export default function Lobby() {
  const clearError = useRoomStore((s) => s.clearError);
  const signOut = useRoomStore((s) => s.signOut);
  const connection = useRoomStore((s) => s.connection);
  const roomNotice = useRoomStore((s) => s.notice);
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<Tab>("create");
  const [code, setCode] = useState("");
  const [codeLocked, setCodeLocked] = useState(false);
  const [selectionId, setSelectionId] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const switchTab = (next: Tab) => {
    setTab(next);
    clearError();
  };

  const handleSelectRoom = async (room: RoomSummary) => {
    switchTab("join");
    setCode(room.id);
    setSelectionId((n) => n + 1);

    if (room.hasPassword) {
      // Private: copy the code and show it in the (editable) code field.
      setCodeLocked(false);
      const copied = await copyText(room.id);
      setNotice(
        `Kode ${room.id} ${copied ? "disalin & " : ""}sudah diisi. Masukkan kata sandi untuk bergabung.`,
      );
    } else {
      // Public: only the name is needed.
      setCodeLocked(true);
      setNotice(null);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-xl font-semibold">ABC Words</h1>
          <p className="text-sm text-zinc-500">
            Halo, <span className="font-medium text-zinc-800 dark:text-zinc-200">{user?.name}</span>
            {" · "}
            <button type="button" onClick={signOut} className="text-blue-600 hover:underline">
              ganti nama
            </button>
          </p>
          {connection === "reconnecting" && (
            <p className="mt-1 text-xs text-amber-600">Menghubungkan ulang ke server…</p>
          )}
          {roomNotice && (
            <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {roomNotice}
            </p>
          )}
        </div>

        <div role="tablist" className="grid grid-cols-2 rounded-md bg-zinc-100 p-1 text-sm dark:bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => switchTab(t.id)}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                tab === t.id
                  ? "bg-white shadow-sm dark:bg-zinc-800"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "join" && notice && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            {notice}
          </p>
        )}

        {tab === "create" ? (
          <CreateRoomForm />
        ) : (
          <JoinRoomForm
            code={code}
            onCodeChange={(value) => {
              setCode(value);
              setNotice(null);
            }}
            codeLocked={codeLocked}
            onUnlockCode={() => {
              setCodeLocked(false);
              setCode("");
            }}
            selectionId={selectionId}
          />
        )}
      </div>

      <RoomList onSelect={handleSelectRoom} />
    </div>
  );
}
