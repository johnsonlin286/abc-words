"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRoomStore } from "@/stores/room-store";
import ChatRoom from "./chat-room";
import ConnectingNotice from "./connecting-notice";
import RoomInvite from "./room-invite";

/** /room/[code]: the URL says which room is wanted, the server decides what the user gets. */
export default function RoomRoute() {
  const { code: rawCode } = useParams<{ code: string }>();
  const code = rawCode.toUpperCase();
  const router = useRouter();

  const ready = useRoomStore((s) => s.ready);
  const roomId = useRoomStore((s) => s.roomId);
  const roomLoaded = useRoomStore((s) => s.room?.id === code);

  const isMember = roomId === code;
  // Separates "just left / was kicked / room closed" (go to the lobby) from
  // "opened an invite link" (show the join form); both have no current room.
  const [wasMember, setWasMember] = useState(false);
  if (isMember && !wasMember) setWasMember(true);

  let redirectTo: string | null = null;
  if (ready && roomId === null && wasMember) redirectTo = "/";
  else if (roomId !== null && !isMember) redirectTo = `/room/${roomId}`; // one room per user

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!ready || redirectTo || (isMember && !roomLoaded)) return <ConnectingNotice />;
  return isMember ? <ChatRoom /> : <RoomInvite code={code} />;
}
