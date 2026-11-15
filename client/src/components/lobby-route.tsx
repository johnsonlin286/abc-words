"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { RoomSummary } from "@/shared/contract";
import { useRoomStore } from "@/stores/room-store";
import ConnectingNotice from "./connecting-notice";
import Lobby from "./lobby";

/** The lobby on the home page, for anyone not currently in a room. */
export default function LobbyRoute({
  initialRoom = null,
  onInitialRoomUsed,
}: {
  initialRoom?: RoomSummary | null;
  onInitialRoomUsed?: () => void;
}) {
  const router = useRouter();
  const ready = useRoomStore((s) => s.ready);
  const roomId = useRoomStore((s) => s.roomId);

  // Being in a room always means being on its page: after creating/joining one,
  // and when opening the lobby in a tab while already in a room. `replace` so that
  // Back doesn't land on a lobby that would immediately redirect again.
  useEffect(() => {
    if (roomId) router.replace(`/room/${roomId}`);
  }, [roomId, router]);

  return ready && !roomId ? (
    <Lobby initialRoom={initialRoom} onInitialRoomUsed={onInitialRoomUsed} />
  ) : (
    <ConnectingNotice />
  );
}
