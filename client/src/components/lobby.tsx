"use client";

import { useEffect, useRef, useState } from "react";
import { linkButton, notice as noticeClass } from "@/components/ui";
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

/** Signed in, not in a room: create one, join by code, or pick an open room. */
export default function Lobby({
  initialRoom = null,
  onInitialRoomUsed,
}: {
  /** A room picked before signing in; opened once. */
  initialRoom?: RoomSummary | null;
  /** Called once `initialRoom` has been taken, so leaving the room later doesn't rejoin it. */
  onInitialRoomUsed?: () => void;
}) {
  const clearError = useRoomStore((s) => s.clearError);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const signOut = useRoomStore((s) => s.signOut);
  const connection = useRoomStore((s) => s.connection);
  const roomNotice = useRoomStore((s) => s.notice);
  const user = useAuthStore((s) => s.user);

  // A private room picked before signing in opens straight on its join form.
  const startPrivate = initialRoom?.hasPassword ? initialRoom : null;
  const [tab, setTab] = useState<Tab>(startPrivate ? "join" : "create");
  const [code, setCode] = useState(startPrivate?.id ?? "");
  const [codeLocked, setCodeLocked] = useState(false);
  const [selectionId, setSelectionId] = useState(startPrivate ? 1 : 0);
  const [notice, setNotice] = useState<string | null>(
    startPrivate ? `Kode ${startPrivate.id} sudah diisi. Masukkan kata sandinya.` : null,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const switchTab = (next: Tab) => {
    setTab(next);
    clearError();
  };

  const selectRoom = async (room: RoomSummary) => {
    switchTab("join");
    setCode(room.id);
    setSelectionId((n) => n + 1);

    if (room.hasPassword) {
      // Private: copy the code and show it in the (editable) code field.
      setCodeLocked(false);
      const copied = await copyText(room.id);
      setNotice(`Kode ${room.id} ${copied ? "disalin dan " : ""}sudah diisi. Masukkan kata sandinya.`);
    } else {
      // Public: only the name is needed.
      setCodeLocked(true);
      setNotice(null);
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // A public room picked before signing in is joined right away (the page then moves to the room).
  const openedInitial = useRef(false);
  useEffect(() => {
    if (!initialRoom || openedInitial.current) return;
    openedInitial.current = true;
    onInitialRoomUsed?.();
    if (initialRoom.hasPassword) return; // already open on its join form (initial state above)
    void joinRoom({ roomId: initialRoom.id }).then((joined) => {
      if (!joined) void selectRoom(initialRoom); // e.g. the room just filled up: show why
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only once, for the room picked before sign-in
  }, [initialRoom]);

  return (
    <div className="flex w-full flex-col gap-8">
      <div ref={cardRef} className="note-card flex w-full max-w-md scroll-mt-6 flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-2xl font-bold">Halo, {user?.name}</h2>
          <button type="button" onClick={signOut} className={`${linkButton} text-sm`}>
            Ganti nama
          </button>
        </div>

        {connection === "reconnecting" && <p className={noticeClass}>Menghubungkan ulang ke server…</p>}
        {roomNotice && <p className={noticeClass}>{roomNotice}</p>}

        <div role="tablist" aria-label="Cara masuk room" className="grid grid-cols-2 gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => switchTab(t.id)}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen ${
                tab === t.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/30 bg-white text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex flex-col gap-4">
          {tab === "join" && notice && <p className={noticeClass}>{notice}</p>}
          {tab === "create" ? (
            <CreateRoomForm />
          ) : (
            <JoinRoomForm
              code={code}
              onCodeChange={(value) => {
                setCode(value);
                setNotice(null);
                // An old "wrong password" or "room full" doesn't belong to the new code.
                clearError();
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
      </div>

      <RoomList
        onSelect={selectRoom}
        onCreate={() => {
          switchTab("create");
          cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          // The create form mounts on this render; focus its first field once it's there.
          requestAnimationFrame(() =>
            cardRef.current?.querySelector<HTMLElement>('[role="tabpanel"] input, [role="tabpanel"] button')?.focus({ preventScroll: true }),
          );
        }}
      />
    </div>
  );
}
