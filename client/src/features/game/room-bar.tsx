"use client";

import { useState } from "react";
import { VisibilityBadge } from "@/components/room-list";
import { copyText } from "@/lib/clipboard";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import RulesDialog from "./rules-dialog";

const actionClass = "text-sm text-chalk-dim underline-offset-2 hover:text-chalk hover:underline";

export default function RoomBar({ room }: { room: GameRoomView }) {
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = async (kind: "code" | "link", value: string) => {
    if (!(await copyText(value))) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <h1 className="text-3xl font-semibold tracking-[0.15em] text-chalk">
        <span className="sr-only">Kode room </span>
        {room.id}
      </h1>
      <VisibilityBadge isPrivate={room.hasPassword} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:ml-auto">
        <RulesDialog className={actionClass} />
        <button type="button" className={actionClass} onClick={() => copy("code", room.id)}>
          {copied === "code" ? "Kode tersalin" : "Salin kode"}
        </button>
        <button
          type="button"
          className={actionClass}
          onClick={() => copy("link", `${window.location.origin}/room/${room.id}`)}
        >
          {copied === "link" ? "Link tersalin" : "Salin link undangan"}
        </button>
        <button type="button" className={actionClass} onClick={leaveRoom}>
          Keluar room
        </button>
      </div>
    </header>
  );
}
