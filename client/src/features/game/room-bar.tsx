"use client";

import { Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { VisibilityBadge } from "@/components/room-list";
import { copyText } from "@/lib/clipboard";
import type { GameRoomView } from "@/stores/room-store";
import EndGameDialog from "./end-game-dialog";
import LeaveRoomDialog from "./leave-room-dialog";
import RulesDialog from "./rules-dialog";

const action =
  "inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-ink underline decoration-highlight decoration-2 underline-offset-4 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen";

/** `canEnd`: the host, while a game is running. `playing`: a game is running (leaving asks first). */
export default function RoomBar({ room, canEnd, playing }: { room: GameRoomView; canEnd: boolean; playing: boolean }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = async (kind: "code" | "link", value: string) => {
    if (!(await copyText(value))) return;
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl leading-none font-bold tracking-[0.12em] tabular-nums">
          <span className="sr-only">Kode room </span>
          {room.id}
        </h1>
        <VisibilityBadge isPrivate={room.hasPassword} />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <RulesDialog className={action} />
        <button type="button" className={action} onClick={() => copy("code", room.id)}>
          <Copy aria-hidden className="size-4" strokeWidth={2.5} />
          {copied === "code" ? "Kode Tersalin" : "Salin Kode"}
        </button>
        <button type="button" className={action} onClick={() => copy("link", `${window.location.origin}/room/${room.id}`)}>
          <Link2 aria-hidden className="size-4" strokeWidth={2.5} />
          {copied === "link" ? "Link Tersalin" : "Salin Link Undangan"}
        </button>
        <LeaveRoomDialog className={`${action} text-redpen decoration-redpen/30 hover:decoration-redpen`} playing={playing} />
        {canEnd && <EndGameDialog className={`${action} text-redpen decoration-redpen/30 hover:decoration-redpen`} />}
      </div>
    </header>
  );
}
